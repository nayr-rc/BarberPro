import { create } from 'zustand';

export type Agendamento = {
    id: string;
    cliente: string;
    servico: string;
    data: string; // YYYY-MM-DD
    hora: string; // HH:mm
    status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
    valor: number;
};

type AgendaState = {
    agendamentos: Agendamento[];
    agendamentosHoje: Agendamento[];
    isLoading: boolean;

    carregarAgendamentos: (data?: string) => void;
    adicionarAgendamento: (novo: Omit<Agendamento, 'id'>) => void;
    atualizarStatus: (id: string, status: Agendamento['status']) => void;
    removerAgendamento: (id: string) => void;
    setLoading: (loading: boolean) => void;
};

export const useAgendaStore = create<AgendaState>((set) => ({
    agendamentos: [],
    agendamentosHoje: [],
    isLoading: false,

    carregarAgendamentos: (data = new Date().toISOString().split('T')[0]) => {
        set({ isLoading: true });
        // Simular chamada vazia enquanto a API real não for conectada
        setTimeout(() => {
            set({ agendamentos: [], agendamentosHoje: [], isLoading: false });
        }, 600);
    },

    adicionarAgendamento: (novo) => set((state) => ({
        agendamentos: [...state.agendamentos, { ...novo, id: Date.now().toString() }],
        agendamentosHoje: novo.data === new Date().toISOString().split('T')[0]
            ? [...state.agendamentosHoje, { ...novo, id: Date.now().toString() }]
            : state.agendamentosHoje
    })),

    atualizarStatus: (id, status) => set((state) => ({
        agendamentos: state.agendamentos.map(a => a.id === id ? { ...a, status } : a),
        agendamentosHoje: state.agendamentosHoje.map(a => a.id === id ? { ...a, status } : a),
    })),

    removerAgendamento: (id) => set((state) => ({
        agendamentos: state.agendamentos.filter(a => a.id !== id),
        agendamentosHoje: state.agendamentosHoje.filter(a => a.id !== id),
    })),

    setLoading: (loading) => set({ isLoading: loading }),
}));
