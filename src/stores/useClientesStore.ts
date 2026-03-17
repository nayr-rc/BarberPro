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
        set({ clientes: [] });
    },

    buscarClientes: (termo) => {
        set({ busca: termo });
    },

    selecionarCliente: (cliente) => set({ clienteSelecionado: cliente }),

    adicionarCliente: (novo) => set((state) => ({
        clientes: [...state.clientes, { ...novo, id: Date.now().toString() }],
    })),
}));
