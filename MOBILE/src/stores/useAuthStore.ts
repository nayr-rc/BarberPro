import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { api, setAuthToken } from '../lib/api';
import { AuthUser, LoginResponse } from '../types/auth';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

const STORAGE_KEY = 'barberpro-mobile-auth';

const parseTokenFromResponse = (data: LoginResponse): string | null => {
  if (data.token) return data.token;
  if (data.tokens?.access?.token) return data.tokens.access.token;
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        set({ isHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as { user: AuthUser; token: string };
      setAuthToken(parsed.token);
      set({ user: parsed.user, token: parsed.token, isHydrated: true });
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ user: null, token: null, isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const data = response.data;
      const token = parseTokenFromResponse(data);

      if (!token || !data.user) {
        throw new Error('Resposta de autenticação inválida');
      }

      setAuthToken(token);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: data.user, token }));
      set({ user: data.user, token, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    set({ user: null, token: null, error: null });
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/forgot-password', { email });
      set({ isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar e-mail de recuperação.';
      set({ isLoading: false, error: message });
      throw err;
    }
  },
}));
