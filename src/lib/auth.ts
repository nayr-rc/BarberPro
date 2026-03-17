import apiClient from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "client" | "admin";
  };
}

export async function login(data: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
}

export async function register(data: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/register", data);
  return response.data;
}

export async function logout(): Promise<void> {
  localStorage.removeItem("barberpro-auth");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
