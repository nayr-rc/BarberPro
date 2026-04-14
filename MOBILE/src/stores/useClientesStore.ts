import { create } from 'zustand';
import { api } from '../lib/api';

export type Cliente = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

type ClientesState = {
  clientes: Cliente[];
  isLoading: boolean;
  carregarClientes: () => Promise<void>;
};

export const useClientesStore = create<ClientesState>((set) => ({
  clientes: [],
  isLoading: false,

  carregarClientes: async () => {
    set({ isLoading: true });
    try {
      // Typically users with role 'user' are clients
      const res = await api.get('/users', { params: { role: 'user' } });
      set({ clientes: res.data.results || [], isLoading: false });
    } catch (error) {
      console.error('Falha ao carregar clientes:', error);
      set({ isLoading: false });
    }
  },
}));
