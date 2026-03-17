import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SubscriptionStatus = 'pending' | 'active' | 'expired';

export type User = {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: 'barber' | 'user' | 'admin';
    avatar?: string;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionExpiresAt?: string | null;
};

type AuthState = {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasHydrated: boolean;

    login: (user: User, token: string, refreshToken?: string | null) => void;
    setTokens: (token: string, refreshToken?: string | null) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setHasHydrated: (state: boolean) => void;
    isSubscriptionActive: () => boolean;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isLoading: false,
            isAuthenticated: false,
            hasHydrated: false,

            login: (user, token, refreshToken = null) =>
                set({ user, token, refreshToken, isLoading: false, isAuthenticated: true }),
            setTokens: (token, refreshToken) =>
                set((state) => ({
                    token,
                    refreshToken: refreshToken ?? state.refreshToken,
                    isAuthenticated: Boolean(state.user),
                })),
            logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
            setLoading: (loading) => set({ isLoading: loading }),
            setHasHydrated: (state) => set({ hasHydrated: state }),

            isSubscriptionActive: () => {
                const { user } = get();
                if (!user) return false;
                if (user.role === 'admin') return true;
                if (user.subscriptionStatus !== 'active') return false;
                if (user.subscriptionExpiresAt) {
                    return new Date(user.subscriptionExpiresAt) > new Date();
                }
                return false;
            },
        }),
        {
            name: 'barberpro-auth',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            },
        }
    )
);
