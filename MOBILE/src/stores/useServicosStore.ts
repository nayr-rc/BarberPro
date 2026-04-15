import { create } from 'zustand';
import { api } from '../lib/api';

export type Service = {
  id: string;
  name: string;       // maps to API field "title"
  description?: string;
  price: number;
  duration: number;   // maps to API field "durationMinutes"
};

type ServicosState = {
  services: Service[];
  isLoading: boolean;
  carregarServicos: () => Promise<void>;
  adicionarServico: (data: Partial<Service>) => Promise<void>;
  atualizarServico: (id: string, data: Partial<Service>) => Promise<void>;
  removerServico: (id: string) => Promise<void>;
};

// Map API response (uses "title" and "durationMinutes") to our internal format
const mapService = (raw: Record<string, unknown>): Service => ({
  id: String(raw.id ?? raw._id ?? ''),
  name: String(raw.title ?? raw.name ?? ''),
  description: raw.description ? String(raw.description) : undefined,
  price: Number(raw.price ?? 0),
  duration: Number(raw.durationMinutes ?? raw.duration ?? 30),
});

// Map our format to API payload (uses "title" and "durationMinutes")
const toApiPayload = (data: Partial<Service>) => ({
  ...(data.name !== undefined && { title: data.name }),
  ...(data.description !== undefined && { description: data.description }),
  ...(data.price !== undefined && { price: data.price }),
  ...(data.duration !== undefined && { durationMinutes: data.duration }),
});

export const useServicosStore = create<ServicosState>((set, get) => ({
  services: [],
  isLoading: false,

  carregarServicos: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/services', { params: { limit: 100 } });
      const results = (res.data.results || []) as Record<string, unknown>[];
      set({ services: results.map(mapService), isLoading: false });
    } catch (error) {
      console.error('Falha ao carregar serviços:', error);
      set({ isLoading: false });
    }
  },

  adicionarServico: async (data) => {
    set({ isLoading: true });
    try {
      const payload = toApiPayload(data);
      // description is required by the API — use empty string if not provided
      if (!payload.description) payload.description = ' ';
      const res = await api.post('/services', payload);
      const newService = mapService(res.data as Record<string, unknown>);
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
      const res = await api.patch(`/services/${id}`, toApiPayload(data));
      const updated = mapService(res.data as Record<string, unknown>);
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
