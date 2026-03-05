"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Calendar as CalendarIcon, Filter, ExternalLink, Plus, Trash2, Clock, Scissors as ScissorsIcon, Phone, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAgendaStore, Agendamento } from "@/stores/useAgendaStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import NovoAgendamentoModal from "@/components/modals/NovoAgendamentoModal";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MinhaAgenda() {
    const router = useRouter();
    const { hasHydrated, isAuthenticated } = useAuthStore();
    const { agendamentos, carregarAgendamentos, filtrarAgendamentos, isLoading, removerAgendamento, subscriptionError } = useAgendaStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Agendamento | null>(null);
    const hoje = new Date().toISOString().split('T')[0];
    const [filterDate, setFilterDate] = useState(hoje);
    const [filterStatus, setFilterStatus] = useState('Todos');
    const [appliedDate, setAppliedDate] = useState(hoje);

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        // Carrega todos os agendamentos e aplica filtro do dia atual
        carregarAgendamentos(hoje);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const handleRefresh = async () => {
        await carregarAgendamentos(appliedDate);
    };

    const handleApplyFilters = () => {
        setAppliedDate(filterDate);
        // filtra localmente — sem nova chamada à API
        filtrarAgendamentos(filterDate, filterStatus);
    };

    // agendamentos já vem filtrado do store
    const agendamentosFiltrados = agendamentos;

    const formatDateLabel = (dateStr: string) => {
        const today = new Date().toISOString().split('T')[0];
        if (dateStr === today) return 'Hoje';
        try {
            return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR });
        } catch {
            return dateStr;
        }
    };

    const handleCancelClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Deseja realmente cancelar este agendamento?")) {
            removerAgendamento(id);
            if (selectedEvent?.id === id) setSelectedEvent(null);
        }
    };

    if (hasHydrated && !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black pb-24 text-white font-sans selection:bg-emerald-500/30">
            {/* Header Premium */}
            <header className="px-6 pt-10 pb-8 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/barbeiro/dashboard")} className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Minha Agenda</h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Gestão de Horários</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh} loading={isLoading} className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5 text-emerald-400">
                    <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
            </header>

            <main className="px-6 py-10 space-y-10 max-w-7xl mx-auto w-full animate-fade-in-up">
                {/* Ações Rápidas */}
                <section className="flex flex-wrap gap-4">
                    <Button variant="gold" className="flex-1 py-4 uppercase text-[10px] font-black tracking-[0.2em]" onClick={() => setModalOpen(true)}>
                        <Plus size={16} className="mr-2" /> Novo Agendamento
                    </Button>
                    <Button variant="ghost" className="flex-1 py-4 bg-white/5 border border-white/5 uppercase text-[10px] font-black tracking-[0.2em]" onClick={() => window.open("https://calendar.google.com")}>
                        <ExternalLink size={16} className="mr-2" /> Google Calendar
                    </Button>
                </section>

                {/* Banner de erro de assinatura */}
                {subscriptionError && (
                    <section>
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-5 flex items-start gap-4">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest text-amber-400 mb-1">Assinatura Inativa</p>
                                <p className="text-xs text-gray-400">Sua assinatura está pendente ou expirada. Renove para visualizar seus agendamentos.</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Filtros Glass */}
                <section>
                    <div className="flex items-center gap-2 mb-4 opacity-60">
                        <Filter size={16} className="text-amber-400" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">Filtrar Agenda</h2>
                    </div>
                    <Card className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Data</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-emerald-500/50 outline-none transition-all"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest text-gray-500 uppercase ml-1">Status</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option>Todos</option>
                                    <option>Confirmados</option>
                                    <option>Pendentes</option>
                                    <option>Concluídos</option>
                                    <option>Cancelados</option>
                                </select>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-6 py-4 uppercase text-[10px] font-black tracking-[0.2em] border-white/5 bg-white/5" onClick={handleApplyFilters}>
                            Aplicar Filtros
                        </Button>
                    </Card>
                </section>

                {/* Lista de Atendimentos */}
                <section>
                    <div className="flex items-center gap-2 mb-4 opacity-60">
                        <CalendarIcon size={16} className="text-emerald-400" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Atendimentos — {formatDateLabel(appliedDate)}</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col gap-4 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-white/5 rounded-3xl" />
                            ))}
                        </div>
                    ) : agendamentosFiltrados.length === 0 ? (
                        <Card className="py-20 text-center opacity-50 border-dashed border-white/10 bg-white/[0.02]">
                            <p className="text-sm uppercase tracking-widest font-medium">Nenhum agendamento para {formatDateLabel(appliedDate)}</p>
                        </Card>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {agendamentosFiltrados.map((a) => (
                                <Card
                                    key={a.id}
                                    className="p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer"
                                    onClick={() => setSelectedEvent(a)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-lg">
                                            {a.hora}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-white uppercase tracking-tight text-lg">{a.cliente}</h3>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">{a.servico}</p>
                                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-amber-500/5 rounded-lg border border-amber-500/10">{a.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-emerald-400 font-black text-xl hidden sm:block">R$ {a.valor}</span>
                                        <button
                                            onClick={(e) => handleCancelClick(e, a.id)}
                                            className="p-3 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <NovoAgendamentoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

            {/* Modal Detalhes Premium */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                    <Card className="w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 border-t border-white/10 sm:border animate-slide-up bg-zinc-950">
                        <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-8 sm:hidden" />
                        <header className="flex justify-between items-center mb-8">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Resumo do Atendimento</h2>
                            <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </header>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-2xl">
                                    {selectedEvent.cliente.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-2xl font-bold uppercase tracking-tight">{selectedEvent.cliente}</p>
                                    <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest">HOJE ÀS {selectedEvent.hora}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                        <ScissorsIcon size={18} />
                                    </div>
                                    <span className="font-bold text-sm text-gray-300 uppercase tracking-widest">{selectedEvent.servico}</span>
                                    <span className="ml-auto text-emerald-400 font-black">R$ {selectedEvent.valor}</span>
                                </div>

                                <a href={`https://wa.me/5571999998888`} target="_blank" className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl group hover:bg-emerald-500/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                            <Phone size={18} />
                                        </div>
                                        <span className="font-bold text-sm text-emerald-400">(71) 99999-8888</span>
                                    </div>
                                    <ExternalLink size={16} className="text-emerald-500 opacity-50" />
                                </a>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={(e) => {
                                        handleCancelClick(e, selectedEvent.id);
                                        setSelectedEvent(null);
                                    }}
                                    variant="outline"
                                    className="flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-black border-rose-500/20 text-rose-500 hover:bg-rose-500/10 bg-transparent"
                                >
                                    Cancelar Atendimento
                                </Button>
                                <Button variant="gold" className="flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-black">
                                    Iniciar Serviço
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
