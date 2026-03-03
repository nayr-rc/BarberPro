"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, DollarSign, Users, CheckCircle2, Clock, ChevronRight, Plus, Power, Share2, Copy, Check, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAgendaStore } from "@/stores/useAgendaStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NovoAgendamentoModal from "@/components/modals/NovoAgendamentoModal";

export default function Dashboard() {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const { agendamentosHoje, carregarAgendamentos, isLoading } = useAgendaStore();
    const [modalOpen, setModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            carregarAgendamentos();
        }
    }, [isAuthenticated, carregarAgendamentos]);

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    const handleCopyLink = () => {
        const link = `${window.location.origin}/agendar/${user?.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black pb-24 text-white font-sans selection:bg-emerald-500/30">
            {/* Header Premium */}
            <header className="px-6 pt-10 pb-8 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl font-black text-black shadow-xl shadow-emerald-500/20">
                        {user?.name?.[0]?.toUpperCase() || "R"}
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Olá, <span className="text-emerald-400">{user?.name}</span></h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Barbeiro Especialista</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/agendar/${user?.id}`, '_blank')}
                        className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5 text-emerald-400 hover:bg-emerald-500/10"
                        title="Ver página pública"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5 text-rose-500 hover:bg-rose-500/10">
                        <Power className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-6 mt-8 space-y-10 max-w-7xl mx-auto w-full animate-fade-in-up">

                {/* Link de Agendamento em Destaque */}
                <section>
                    <Card className="p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Share2 size={80} className="text-emerald-500" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <span className="text-emerald-400">Meu Link</span> de Agendamento
                                </h2>
                                <p className="text-sm text-gray-400 font-medium">Compartilhe este link com seus clientes para que eles agendem sozinhos.</p>
                            </div>

                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-2 rounded-2xl backdrop-blur-sm w-full md:w-auto">
                                <code className="px-4 text-xs font-mono text-emerald-400/80 truncate max-w-[200px] md:max-w-xs">
                                    {typeof window !== 'undefined' ? `${window.location.origin}/agendar/${user?.id}` : '...'}
                                </code>
                                <Button
                                    onClick={handleCopyLink}
                                    variant={copied ? "gold" : "outline"}
                                    className={`min-h-[48px] px-6 py-2 rounded-xl transition-all duration-500 border-none whitespace-nowrap shrink-0 ${copied ? 'bg-emerald-500 text-black' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                >
                                    {copied ? (
                                        <><Check size={16} className="mr-2" /> Copiado</>
                                    ) : (
                                        <><Copy size={16} className="mr-2" /> Copiar Link</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </section>
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6 border-emerald-500/10 bg-emerald-500/5 group hover:border-emerald-500/30 transition-all">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 w-fit mb-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Agenda Hoje</p>
                        <p className="text-3xl font-black">{agendamentosHoje.length} <span className="text-xs font-bold text-gray-500">Atend.</span></p>
                    </Card>

                    <Card className="p-6 border-amber-500/10 bg-amber-500/5 group hover:border-amber-500/30 transition-all">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 w-fit mb-4">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Faturamento</p>
                        <p className="text-3xl font-black">R$ 0<span className="text-xs font-bold text-gray-500">,00</span></p>
                    </Card>

                    <Card className="p-6 border-blue-500/10 bg-blue-500/5 group hover:border-blue-500/30 transition-all">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 w-fit mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Novos Clientes</p>
                        <p className="text-3xl font-black">0 <span className="text-xs font-bold text-gray-500">Hoje</span></p>
                    </Card>

                    <Card className="p-6 border-purple-500/10 bg-purple-500/5 group hover:border-purple-500/30 transition-all">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 w-fit mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Taxa Recompra</p>
                        <p className="text-3xl font-black">--%</p>
                    </Card>
                </section>

                {/* Agenda Hoje Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Clock size={18} />
                            </div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Agenda Hoje</h2>
                        </div>
                        <Button variant="outline" size="sm" className="min-h-0 py-2.5 text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/5" onClick={() => router.push("/barbeiro/agenda")}>
                            Ver Completa <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <Card className="text-center py-16 px-8 border-dashed border-white/10 bg-white/[0.02]">
                        {isLoading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 w-32 bg-white/5 mx-auto rounded-full" />
                                <div className="h-10 w-48 bg-white/5 mx-auto rounded-full" />
                            </div>
                        ) : agendamentosHoje.length === 0 ? (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Nenhum atendimento para hoje.</p>
                                <Button variant="gold" className="mx-auto min-h-[58px] px-10 uppercase text-xs font-black tracking-widest shadow-2xl shadow-amber-500/20" onClick={() => setModalOpen(true)}>
                                    <Plus size={18} className="mr-2" /> Novo Agendamento
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 text-left">
                                {agendamentosHoje.map((a) => (
                                    <div key={a.id} className="flex justify-between items-center p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-emerald-500/20 transition-all active:scale-[0.98]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black">
                                                {a.hora}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white uppercase tracking-tight">{a.cliente}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{a.servico}</p>
                                            </div>
                                        </div>
                                        <span className="text-emerald-400 font-black text-lg">R$ {a.valor}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </section>

                {/* Atalhos Rápidos com Novo Estilo */}
                <section className="pb-10">
                    <h2 className="text-xl font-bold uppercase tracking-tight mb-6">Atalhos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="w-full justify-start px-8 py-8 bg-white/5 border-white/5 hover:border-emerald-500/30 group" onClick={() => router.push("/barbeiro/servicos")}>
                            <span className="text-2xl mr-4 group-hover:scale-125 transition-transform">✂️</span>
                            <div className="text-left">
                                <p className="font-bold uppercase tracking-tight text-white">Configurar Serviços</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Preços e duração</p>
                            </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start px-8 py-8 bg-white/5 border-white/5 hover:border-blue-500/30 group" onClick={() => router.push("/barbeiro/disponibilidade")}>
                            <span className="text-2xl mr-4 group-hover:scale-125 transition-transform">📅</span>
                            <div className="text-left">
                                <p className="font-bold uppercase tracking-tight text-white">Disponibilidade</p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Horários de trabalho</p>
                            </div>
                        </Button>
                    </div>
                </section>
            </main>

            <NovoAgendamentoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

            {/* Bottom Nav Fixo */}
            <nav className="fixed bottom-6 left-6 right-6 z-50">
                <div className="max-w-md mx-auto h-20 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-8 flex items-center justify-around shadow-2xl shadow-black">
                    <button onClick={() => router.push("/barbeiro/dashboard")} className="p-3 text-emerald-400 transition-all active:scale-90">
                        <Clock className="w-7 h-7" />
                    </button>
                    <button onClick={() => router.push("/barbeiro/agenda")} className="p-3 text-gray-600 hover:text-white transition-all active:scale-90">
                        <Calendar className="w-7 h-7" />
                    </button>
                    <button onClick={() => router.push("/barbeiro/financeiro")} className="p-3 text-gray-600 hover:text-white transition-all active:scale-90">
                        <DollarSign className="w-7 h-7" />
                    </button>
                    <button onClick={() => router.push("/barbeiro/clientes")} className="p-3 text-gray-600 hover:text-white transition-all active:scale-90">
                        <Users className="w-7 h-7" />
                    </button>
                </div>
            </nav>
        </div>
    );
}
