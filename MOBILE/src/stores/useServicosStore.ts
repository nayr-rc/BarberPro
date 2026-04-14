import { create } from 'zustand';
import { api } from '../lib/api';

export type Service = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
};

type ServicosState = {
  services: Service[];
  isLoading: boolean;
  carregarServicos: () => Promise<void>;
  adicionarServico: (data: Partial<Service>) => Promise<void>;
  atualizarServico: (id: string, data: Partial<Service>) => Promise<void>;
  removerServico: (id: string) => Promise<void>;
};

export const useServicosStore = create<ServicosState>((set, get) => ({
  services: [],
  isLoading: false,

  carregarServicos: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/services');
      set({ services: res.data.results || [], isLoading: false });
    } catch (error) {
      console.error('Falha ao carregar serviços:', error);
      set({ isLoading: false });
    }
  },

  adicionarServico: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/services', data);
      const newService = res.data;
      set({ services: [...get().services, newService], isLoading: false });
    } catch (error) {
      console.error('Falha ao adicionar serviço:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  atualizarServico: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await api.patch(`/services/${id}`, data);
      const updated = res.data;
      set({
        services: get().services.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      });
    } catch (error) {
      console.error('Falha ao atualizar serviço:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  removerServico: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/services/${id}`);
      set({
        services: get().services.filter((s) => s.id !== id),
        isLoading: false,
      });
    } catch (error) {
      console.error('Falha ao remover serviço:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));
