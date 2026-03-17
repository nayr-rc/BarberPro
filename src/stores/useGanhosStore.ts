import { create } from 'zustand';

type ResumoGanhos = {
    totalHoje: number;
    totalSemana: number;
    totalMes: number;
    comparacaoSemana: number; // %
    comparacaoMes: number;
};

type GanhosState = {
    resumo: ResumoGanhos;
    isLoading: boolean;

    carregarResumo: (periodo?: 'hoje' | 'semana' | 'mes') => void;
};

export const useGanhosStore = create<GanhosState>((set) => ({
    resumo: {
        totalHoje: 0,
        totalSemana: 0,
        totalMes: 0,
        comparacaoSemana: 0,
        comparacaoMes: 0,
    },
    isLoading: false,

    carregarResumo: (periodo = 'semana') => {
        set({ isLoading: true });
        setTimeout(() => {
            set({
                resumo: {
                    totalHoje: 0,
                    totalSemana: 0,
                    totalMes: 0,
                    comparacaoSemana: 0,
                    comparacaoMes: 0,
                },
                isLoading: false,
            });
        }, 500);
    },
}));
