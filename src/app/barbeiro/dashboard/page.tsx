"use client";

import {
    CalendarDays, Scissors, Users, DollarSign, Clock, LayoutDashboard, ChevronRight,
    X, ExternalLink, Calendar as CalendarIcon, Info, Phone, Trash2, Scissors as ScissorsIcon
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format, isSameDay, parseISO, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BarbeiroDashboard() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        todayCount: 0,
        billing: 0,
        newClients: 0,
        approvedRate: "98%"
    });
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        } else if (user?.role !== "barber") {
            router.push("/admin");
            return;
        }

        const fetchTodayData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/calendar/occupied?calendarId=primary`);
                const data = await res.json();

                if (data.occupied) {
                    const allEvents = data.occupied.map((ev: any) => ({
                        id: ev.id,
                        title: ev.title,
                        start: ev.start,
                        end: ev.end,
                        description: ev.description || '',
                        htmlLink: ev.htmlLink,
                    }));
                    const today = new Date();

                    // Filter for today's events
                    const todayEvents = allEvents.filter((ev: any) =>
                        isSameDay(parseISO(ev.start), today)
                    ).sort((a: any, b: any) =>
                        parseISO(a.start).getTime() - parseISO(b.start).getTime()
                    );

                    setAppointments(todayEvents);

                    // Update stats
                    setStats(prev => ({
                        ...prev,
                        todayCount: todayEvents.length,
                        billing: todayEvents.length * 60, // Mock calculation: 60 per cut
                        newClients: Math.floor(todayEvents.length / 3) // Mock calculation
                    }));
                }
            } catch (err) {
                console.error("Erro ao carregar dados do dia:", err);
            } finally {
                setLoading(false);
            }
        };

        const handleCancelAppointment = async (eventId: string) => {
            if (!confirm('Tem certeza que quer CANCELAR este agendamento?')) return;

            try {
                const res = await fetch('/api/calendar/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId, calendarId: 'primary' }),
                });

                if (res.ok) {
                    alert('Agendamento cancelado com sucesso!');
                    fetchTodayData();
                } else {
                    const err = await res.json();
                    alert('Erro: ' + err.error);
                }
            } catch (err) {
                alert('Falha na conexão.');
            }
        };

        window.handleDashboardCancel = handleCancelAppointment;

        fetchTodayData();
    }, [isAuthenticated, user, router]);

    // Mock data for display based on naming in suggestions
    const barbeiro = {
        nome: user?.name || user?.firstName || "Barbeiro",
        fotoUrl: null, // Placeholder
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-barber-black text-gray-100 flex flex-col font-body">
            {/* Header */}
            <header className="bg-barber-dark border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {barbeiro.fotoUrl ? (
                            <img
                                src={barbeiro.fotoUrl}
                                alt={barbeiro.nome}
                                className="w-12 h-12 rounded-full object-cover border-2 border-barber-gold shadow-lg"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-barber-gold to-barber-accent flex items-center justify-center text-barber-black font-bold text-xl shadow-lg">
                                {barbeiro.nome.charAt(0)}
                            </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-barber-dark rounded-full"></div>
                    </div>
                    <div>
                        <h1 className="font-heading text-lg tracking-wide text-barber-white">Olá, {barbeiro.nome}</h1>
                        <p className="text-xs text-barber-accent uppercase tracking-widest font-medium">Barbeiro Especialista</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/agendar/${user?.id}`;
                            navigator.clipboard.writeText(link);
                            alert("✅ Link de agendamento copiado para o WhatsApp!");
                        }}
                        className="hidden sm:flex items-center gap-2 bg-barber-gold hover:bg-white text-barber-black px-4 py-2 rounded-lg font-bold text-xs transition-colors uppercase tracking-widest shadow-lg"
                    >
                        <Users size={16} />
                        Gerar Link
                    </button>
                    <button className="text-barber-accent hover:text-barber-gold transition-colors p-2 rounded-full hover:bg-white/5">
                        <Clock size={24} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 space-y-8 pb-28 md:pb-8 max-w-7xl mx-auto w-full">
                {/* Cards de estatísticas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
                    <StatCard
                        icon={<CalendarDays size={24} />}
                        title="Hoje"
                        value={`${stats.todayCount} cortes`}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10"
                    />
                    <StatCard
                        icon={<DollarSign size={24} />}
                        title="Faturamento"
                        value={`R$ ${stats.billing},00`}
                        color="text-barber-gold"
                        bg="bg-barber-gold/10"
                    />
                    <StatCard
                        icon={<Users size={24} />}
                        title="Clientes novos"
                        value={stats.newClients.toString()}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                    />
                    <StatCard
                        icon={<LayoutDashboard size={24} />}
                        title="Aprovados"
                        value={stats.approvedRate}
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Próximos atendimentos – Coluna Principal */}
                    <section className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-heading text-barber-gold tracking-wider">AGENDA DE HOJE</h2>
                            <Link href="/barbeiro/agenda" className="text-barber-accent text-sm hover:text-barber-gold transition-colors flex items-center gap-1 group">
                                Ver completa <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-20 text-center text-barber-accent animate-pulse">Sincronizando agenda...</div>
                            ) : appointments.length === 0 ? (
                                <div className="py-20 text-center bg-barber-dark/50 border border-dashed border-white/5 rounded-2xl">
                                    <p className="text-gray-500 uppercase tracking-widest text-sm">Nenhum agendamento para hoje.</p>
                                </div>
                            ) : (
                                appointments.map((app: any, idx: number) => {
                                    const desc = app.description || '';
                                    const lines = desc.split('\n');
                                    const serviceLine = lines.find((l: any) => l.startsWith('Serviço:')) || '';
                                    const service = serviceLine.replace('Serviço: ', '') || 'Corte Padrão';

                                    const start = parseISO(app.start);
                                    const isFuture = isAfter(start, new Date());

                                    return (
                                        <AppointmentCard
                                            key={app.id || idx}
                                            horario={format(start, 'HH:mm')}
                                            cliente={app.title.replace('Corte - ', '')}
                                            servico={service}
                                            status={isFuture ? "confirmado" : "concluído"}
                                            onClick={() => setSelectedEvent(app)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Ações rápidas – Sidebar ou Lateral */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-barber-gold tracking-wider uppercase">Atalhos</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                            <QuickActionCard
                                icon={<CalendarDays />}
                                title="Minha Agenda"
                                href="/barbeiro/agenda"
                            />
                            <QuickActionCard
                                icon={<Scissors />}
                                title="Meus Serviços"
                                href="/barbeiro/servicos"
                            />
                            <QuickActionCard
                                icon={<Clock />}
                                title="Horários de Trabalho"
                                href="/barbeiro/disponibilidade"
                            />
                            <QuickActionCard
                                icon={<Users />}
                                title="Lista de Clientes"
                                href="/barbeiro/clientes"
                            />
                            <QuickActionCard
                                icon={<DollarSign />}
                                title="Relatório Financeiro"
                                href="/barbeiro/financeiro"
                            />
                        </div>
                    </section>
                </div>
            </main>

            {/* Bottom Navigation (mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-barber-dark border-t border-white/5 md:hidden z-40">
                <div className="flex justify-around py-3">
                    <NavItem icon={<CalendarDays />} label="Hoje" active />
                    <NavItem icon={<CalendarDays />} label="Agenda" />
                    <NavItem icon={<Users />} label="Clientes" />
                    <NavItem icon={<DollarSign />} label="Ganhos" />
                </div>
            </nav>

            {/* Modal de Detalhes (Igual ao da Agenda) */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-up my-auto">
                        <header className="bg-gradient-to-b from-barber-gold/10 to-transparent p-12 pb-8 relative border-b border-white/5">
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-10 right-10 text-gray-500 hover:text-white transition-all hover:rotate-90 duration-300"
                            >
                                <X size={32} strokeWidth={2.5} />
                            </button>
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-4xl font-heading text-white tracking-widest uppercase leading-tight">
                                    DETALHES DO <span className="text-barber-gold">AGENDAMENTO</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] w-12 bg-barber-gold/40"></div>
                                    <p className="text-barber-accent text-xs uppercase tracking-[0.3em] font-bold">Resumo do Serviço</p>
                                </div>
                            </div>
                        </header>

                        <div className="p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Data e Horário */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 ml-1">
                                        <CalendarIcon size={20} strokeWidth={2.5} className="text-barber-gold" />
                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em]">Data e Horário</p>
                                    </div>
                                    <div className="bg-barber-black border border-white/10 rounded-2xl px-6 py-5 shadow-2xl">
                                        <p className="text-white font-bold text-lg capitalize">
                                            {format(parseISO(selectedEvent.start), "eeee, dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                        <p className="text-barber-gold font-heading text-2xl mt-1">
                                            {format(parseISO(selectedEvent.start), "HH:mm")}
                                        </p>
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 ml-1">
                                        <Users size={20} strokeWidth={2.5} className="text-barber-gold" />
                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em]">Informações do Cliente</p>
                                    </div>
                                    <div className="bg-barber-black border border-white/10 rounded-2xl px-6 py-5 shadow-2xl">
                                        <p className="text-white font-bold text-lg truncate uppercase tracking-wide">
                                            {selectedEvent.title.replace('Corte - ', '')}
                                        </p>
                                        {selectedEvent.description?.split('\n').map((line: string, i: number) => {
                                            if (line.includes('WhatsApp:')) {
                                                const phone = line.replace('WhatsApp:', '').trim();
                                                const clientName = selectedEvent.title.replace('Corte - ', '');
                                                const message = encodeURIComponent(`Olá ${clientName}, esta na hora do seu corte! Favor encaminhar-se para a barbearia!`);
                                                return (
                                                    <a key={i} href={`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`} target="_blank" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-bold bg-green-400/5 px-3 py-2 rounded-xl mt-3 w-fit">
                                                        <Phone size={14} strokeWidth={3} /> {phone}
                                                    </a>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Serviço e Valor */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 ml-1">
                                    <ScissorsIcon size={20} strokeWidth={2.5} className="text-barber-gold" />
                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em]">Serviço e Valor</p>
                                </div>
                                <div className="bg-barber-black border border-white/10 rounded-2xl px-8 py-6 flex items-center justify-between shadow-2xl">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Procedimento</p>
                                        <h4 className="text-xl font-bold text-white uppercase tracking-wider">
                                            {selectedEvent.description?.split('\n').find((l: string) => l.includes('Serviço:'))?.replace('Serviço:', '').trim() || 'Corte Padrão'}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total a Pagar</p>
                                        <p className="text-barber-gold font-heading text-3xl">
                                            {selectedEvent.description?.split('\n').find((l: string) => l.includes('Valor:'))?.replace('Valor:', '').trim() || 'R$ 00,00'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        if (window.handleDashboardCancel) {
                                            window.handleDashboardCancel(selectedEvent.id);
                                            setSelectedEvent(null);
                                        }
                                    }}
                                    className="flex-1 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 py-5 rounded-2xl transition-all font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 hover:shadow-[0_0_20px_rgba(225,29,72,0.2)]"
                                >
                                    <Trash2 size={20} strokeWidth={2.5} /> Cancelar Horário
                                </button>
                                {selectedEvent.htmlLink && (
                                    <a
                                        href={selectedEvent.htmlLink}
                                        target="_blank"
                                        className="bg-barber-gold hover:bg-white text-barber-black px-6 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-barber-gold/10"
                                        title="Ver no Google Calendar"
                                    >
                                        <ExternalLink size={24} strokeWidth={2.5} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componentes auxiliares
function StatCard({ icon, title, value, color, bg }: any) {
    return (
        <div className="bg-barber-dark border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:border-barber-accent/30 transition-all group">
            <div className={`${color} ${bg} p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform`}>{icon}</div>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 font-bold">{title}</p>
            <p className="font-bold text-xl text-white">{value}</p>
        </div>
    );
}

function AppointmentCard({ horario, cliente, servico, status, onClick }: any) {
    const statusColors = {
        confirmado: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        aguardando: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        cancelado: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        concluído: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    };

    const currentStatusStyle = statusColors[status as keyof typeof statusColors] || statusColors.aguardando;

    return (
        <div
            onClick={onClick}
            className="bg-barber-dark border border-white/5 rounded-xl p-4 flex items-center gap-5 hover:bg-barber-gray/50 transition-all group cursor-pointer active:scale-[0.98]"
        >
            <div className="bg-barber-black/50 border border-white/5 rounded-xl px-4 py-3 text-center min-w-[80px] shadow-inner group-hover:border-barber-gold/30 transition-colors">
                <p className="text-2xl font-bold text-barber-gold leading-none">{horario.split(':')[0]}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-1">:{horario.split(':')[1]}</p>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-white truncate">{cliente}</p>
                <p className="text-xs text-barber-accent uppercase tracking-widest">{servico}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest ${currentStatusStyle}`}>
                    {status}
                </span>
                <Info size={16} className="text-gray-500 group-hover:text-barber-gold transition-colors" />
            </div>
        </div>
    );
}

function QuickActionCard({ icon, title, href }: any) {
    return (
        <Link
            href={href}
            className="bg-barber-dark border border-white/5 hover:border-barber-gold/50 hover:bg-barber-gold/5 transition-all rounded-2xl p-6 flex items-center gap-4 group"
        >
            <div className="text-barber-gold bg-barber-gold/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-sm font-bold tracking-wide text-barber-white group-hover:text-barber-gold transition-colors">{title}</span>
            <ChevronRight size={18} className="ml-auto text-gray-600 group-hover:text-barber-gold transition-colors" />
        </Link>
    );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <button className={`flex flex-col items-center gap-1 min-w-[60px] ${active ? "text-barber-gold" : "text-gray-500 hover:text-barber-accent"} transition-colors`}>
            <div className={`${active ? "scale-110" : ""}`}>{icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
            {active && <div className="w-1 h-1 bg-barber-gold rounded-full mt-0.5"></div>}
        </button>
    );
}
