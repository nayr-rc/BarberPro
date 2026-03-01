'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import fullCalendarPtBr from '@fullcalendar/core/locales/pt-br';
import { format, isAfter, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ChevronLeft, RefreshCw, ExternalLink, Calendar as CalendarIcon, Filter, Trash2, Info, X, Eye, Phone, Scissors as ScissorsIcon } from "lucide-react";
import Link from "next/link";

interface Evento {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    htmlLink?: string;
}

export default function MinhaAgenda() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [filteredEventos, setFilteredEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [calendarId] = useState('primary');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'futuros' | 'passados'
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "barber") {
            router.push("/auth/login");
        }
    }, [isAuthenticated, user, router]);

    const carregarAgenda = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/calendar/occupied?calendarId=${calendarId}`);
            const data = await res.json();

            if (data.occupied) {
                const formatted = data.occupied.map((ev: any) => ({
                    id: ev.id,
                    title: ev.title,
                    start: ev.start,
                    end: ev.end,
                    description: ev.description || '',
                    htmlLink: ev.htmlLink,
                }));
                setEventos(formatted);
                aplicarFiltros(formatted);
            }
        } catch (err) {
            console.error('Erro ao carregar:', err);
            alert('Erro ao carregar agenda.');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = (evs: Evento[]) => {
        let filtered = [...evs];

        if (startDate) {
            filtered = filtered.filter(ev => isAfter(parseISO(ev.start), parseISO(startDate)));
        }
        if (endDate) {
            filtered = filtered.filter(ev => !isAfter(parseISO(ev.start), parseISO(endDate)));
        }

        if (statusFilter === 'futuros') {
            filtered = filtered.filter(ev => isAfter(parseISO(ev.start), new Date()));
        } else if (statusFilter === 'passados') {
            filtered = filtered.filter(ev => !isAfter(parseISO(ev.start), new Date()));
        }

        setFilteredEventos(filtered);
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === "barber") {
            carregarAgenda();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        aplicarFiltros(eventos);
    }, [startDate, endDate, statusFilter, eventos]);

    const handleDelete = async (eventId: string) => {
        if (!confirm('Tem certeza que quer CANCELAR este agendamento?')) return;

        try {
            const res = await fetch('/api/calendar/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, calendarId }),
            });

            if (res.ok) {
                alert('Agendamento cancelado com sucesso!');
                carregarAgenda();
            } else {
                const err = await res.json();
                alert('Erro: ' + err.error);
            }
        } catch (err) {
            alert('Falha na conexão.');
        }
    };

    const eventContent = (arg: any) => {
        const ev = arg.event;
        return (
            <div className="text-xs p-1 h-full flex flex-col justify-between overflow-hidden group">
                <div className="cursor-pointer" onClick={() => setSelectedEvent({
                    id: ev.id,
                    title: ev.title,
                    start: ev.start.toISOString(),
                    end: ev.end.toISOString(),
                    description: ev.extendedProps.description,
                    htmlLink: ev.extendedProps.htmlLink
                })}>
                    <strong className="block truncate">{ev.title}</strong>
                    {ev.extendedProps.description && (
                        <div className="text-[10px] opacity-80 mt-1 truncate leading-tight">{ev.extendedProps.description}</div>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent({
                                id: ev.id,
                                title: ev.title,
                                start: ev.start.toISOString(),
                                end: ev.end.toISOString(),
                                description: ev.extendedProps.description,
                                htmlLink: ev.extendedProps.htmlLink
                            });
                        }}
                        className="flex-1 flex items-center justify-center gap-1 text-[9px] bg-barber-gold hover:bg-white text-barber-black px-2 py-0.5 rounded transition-all font-bold uppercase tracking-widest"
                    >
                        <Eye size={10} /> Ver
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ev.id);
                        }}
                        className="flex items-center justify-center bg-rose-600 hover:bg-rose-700 p-1 rounded text-white transition-all"
                        title="Cancelar"
                    >
                        <Trash2 size={10} />
                    </button>
                </div>
            </div>
        );
    };

    if (!isAuthenticated || user?.role !== "barber") return null;

    return (
        <div className="min-h-screen bg-barber-black text-gray-100 flex flex-col font-body selection:bg-barber-gold selection:text-black">
            <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/barbeiro/dashboard" className="inline-flex items-center gap-2 text-barber-accent hover:text-barber-gold transition-colors mb-4 group uppercase text-xs tracking-widest font-bold">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading text-white tracking-widest uppercase">MINHA <span className="text-barber-gold">AGENDA</span></h1>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={carregarAgenda}
                            disabled={loading}
                            className="bg-barber-dark border border-white/10 hover:border-barber-gold/50 px-6 py-3 rounded-2xl flex items-center gap-2 transition-all hover:bg-white/5 active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''} text-barber-gold`} />
                            <span className="text-sm font-bold uppercase tracking-widest">Atualizar</span>
                        </button>
                        <a
                            href="https://calendar.google.com"
                            target="_blank"
                            className="bg-barber-gold hover:bg-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all text-barber-black active:scale-95"
                        >
                            <ExternalLink size={18} />
                            <span className="text-sm font-bold uppercase tracking-widest">Google Calendar</span>
                        </a>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-barber-dark border border-white/5 p-6 rounded-3xl shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                        <Filter size={20} className="text-barber-gold" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-barber-accent">Filtros de Visualização</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Data inicial</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-xl px-4 py-3 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Data final</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-xl px-4 py-3 outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status do Agendamento</label>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-xl px-4 py-3 outline-none transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="todos">Todos os Agendamentos</option>
                                <option value="futuros">Somente Futuros</option>
                                <option value="passados">Histórico Passado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Agenda Calendar */}
                <div className="bg-barber-dark border border-white/5 rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                        <CalendarIcon size={200} />
                    </div>
                    {loading ? (
                        <div className="h-[600px] flex items-center justify-center">
                            <div className="text-barber-gold animate-pulse font-heading text-xl tracking-widest">SINCRONIZANDO COM GOOGLE...</div>
                        </div>
                    ) : (
                        <div className="calendar-container">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                locale={fullCalendarPtBr}
                                slotDuration="00:30:00"
                                slotMinTime="08:00:00"
                                slotMaxTime="21:00:00"
                                events={filteredEventos}
                                eventContent={eventContent}
                                eventClick={(info) => {
                                    const ev = info.event;
                                    setSelectedEvent({
                                        id: ev.id,
                                        title: ev.title,
                                        start: ev.start?.toISOString() || '',
                                        end: ev.end?.toISOString() || '',
                                        description: ev.extendedProps.description,
                                        htmlLink: ev.extendedProps.htmlLink
                                    });
                                }}
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
                                height="auto"
                                eventColor="#D4AF37"
                                eventTextColor="#0D0D0D"
                                nowIndicator={true}
                                allDaySlot={false}
                                stickyHeaderDates={true}
                                expandRows={true}
                            />
                        </div>
                    )}
                </div>

                {/* Próximos agendamentos - Cards */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-2xl font-heading text-white tracking-widest uppercase">PRÓXIMOS <span className="text-barber-gold">ATENDIMENTOS</span></h2>
                        <span className="bg-barber-gold/10 text-barber-gold px-3 py-1 rounded-full text-xs font-bold">{filteredEventos.length} TOTAL</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEventos.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-barber-dark border border-dashed border-white/10 rounded-3xl">
                                <CalendarIcon size={48} className="mx-auto text-gray-700 mb-4" />
                                <p className="text-gray-500 uppercase tracking-widest text-sm">Nenhum agendamento encontrado para este filtro.</p>
                            </div>
                        ) : (
                            [...filteredEventos]
                                .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                                .map(ev => (
                                    <div key={ev.id} className="bg-barber-dark border border-white/5 p-6 rounded-2xl hover:border-barber-gold/50 transition-all hover:bg-barber-gray/30 group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="bg-barber-black border border-white/5 px-4 py-2 rounded-xl text-center group-hover:border-barber-gold transition-colors">
                                                <div className="text-xl font-bold text-barber-gold uppercase leading-none">{format(new Date(ev.start), 'HH:mm')}</div>
                                                <div className="text-[10px] text-gray-500 font-bold tracking-widest mt-1">INÍCIO</div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(ev.id)}
                                                className="p-2 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg text-white group-hover:text-barber-gold transition-colors">{ev.title}</h3>
                                            <div className="text-xs text-barber-accent uppercase tracking-widest mb-4">
                                                {format(new Date(ev.start), "dd 'de' MMMM", { locale: ptBR })}
                                            </div>
                                            {ev.description && (
                                                <p className="text-xs text-gray-500 leading-relaxed border-t border-white/5 pt-3 mt-3 italic line-clamp-3">
                                                    {ev.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* Modal de Detalhes */}
                {selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-barber-dark border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-scale-up">
                            <div className="relative h-24 bg-gradient-to-r from-barber-gold/20 to-transparent flex items-center px-8">
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div>
                                    <h3 className="text-2xl font-heading text-white tracking-widest uppercase">Detalhes do <span className="text-barber-gold">Agendamento</span></h3>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-barber-gold/10 p-2 rounded-lg text-barber-gold">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Data e Horário</p>
                                            <p className="text-white font-bold">{format(new Date(selectedEvent.start), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 border-t border-white/5 pt-4">
                                        <div className="bg-barber-gold/10 p-2 rounded-lg text-barber-gold">
                                            <Info size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Informações do Cliente</p>
                                            <p className="text-white font-bold text-lg mb-1">{selectedEvent.title}</p>
                                            <div className="space-y-2 mt-3">
                                                {selectedEvent.description?.split('\n').map((line, i) => {
                                                    if (line.includes('WhatsApp:')) {
                                                        const phone = line.replace('WhatsApp:', '').trim();
                                                        const clientName = selectedEvent.title.replace('Corte - ', '');
                                                        const message = encodeURIComponent(`Olá ${clientName}, esta na hora do seu corte! Favor encaminhar-se para a barbearia!`);
                                                        return (
                                                            <a key={i} href={`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`} target="_blank" className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-bold bg-green-400/5 px-3 py-2 rounded-xl">
                                                                <Phone size={14} /> {phone}
                                                            </a>
                                                        );
                                                    }
                                                    if (line.includes('Serviço:')) {
                                                        return (
                                                            <div key={i} className="flex items-center gap-2 text-barber-accent text-sm font-bold bg-white/5 px-3 py-2 rounded-xl">
                                                                <ScissorsIcon size={14} /> {line.replace('Serviço:', '').trim()}
                                                            </div>
                                                        );
                                                    }
                                                    return <p key={i} className="text-xs text-gray-400 italic">{line}</p>;
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => {
                                            handleDelete(selectedEvent.id);
                                            setSelectedEvent(null);
                                        }}
                                        className="flex-1 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 py-4 rounded-2xl transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Cancelar Horário
                                    </button>
                                    {selectedEvent.htmlLink && (
                                        <a
                                            href={selectedEvent.htmlLink}
                                            target="_blank"
                                            className="bg-barber-gold hover:bg-white text-barber-black p-4 rounded-2xl transition-all flex items-center justify-center"
                                            title="Ver no Google Calendar"
                                        >
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
        .fc {
          --fc-border-color: rgba(255, 255, 255, 0.05);
          --fc-button-bg-color: #1A1A1A;
          --fc-button-border-color: rgba(255, 255, 255, 0.1);
          --fc-button-hover-bg-color: #D4AF37;
          --fc-button-hover-border-color: #D4AF37;
          --fc-button-active-bg-color: #D4AF37;
          --fc-button-active-border-color: #D4AF37;
          --fc-today-bg-color: rgba(212, 175, 55, 0.05);
          font-family: var(--font-poppins), sans-serif;
        }
        .fc-toolbar-title {
          font-family: var(--font-cinzel), serif !important;
          color: #D4AF37;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 1.25rem !important;
        }
        .fc-col-header-cell-cushion {
          color: #C5A065;
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          padding: 12px 0 !important;
        }
        .fc-timegrid-slot-label-cushion {
          color: #555;
          font-size: 0.65rem;
          font-weight: bold;
        }
        .fc-event {
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          border: none !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .fc-timegrid-now-indicator-line {
          border-color: #D4AF37;
          border-width: 2px;
        }
        .fc-timegrid-now-indicator-arrow {
          border-color: #D4AF37;
          border-width: 5px;
        }
      `}</style>
        </div>
    );
}
