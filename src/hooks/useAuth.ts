import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // for compatibility
  email: string;
  role: "admin" | "barber";
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
    }
  )
);
