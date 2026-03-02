import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  // Priority: Try to get token from Zustand store first, then fallback to manual token key
  let token = null;
  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("barberpro-auth");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      } catch (e) {
        console.error("Error parsing auth storage", e);
      }
    }

    // Fallback/Legacy
    if (!token) {
      token = localStorage.getItem("token");
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
