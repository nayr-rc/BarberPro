export type UserRole = 'admin' | 'barber' | 'customer' | 'client';

export type AuthUser = {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  user: AuthUser;
  token?: string;
  tokens?: {
    access?: {
      token?: string;
      expires?: string;
    };
    refresh?: {
      token?: string;
      expires?: string;
    };
  };
};
