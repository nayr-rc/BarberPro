import { create } from 'zustand';
import { api } from '../lib/api';

type ResumoGanhos = {
  totalHoje: number;
  totalSemana: number;
  totalMes: number;
};

type GanhosState = {
  resumo: ResumoGanhos;
  isLoading: boolean;
  carregarResumo: (userId: string) => Promise<void>;
};

export const useGanhosStore = create<GanhosState>((set) => ({
  resumo: {
    totalHoje: 0,
    totalSemana: 0,
    totalMes: 0,
  },
  isLoading: false,

  carregarResumo: async (userId: string) => {
    set({ isLoading: true });
    
    try {
      const res = await api.get('/appointments', {
        params: { limit: 500, populate: 'serviceType' }
      });
      const appointmentsList = res.data.results || [];
      
      const now = new Date();
      
      // Calculate start of day
      const todayStart = new Date(now);
      todayStart.setHours(0,0,0,0);
      
      // Calculate start of week (assuming Monday as start)
      const dayOfWeek = now.getDay();
      const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(todayStart);
      weekStart.setDate(todayStart.getDate() - distanceToMonday);

      // Calculate start of month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalHoje = 0;
      let totalSemana = 0;
      let totalMes = 0;

      appointmentsList.forEach((a: any) => {
        if (a.status !== 'Cancelled') {
          const price = Number(a.serviceType?.price || 0);
          const dt = new Date(a.appointmentDateTime);
          
          if (dt >= monthStart) totalMes += price;
          if (dt >= weekStart) totalSemana += price;
          // Check if appointment is today
          const isToday = dt.getFullYear() === todayStart.getFullYear() &&
                          dt.getMonth() === todayStart.getMonth() &&
                          dt.getDate() === todayStart.getDate();
                          
          if (isToday) {
            totalHoje += price;
          }
        }
      });

      set({
        resumo: { totalHoje, totalSemana, totalMes },
        isLoading: false
      });
    } catch (error) {
      console.error('Falha ao carregar ganhos:', error);
      set({ isLoading: false });
    }
  },
}));
