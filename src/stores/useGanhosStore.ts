import { create } from 'zustand';
import apiClient from '@/lib/api';
import { startOfDay, startOfWeek, addDays } from 'date-fns';

type ResumoGanhos = {
    totalHoje: number;
    totalSemana: number;
    totalMes: number;
    comparacaoSemana: number;
    comparacaoMes: number;
    clientesAtivos: number;
    novosClientes: number;
};

type GanhosState = {
    resumo: ResumoGanhos;
    isLoading: boolean;
    appointments: any[];

    carregarResumo: (periodo?: 'hoje' | 'semana' | 'mes') => Promise<void>;
};

export const useGanhosStore = create<GanhosState>((set) => ({
    resumo: {
        totalHoje: 0,
        totalSemana: 0,
        totalMes: 0,
        comparacaoSemana: 0,
        comparacaoMes: 0,
        clientesAtivos: 0,
        novosClientes: 0,
    },
    appointments: [],
    isLoading: false,

    carregarResumo: async () => {
        set({ isLoading: true });
        
        try {
            const res = await apiClient.get('/appointments', {
                params: { limit: 500, populate: 'serviceType' }
            });
            const appointmentsList = res.data.results || [];
            
            const now = new Date();
            const todayStart = startOfDay(now);
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            let totalHoje = 0;
            let totalSemana = 0;
            let totalMes = 0;

            const clientesUnicos = new Set<string>();
            const clientesDeHoje = new Set<string>();

            appointmentsList.forEach((a: any) => {
                if (a.status !== 'Cancelled') {
                    const price = Number(a.serviceType?.price || 0);
                    const dt = new Date(a.appointmentDateTime);
                    
                    const clientIdentifier = a.userId || a.contactNumber || a.email || a.id;
                    clientesUnicos.add(clientIdentifier);

                    if (dt >= monthStart) totalMes += price;
                    if (dt >= weekStart) totalSemana += price;
                    if (dt >= todayStart && dt < addDays(todayStart, 1)) {
                        totalHoje += price;
                        clientesDeHoje.add(clientIdentifier);
                    }
                }
            });

            set({
                resumo: {
                    totalHoje,
                    totalSemana,
                    totalMes,
                    comparacaoSemana: 0, // Placeholder for future complex analytics
                    comparacaoMes: 0,
                    clientesAtivos: clientesUnicos.size,
                    novosClientes: clientesDeHoje.size,
                },
                appointments: appointmentsList,
                isLoading: false
            });
        } catch (error) {
            console.error("Falha ao carregar ganhos:", error);
            set({ isLoading: false });
        }
    },
}));
