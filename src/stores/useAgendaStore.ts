import { create } from 'zustand';
import apiClient from '@/lib/api';
import { format, parseISO } from 'date-fns';

export type Agendamento = {
    id: string;
    cliente: string;
    servico: string;
    data: string;   // YYYY-MM-DD
    hora: string;   // HH:mm
    status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
    valor: number;
    telefone?: string;
};

// Mapeia o status vindo da API (inglês) para o padrão interno (português)
const normalizeStatus = (apiStatus: string): Agendamento['status'] => {
    const map: Record<string, Agendamento['status']> = {
        Upcoming: 'confirmado',
        Past: 'concluido',
        Cancelled: 'cancelado',
        pending: 'pendente',
        confirmed: 'confirmado',
        done: 'concluido',
        cancelled: 'cancelado',
    };
    return map[apiStatus] ?? 'confirmado';
};

// Converte um agendamento bruto da API para o tipo interno
const mapApiAppointment = (raw: Record<string, unknown>): Agendamento => {
    const datetime = raw.appointmentDateTime as string;
    const parsedDate = parseISO(datetime);
    const data = format(parsedDate, 'yyyy-MM-dd');
    const hora = format(parsedDate, 'HH:mm');

    const serviceType = raw.serviceType as Record<string, unknown> | null;
    const servico = serviceType
        ? String(serviceType.title ?? 'Serviço')
        : String(raw.serviceTypeName ?? raw.serviceName ?? 'Serviço');

    const priceRaw = serviceType?.price ?? raw.servicePrice ?? 0;
    const valor = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw);

    const firstName = String(raw.firstName ?? '');
    const lastName = String(raw.lastName ?? '');
    const cliente = `${firstName} ${lastName}`.trim() || 'Cliente';

    return {
        id: String(raw.id),
        cliente,
        servico,
        data,
        hora,
        status: normalizeStatus(String(raw.status ?? 'Upcoming')),
        valor,
        telefone: String(raw.contactNumber ?? ''),
    };
};

type AgendaState = {
    agendamentos: Agendamento[];
    agendamentosHoje: Agendamento[];
    isLoading: boolean;
    error: string | null;

    carregarAgendamentos: (data?: string) => Promise<void>;
    adicionarAgendamento: (novo: Omit<Agendamento, 'id'>) => void;
    atualizarStatus: (id: string, status: Agendamento['status']) => void;
    removerAgendamento: (id: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
};

export const useAgendaStore = create<AgendaState>((set, get) => ({
    agendamentos: [],
    agendamentosHoje: [],
    isLoading: false,
    error: null,

    carregarAgendamentos: async (data?: string) => {
        set({ isLoading: true, error: null });

        try {
            // Descobre o barbeiro logado a partir do localStorage
            let barberId: string | null = null;
            if (typeof window !== 'undefined') {
                const authRaw = localStorage.getItem('barberpro-auth');
                if (authRaw) {
                    const parsed = JSON.parse(authRaw);
                    barberId = parsed?.state?.user?.id ?? null;
                }
            }

            if (!barberId) {
                set({ agendamentos: [], agendamentosHoje: [], isLoading: false });
                return;
            }

            // Monta query params: filtra pelo barbeiro e carrega 100 agendamentos
            const params: Record<string, string> = {
                preferredHairdresserId: barberId,
                limit: '100',
                sortBy: 'appointmentDateTime:asc',
                populate: 'serviceType',
            };

            const res = await apiClient.get('/appointments', { params });
            const results: Record<string, unknown>[] = res.data?.results ?? [];
            const todos = results.map(mapApiAppointment);

            const hoje = format(new Date(), 'yyyy-MM-dd');
            const filtroData = data ?? hoje;

            const agendamentosHoje = todos.filter((a) => a.data === hoje);
            // quando uma data específica é passada, mantemos todos para o filtro na página
            const agendamentos = filtroData !== hoje
                ? todos.filter((a) => a.data === filtroData)
                : todos;

            set({ agendamentos, agendamentosHoje, isLoading: false });
        } catch (err) {
            console.error('[useAgendaStore] Erro ao carregar agendamentos:', err);
            const message = err instanceof Error ? err.message : 'Erro ao carregar agendamentos.';
            set({ error: message, isLoading: false });
        }
    },

    adicionarAgendamento: (novo) =>
        set((state) => {
            const novo_id = { ...novo, id: Date.now().toString() };
            const hoje = format(new Date(), 'yyyy-MM-dd');
            return {
                agendamentos: [...state.agendamentos, novo_id],
                agendamentosHoje:
                    novo.data === hoje
                        ? [...state.agendamentosHoje, novo_id]
                        : state.agendamentosHoje,
            };
        }),

    atualizarStatus: (id, status) =>
        set((state) => ({
            agendamentos: state.agendamentos.map((a) =>
                a.id === id ? { ...a, status } : a
            ),
            agendamentosHoje: state.agendamentosHoje.map((a) =>
                a.id === id ? { ...a, status } : a
            ),
        })),

    removerAgendamento: async (id) => {
        try {
            await apiClient.delete(`/appointments/${id}`);
        } catch (err) {
            console.warn('[useAgendaStore] Falha ao deletar no servidor, removendo localmente.', err);
        }
        set((state) => ({
            agendamentos: state.agendamentos.filter((a) => a.id !== id),
            agendamentosHoje: state.agendamentosHoje.filter((a) => a.id !== id),
        }));
    },

    setLoading: (loading) => set({ isLoading: loading }),
}));
