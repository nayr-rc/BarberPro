import { create } from 'zustand';

export type Cliente = {
    id: string;
    nome: string;
    telefone: string;
    email?: string;
    totalCortes: number;
    ultimoAgendamento: string;
};

type ClientesState = {
    clientes: Cliente[];
    clienteSelecionado: Cliente | null;
    busca: string;

    carregarClientes: () => void;
    buscarClientes: (termo: string) => void;
    selecionarCliente: (cliente: Cliente | null) => void;
    adicionarCliente: (novo: Omit<Cliente, 'id'>) => void;
};

export const useClientesStore = create<ClientesState>((set) => ({
    clientes: [],
    clienteSelecionado: null,
    busca: '',

    carregarClientes: () => {
        const mock: Cliente[] = [
            { id: '1', nome: 'João Silva', telefone: '(71) 99999-8888', totalCortes: 12, ultimoAgendamento: '2026-02-28' },
            { id: '2', nome: 'Maria Oliveira', telefone: '(71) 98888-7777', totalCortes: 5, ultimoAgendamento: '2026-03-01' },
        ];
        set({ clientes: mock });
    },

    buscarClientes: (termo) => {
        set({ busca: termo });
    },

    selecionarCliente: (cliente) => set({ clienteSelecionado: cliente }),

    adicionarCliente: (novo) => set((state) => ({
        clientes: [...state.clientes, { ...novo, id: Date.now().toString() }],
    })),
}));
