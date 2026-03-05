import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://barberpro-api-v4kj.onrender.com/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type PersistedAuthState = {
  state?: {
    token?: string | null;
    refreshToken?: string | null;
  };
};

const getPersistedAuth = (): PersistedAuthState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("barberpro-auth");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    return null;
  }
};

const getAccessToken = () => {
  const persisted = getPersistedAuth();
  const token = persisted?.state?.token;
  if (token) {
    return token;
  }

  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }

  return null;
};

const getRefreshToken = () => {
  const persisted = getPersistedAuth();
  return persisted?.state?.refreshToken || null;
};

// Adiciona token às requisições
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const flushPendingRequests = (error: unknown, token?: string) => {
  pendingRequests.forEach((request) => {
    if (error || !token) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  pendingRequests = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    const status = error.response?.status;
    const url = String(originalRequest?.url || "");
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh-tokens") ||
      url.includes("/auth/logout");

    if (status !== 401 || originalRequest?._retry || isAuthRoute) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/auth/refresh-tokens`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAccessToken = refreshResponse.data?.access?.token;
      const newRefreshToken = refreshResponse.data?.refresh?.token;

      if (!newAccessToken) {
        throw new Error("Falha ao renovar token de acesso");
      }

      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);
      flushPendingRequests(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushPendingRequests(refreshError);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
