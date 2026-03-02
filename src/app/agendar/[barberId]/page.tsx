'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { format, addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Scissors, Clock, Calendar as CalendarIcon, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

export default function PaginaAgendar() {
    const { barberId } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [barber, setBarber] = useState<any>(null);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [days, setDays] = useState<Date[]>([]);
    const [barberSchedule, setBarberSchedule] = useState<any[]>([]);

    // Services
    const [services, setServices] = useState<{ id: string, title: string, price: number }[]>([]);
    const [selectedService, setSelectedService] = useState<any>(null);

    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Generate next 14 days once on mount
        const nextDays = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
        setDays(nextDays);
        setSelectedDate(nextDays[0]);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Load Barber Schedule (localStorage) - Fallback
                const savedSchedule = localStorage.getItem(`barber_schedule_${barberId}`);
                if (savedSchedule) {
                    setBarberSchedule(JSON.parse(savedSchedule));
                }

                // 2. Get internal availability (Professional info + Database Schedule)
                const responseAvailability = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1'}/availability?barberId=${barberId}&date=${selectedDate.toISOString()}`);
                const dataAvailability = await responseAvailability.json();

                setBarber(dataAvailability.barber);
                setAvailableSlots(dataAvailability.availableSlots || []);
                if (dataAvailability.schedule && dataAvailability.schedule.length > 0) {
                    setBarberSchedule(dataAvailability.schedule);
                }

                // 3. Get Google Calendar occupied slots
                const responseOccupied = await fetch(`/api/calendar/occupied?calendarId=${dataAvailability.barber?.googleCalendarId || 'primary'}`);
                const dataOccupied = await responseOccupied.json();
                setOccupiedSlots(dataOccupied.occupied || []);

                // 4. Load services (barber's configured service catalog)
                const savedServices = localStorage.getItem(`barber_services_${barberId}`);
                if (savedServices) {
                    const parsed = JSON.parse(savedServices);
                    setServices(parsed);
                    if (parsed.length > 0) setSelectedService(parsed[0]);
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [barberId, selectedDate]);

    // Generate slots (Prioritizes Database, fallbacks to Local Schedule Generation)
    const daySlots = useMemo(() => {
        // If DB returned accurate available slots, use them
        if (availableSlots && availableSlots.length > 0) return availableSlots;

        // Otherwise, generate locally from the schedule (Supports no-database mode)
        if (!barberSchedule || barberSchedule.length === 0) return [];

        const dayOfWeek = selectedDate.getDay();
        const config = barberSchedule.find(s => s.dayId === dayOfWeek);

        if (!config || !config.isOpen) return [];

        const slots = [];
        const [startH, startM] = (config.startTime || "09:00").split(':').map(Number);
        const [endH, endM] = (config.endTime || "19:00").split(':').map(Number);

        let current = new Date(selectedDate);
        current.setHours(startH, startM, 0, 0);

        const end = new Date(selectedDate);
        end.setHours(endH, endM, 0, 0);

        while (current < end) {
            const slotStart = new Date(current);
            current.setMinutes(current.getMinutes() + 30);
            const slotEnd = new Date(current);

            slots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString()
            });
        }
        return slots;
    }, [availableSlots, barberSchedule, selectedDate]);

    // Check if a specific slot is occupied by Google Calendar
    const isOccupied = (slot: any) => {
        const slotStart = parseISO(slot.start).getTime();
        const slotEnd = parseISO(slot.end).getTime();

        return occupiedSlots.some(occ => {
            const occStart = parseISO(occ.start).getTime();
            const occEnd = parseISO(occ.end).getTime();
            // Check for overlap
            return (slotStart < occEnd && slotEnd > occStart);
        });
    };

    const handleBooking = (slot: any) => {
        if (isOccupied(slot)) return;
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const confirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !customerName || !customerPhone) return;

        setIsSubmitting(true);
        const start = selectedSlot.start;
        const end = selectedSlot.end;
        try {
            const res = await fetch('/api/calendar/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    calendarId: barber?.googleCalendarId || 'primary',
                    start,
                    end,
                    customerName,
                    customerPhone,
                    customerEmail, // Pass email even if optional
                    serviceName: selectedService?.title || 'Corte', // Include service name
                    price: selectedService?.price || 0, // Include price
                    barberName: barber?.firstName,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Horário marcado com sucesso! 🎉');

                // Email notification
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: 'nayr_rebello@hotmail.com',
                            subject: `Novo Agendamento: ${customerName}`,
                            html: `
                                    <div style="font-family: sans-serif; background-color: #0D0D0D; color: #FFFFFF; padding: 40px; border-radius: 20px;">
                                      <h2 style="color: #D4AF37; text-transform: uppercase;">Novo Agendamento</h2>
                                      <p><strong>Cliente:</strong> ${customerName}</p>
                                      <p><strong>WhatsApp:</strong> ${customerPhone}</p>
                                      ${customerEmail ? `<p><strong>E-mail:</strong> ${customerEmail}</p>` : ''}
                                      <p><strong>Serviço:</strong> ${selectedService?.title || 'Não informado'}</p>
                                      <p><strong>Valor:</strong> R$ ${selectedService?.price?.toFixed(2) || '0,00'}</p>
                                      <p><strong>Horário:</strong> ${format(parseISO(start), "dd/MM/yyyy 'às' HH:mm")}</p>
                                      <div style="margin-top: 20px;">
                                        <a href="${data.htmlLink}" style="background-color: #D4AF37; color: #000; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Ver no Google</a>
                                      </div>
                                    </div>
                                `
                        }),
                    });
                } catch (e) { }

                setIsModalOpen(false);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerEmail('');
                router.refresh();
                window.location.reload();
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (err) {
            alert('Erro na conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-barber-black flex items-center justify-center">
                <div className="text-barber-gold animate-pulse font-heading text-2xl tracking-widest">CARREGANDO...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-barber-black text-white font-body selection:bg-barber-gold selection:text-black">
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <header className="mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-barber-accent hover:text-barber-gold transition-colors mb-6 uppercase text-xs tracking-widest font-bold">
                        <ChevronLeft size={16} /> Voltar ao Início
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-heading text-white mb-2">
                        MARQUE SEU <span className="text-barber-gold">ESTILO</span>
                    </h1>
                    <p className="text-barber-accent uppercase tracking-widest text-xs flex items-center gap-2">
                        <Scissors size={14} /> Profissional: <span className="text-white font-bold">{barber?.firstName || 'Especialista'}</span>
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Date Selector */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-barber-gold flex items-center gap-2">
                            <CalendarIcon size={16} /> 1. Escolha o Dia
                        </h2>
                        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {days.map((day, i) => {
                                const dayOfWeek = day.getDay();
                                const config = barberSchedule.find(s => s.dayId === dayOfWeek);
                                const isClosed = config ? !config.isOpen : false;
                                const selected = isSameDay(day, selectedDate);

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(day)}
                                        className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-all border relative overflow-hidden group ${selected
                                            ? 'bg-barber-gold border-barber-gold text-barber-black'
                                            : isClosed
                                                ? 'bg-zinc-900/50 border-white/5 text-zinc-600 opacity-60 cursor-not-allowed'
                                                : 'bg-barber-dark border-white/5 text-gray-400 hover:border-barber-gold/50'
                                            }`}
                                    >
                                        <span className="text-[10px] uppercase font-bold tracking-widest mb-1">
                                            {format(day, 'EEE', { locale: ptBR })}
                                        </span>
                                        <span className="text-2xl font-heading font-bold leading-none">
                                            {format(day, 'dd')}
                                        </span>
                                        <span className="text-[10px] uppercase mt-1 opacity-70">
                                            {format(day, 'MMM', { locale: ptBR })}
                                        </span>
                                        {isClosed && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-[8px] font-bold uppercase tracking-tighter text-white/50 -rotate-45">Fechado</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Grid Selector */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-barber-gold flex items-center gap-2">
                            <Clock size={16} /> 2. Escolha o Horário
                        </h2>

                        {daySlots.length === 0 ? (
                            <div className="bg-barber-dark border border-dashed border-white/10 rounded-2xl p-10 text-center">
                                <p className="text-gray-500 text-sm uppercase tracking-widest">Sem horários disponíveis para este dia.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                {daySlots.map((slot, i) => {
                                    const occupied = isOccupied(slot);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleBooking(slot)}
                                            disabled={occupied}
                                            className={`h-24 rounded-2xl flex flex-col items-center justify-center transition-all border ${occupied
                                                ? 'bg-zinc-900 border-white/5 text-zinc-700 grayscale cursor-not-allowed opacity-30 px-2'
                                                : 'bg-barber-dark border-white/5 text-white hover:border-barber-gold hover:text-barber-gold group px-2'
                                                }`}
                                        >
                                            <span className="text-[9px] uppercase font-bold tracking-widest mb-1 opacity-50">
                                                {occupied ? 'OCUPADO' : 'HORÁRIO'}
                                            </span>
                                            <span className="text-xl font-heading font-bold leading-none">
                                                {format(parseISO(slot.start), 'HH:mm')}
                                            </span>
                                            <span className="text-[9px] uppercase mt-1 font-bold tracking-tighter opacity-70">
                                                {occupied ? 'RESERVADO' : 'DISPONÍVEL'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-center">
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-4">Problemas ao agendar?</p>
                    <a href="https://wa.me/5511999999999" target="_blank" className="text-green-500 font-bold hover:text-white transition-colors uppercase text-sm tracking-widest">
                        Suporte via WhatsApp
                    </a>
                </div>
            </div>

            {/* Modal de Pré-Registro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-up my-auto">
                        <header className="bg-gradient-to-b from-barber-gold/10 to-transparent p-12 pb-8 relative border-b border-white/5">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-10 right-10 text-gray-500 hover:text-white transition-all hover:rotate-90 duration-300"
                            >
                                <X size={32} />
                            </button>
                            <div className="space-y-2">
                                <h3 className="text-4xl md:text-5xl font-heading text-white tracking-[0.1em] uppercase leading-tight">
                                    FINALIZAR <span className="text-barber-gold">RESERVA</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] w-12 bg-barber-gold/40"></div>
                                    <p className="text-barber-accent text-xs md:text-sm uppercase tracking-[0.3em] font-bold">
                                        {selectedSlot && `${format(parseISO(selectedSlot.start), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}`}
                                    </p>
                                </div>
                            </div>
                        </header>

                        <form onSubmit={confirmBooking} className="p-12 space-y-10">
                            {/* Service Selection Section */}
                            <div className="space-y-4">
                                <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">Selecione o Serviço *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => setSelectedService(service)}
                                            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${selectedService?.id === service.id
                                                ? 'bg-barber-gold/10 border-barber-gold shadow-[0_0_20px_rgba(212,175,55,0.1)]'
                                                : 'bg-barber-black/40 border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="space-y-1">
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedService?.id === service.id ? 'text-barber-gold' : 'text-gray-500'}`}>
                                                    ESCOLHER
                                                </p>
                                                <h4 className="text-sm font-bold text-white uppercase truncate">{service.title}</h4>
                                                <p className="text-barber-gold font-heading text-lg leading-none mt-1">
                                                    R$ {service.price.toFixed(2)}
                                                </p>
                                            </div>
                                            {selectedService?.id === service.id && (
                                                <div className="absolute top-3 right-3 text-barber-gold animate-in fade-in zoom-in">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                                <div className="space-y-3">
                                    <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">Nome Completo *</label>
                                    <input
                                        required
                                        type="text"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        placeholder="Ex: Ryan Gonçalves"
                                        className="w-full bg-barber-black border border-white/10 focus:border-barber-gold rounded-2xl px-8 py-5 outline-none transition-all text-lg placeholder:text-gray-800 shadow-2xl focus:ring-2 focus:ring-barber-gold/10"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">WhatsApp / Celular *</label>
                                    <input
                                        required
                                        type="tel"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        placeholder="DDD + Número"
                                        className="w-full bg-barber-black border border-white/10 focus:border-barber-gold rounded-2xl px-8 py-5 outline-none transition-all text-lg placeholder:text-gray-800 shadow-2xl focus:ring-2 focus:ring-barber-gold/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">E-mail para confirmação (Opcional)</label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={e => setCustomerEmail(e.target.value)}
                                    placeholder="Ex: seuemail@exemplo.com"
                                    className="w-full bg-barber-black border border-white/10 focus:border-barber-gold rounded-2xl px-8 py-5 outline-none transition-all text-lg placeholder:text-gray-800 shadow-2xl focus:ring-2 focus:ring-barber-gold/10"
                                />
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-barber-gold hover:bg-white text-barber-black py-6 rounded-2xl font-bold uppercase tracking-[0.4em] text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(212,175,55,0.15)] group"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-barber-black/30 border-t-barber-black rounded-full animate-spin"></div>
                                            <span>PROCESSANDO...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>CONFIRMAR AGENDAMENTO</span>
                                            <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest">
                                    Ao confirmar, você concorda com nossos termos de agendamento.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
                
                .animate-scale-up {
                    animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
