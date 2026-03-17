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

const toDateTime = (agendamento: Agendamento): Date => {
    const parsed = new Date(`${agendamento.data}T${agendamento.hora}:00`);
    return parsed;
};

const isVisibleInBarberList = (agendamento: Agendamento): boolean => {
    if (agendamento.status === 'concluido' || agendamento.status === 'cancelado') {
        return false;
    }

    const dateTime = toDateTime(agendamento);
    if (Number.isNaN(dateTime.getTime())) {
        return true;
    }

    return dateTime.getTime() > Date.now();
};

const applyVisibilityRules = (list: Agendamento[]): Agendamento[] => {
    return list.filter(isVisibleInBarberList);
};

// Mapeia o status da API (inglês) para o padrão interno (pt-BR)
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

const toApiStatus = (status: Agendamento['status']): 'Upcoming' | 'Past' | 'Cancelled' => {
    const map: Record<Agendamento['status'], 'Upcoming' | 'Past' | 'Cancelled'> = {
        pendente: 'Upcoming',
        confirmado: 'Upcoming',
        concluido: 'Past',
        cancelado: 'Cancelled',
    };
    return map[status];
};

const mapApiAppointment = (raw: Record<string, unknown>): Agendamento => {
    const datetime = raw.appointmentDateTime as string;
    let data = '';
    let hora = '';
    try {
        const parsedDate = parseISO(datetime);
        data = format(parsedDate, 'yyyy-MM-dd');
        hora = format(parsedDate, 'HH:mm');
    } catch {
        data = datetime?.slice(0, 10) ?? '';
        hora = datetime?.slice(11, 16) ?? '';
    }

    const serviceType = raw.serviceType as Record<string, unknown> | null | undefined;
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

/** Lê o barberId e token do usuário logado no localStorage */
const getAuthInfo = (): { barberId: string | null; token: string | null } => {
    if (typeof window === 'undefined') return { barberId: null, token: null };
    try {
        const raw = localStorage.getItem('barberpro-auth');
        if (!raw) return { barberId: null, token: null };
        const parsed = JSON.parse(raw);
        return {
            barberId: parsed?.state?.user?.id ?? null,
            token: parsed?.state?.token ?? null,
        };
    } catch {
        return { barberId: null, token: null };
    }
};

type AgendaState = {
    // todos os agendamentos carregados da API (sem filtro)
    todosAgendamentos: Agendamento[];
    // agendamentos do dia atual — usados no Dashboard
    agendamentosHoje: Agendamento[];
    // agendamentos filtrados por data/status — usados na página Agenda
    agendamentos: Agendamento[];
    isLoading: boolean;
    error: string | null;
    subscriptionError: boolean;

    carregarAgendamentos: (data?: string) => Promise<void>;
    filtrarAgendamentos: (data: string, status: string) => void;
    adicionarAgendamento: (novo: Omit<Agendamento, 'id'>) => void;
    atualizarStatus: (id: string, status: Agendamento['status']) => Promise<void>;
    removerAgendamento: (id: string) => Promise<void>;
    limparAgendamentosExpirados: () => void;
    setLoading: (loading: boolean) => void;
};

export const useAgendaStore = create<AgendaState>((set, get) => ({
    todosAgendamentos: [],
    agendamentos: [],
    agendamentosHoje: [],
    isLoading: false,
    error: null,
    subscriptionError: false,

    carregarAgendamentos: async (data?: string) => {
        set({ isLoading: true, error: null, subscriptionError: false });

        const { barberId } = getAuthInfo();

        if (!barberId) {
            set({ agendamentos: [], agendamentosHoje: [], todosAgendamentos: [], isLoading: false });
            return;
        }

        try {
            const res = await apiClient.get('/appointments', {
                params: {
                    preferredHairdresserId: barberId,
                    status: 'Upcoming',
                    limit: '200',
                    sortBy: 'appointmentDateTime:asc',
                    populate: 'serviceType',
                },
            });

            const results: Record<string, unknown>[] = res.data?.results ?? [];
            const todos = applyVisibilityRules(results.map(mapApiAppointment));

            const hoje = format(new Date(), 'yyyy-MM-dd');
            const agendamentosHoje = todos.filter((a) => a.data === hoje);

            // Se uma data foi passada, filtra por ela; senão usa todos
            const filtroData = data ?? hoje;
            const agendamentos = todos.filter((a) => a.data === filtroData);

            set({ todosAgendamentos: todos, agendamentos, agendamentosHoje, isLoading: false });
        } catch (err: unknown) {
            console.error('[useAgendaStore] Erro ao carregar agendamentos:', err);

            // Detecta erro de assinatura (402 Payment Required)
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 402) {
                set({
                    subscriptionError: true,
                    isLoading: false,
                    agendamentos: [],
                    agendamentosHoje: [],
                    todosAgendamentos: [],
                });
                return;
            }

            const message = err instanceof Error ? err.message : 'Erro ao carregar agendamentos.';
            set({ error: message, isLoading: false });
        }
    },

    /** Filtra localmente a partir de todosAgendamentos (sem nova chamada à API) */
    filtrarAgendamentos: (data: string, status: string) => {
        const { todosAgendamentos } = get();
        const visibleAgendamentos = applyVisibilityRules(todosAgendamentos);
        const filtered = todosAgendamentos.filter((a) => {
            const dateMatch = a.data === data;
            const statusMatch =
                status === 'Todos' ||
                status === 'todos' ||
                a.status === status.toLowerCase() ||
                (status === 'Confirmados' && a.status === 'confirmado') ||
                (status === 'Pendentes' && a.status === 'pendente') ||
                (status === 'Concluídos' && a.status === 'concluido') ||
                (status === 'Cancelados' && a.status === 'cancelado');
            return dateMatch && statusMatch;
        });
        set({ agendamentos: applyVisibilityRules(filtered), todosAgendamentos: visibleAgendamentos });
    },

    adicionarAgendamento: (novo) =>
        set((state) => {
            const novoComId: Agendamento = { ...novo, id: Date.now().toString() };
            const hoje = format(new Date(), 'yyyy-MM-dd');
            const nextTodos = applyVisibilityRules([...state.todosAgendamentos, novoComId]);
            const nextAgendamentos = applyVisibilityRules([...state.agendamentos, novoComId]);
            const nextAgendamentosHoje =
                novo.data === hoje
                    ? applyVisibilityRules([...state.agendamentosHoje, novoComId])
                    : state.agendamentosHoje;

            return {
                todosAgendamentos: nextTodos,
                agendamentos: nextAgendamentos,
                agendamentosHoje: nextAgendamentosHoje,
            };
        }),

    atualizarStatus: async (id, status) => {
        const currentState = get();
        const previousAppointment = currentState.todosAgendamentos.find((a) => a.id === id);

        const removeLocal = () =>
            set((state) => ({
                todosAgendamentos: state.todosAgendamentos.filter((a) => a.id !== id),
                agendamentos: state.agendamentos.filter((a) => a.id !== id),
                agendamentosHoje: state.agendamentosHoje.filter((a) => a.id !== id),
            }));

        if (status === 'concluido' || status === 'cancelado') {
            removeLocal();
        }

        try {
            await apiClient.patch(`/appointments/${id}`, { status: toApiStatus(status) });
        } catch (err) {
            if (previousAppointment) {
                set((state) => ({
                    todosAgendamentos: applyVisibilityRules([...state.todosAgendamentos, previousAppointment]),
                    agendamentos: applyVisibilityRules([...state.agendamentos, previousAppointment]),
                    agendamentosHoje:
                        previousAppointment.data === format(new Date(), 'yyyy-MM-dd')
                            ? applyVisibilityRules([...state.agendamentosHoje, previousAppointment])
                            : state.agendamentosHoje,
                }));
            }
            throw err;
        }
    },

    removerAgendamento: async (id) => {
        try {
            await apiClient.delete(`/appointments/${id}`);
        } catch (err) {
            console.warn('[useAgendaStore] Falha ao deletar no servidor, removendo localmente.', err);
        }
        set((state) => ({
            todosAgendamentos: state.todosAgendamentos.filter((a) => a.id !== id),
            agendamentos: state.agendamentos.filter((a) => a.id !== id),
            agendamentosHoje: state.agendamentosHoje.filter((a) => a.id !== id),
        }));
    },

    limparAgendamentosExpirados: () => {
        set((state) => ({
            todosAgendamentos: applyVisibilityRules(state.todosAgendamentos),
            agendamentos: applyVisibilityRules(state.agendamentos),
            agendamentosHoje: applyVisibilityRules(state.agendamentosHoje),
        }));
    },

    setLoading: (loading) => set({ isLoading: loading }),
}));
