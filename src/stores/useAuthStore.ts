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
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (user: User, token: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    isSubscriptionActive: () => boolean;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,

            login: (user, token) => set({ user, token, isLoading: false, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            setLoading: (loading) => set({ isLoading: loading }),

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
        }
    )
);
