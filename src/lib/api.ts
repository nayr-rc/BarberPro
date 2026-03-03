import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://barberpro-api-v4kj.onrender.com/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Adiciona token às requisições
apiClient.interceptors.request.use((config) => {
  // Prioridade: tenta obter do Zustand primeiro e depois usa fallback legado
  let token = null;
  if (typeof window !== "undefined") {
    const authStorage = localStorage.getItem("barberpro-auth");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      } catch (e) {
        console.error("Erro ao ler dados de autenticação", e);
      }
    }

    // Fallback legado
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
