'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { addMinutes, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, Clock, Scissors, X } from 'lucide-react';
import Link from 'next/link';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '@/components/client/CalendarStyles.css';

type TimeSlot = {
  start: string;
  end: string;
};

type BarberSchedule = {
  dayId: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

type BarberProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  contactNumber?: string;
  phone?: string;
};

type ServiceOption = {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
};

type RawService = {
  id: string | number;
  title: string;
  price: number;
  durationMinutes?: number | string;
  duration?: number | string;
};

type FeedbackType = 'erro' | 'sucesso' | 'info';

type FeedbackMessage = {
  type: FeedbackType;
  text: string;
} | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://barberpro-api-v4kj.onrender.com/v1';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeService = (service: RawService): ServiceOption => {
  const rawDuration = service.durationMinutes ?? service.duration ?? 30;
  const parsedDuration = Number(rawDuration);

  return {
    id: String(service.id),
    title: String(service.title),
    price: Number(service.price || 0),
    durationMinutes: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 30,
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export default function PaginaAgendar() {
  const { barberId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [barberSchedule, setBarberSchedule] = useState<BarberSchedule[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);

  const [feedback, setFeedback] = useState<FeedbackMessage>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barberPhone, setBarberPhone] = useState('');

  const parsedBarberId = String(barberId || '');
  const selectedDurationMinutes = selectedService?.durationMinutes || 30;
  const isServiceIdUuid = selectedService ? UUID_REGEX.test(selectedService.id) : false;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const responseServices = await fetch(`${API_BASE_URL}/services?limit=100`);
        if (!responseServices.ok) {
          throw new Error('Não foi possível carregar os serviços no momento.');
        }

        const dataServices = await responseServices.json();
        const mappedServices = (dataServices.results || []).map(normalizeService);

        if (mappedServices.length > 0) {
          setServices(mappedServices);
          setSelectedService((current) => current || mappedServices[0]);
          return;
        }

        throw new Error('Nenhum serviço disponível para agendamento.');
      } catch (error) {
        const savedServices = localStorage.getItem(`barber_services_${parsedBarberId}`);
        if (savedServices) {
          const parsedServices = JSON.parse(savedServices).map(normalizeService);
          setServices(parsedServices);
          if (parsedServices.length > 0) {
            setSelectedService((current) => current || parsedServices[0]);
            setFeedback({
              type: 'info',
              text: 'Serviços carregados do catálogo local para manter o agendamento funcionando.',
            });
            return;
          }
        }

        const message = error instanceof Error ? error.message : 'Falha ao carregar serviços.';
        setFeedback({ type: 'erro', text: message });
      } finally {
        setLoading(false);
      }
    };

    if (parsedBarberId) {
      void fetchServices();
    }
  }, [parsedBarberId]);

  // Busca o telefone do barbeiro diretamente no perfil (a API de availability
  // não retorna o contactNumber, então precisamos de um fetch separado).
  useEffect(() => {
    if (!parsedBarberId) return;
    const fetchBarberPhone = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${parsedBarberId}`);
        if (!res.ok) return;
        const data = await res.json();
        const phone: string = data?.contactNumber || data?.phone || '';
        if (phone) setBarberPhone(phone);
      } catch {
        // Falha silenciosa — o botão do WhatsApp simplesmente não aparece
      }
    };
    void fetchBarberPhone();
  }, [parsedBarberId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!parsedBarberId || !selectedService) {
        return;
      }

      setIsFetchingSlots(true);
      try {
        const query = new URLSearchParams({
          barberId: parsedBarberId,
          date: selectedDate.toISOString(),
          serviceDurationMinutes: String(selectedService.durationMinutes),
        });

        if (UUID_REGEX.test(selectedService.id)) {
          query.set('serviceId', selectedService.id);
        }

        const responseAvailability = await fetch(`${API_BASE_URL}/availability?${query.toString()}`);
        const dataAvailability = await responseAvailability.json();

        if (!responseAvailability.ok) {
          throw new Error(dataAvailability?.message || 'Falha ao carregar disponibilidade.');
        }

        setBarber(dataAvailability.barber);
        setAvailableSlots(dataAvailability.availableSlots || []);

        if (dataAvailability.schedule && dataAvailability.schedule.length > 0) {
          setBarberSchedule(dataAvailability.schedule);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Falha ao consultar agenda.';
        setFeedback({ type: 'erro', text: message });
      } finally {
        setIsFetchingSlots(false);
      }
    };

    void fetchAvailability();
  }, [parsedBarberId, selectedDate, selectedService]);

  const isDayClosed = (date: Date) => {
    const dayOfWeek = date.getDay();
    const config = barberSchedule.find((schedule) => schedule.dayId === dayOfWeek);
    return Boolean(config && !config.isOpen);
  };

  const daySlots = useMemo(() => {
    if (availableSlots.length > 0) {
      return availableSlots;
    }

    const dayOfWeek = selectedDate.getDay();
    const config = barberSchedule.find((schedule) => schedule.dayId === dayOfWeek);

    if (!config || !config.isOpen) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);

    const current = new Date(selectedDate);
    current.setHours(startHour, startMinute, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(endHour, endMinute, 0, 0);

    while (current < end) {
      const slotStart = new Date(current);
      const slotEnd = addMinutes(slotStart, selectedDurationMinutes);

      if (!isBefore(slotStart, new Date()) && !isAfter(slotEnd, end)) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      current.setMinutes(current.getMinutes() + 30);
    }

    return slots;
  }, [availableSlots, barberSchedule, selectedDate, selectedDurationMinutes]);

  const handleBooking = (slot: TimeSlot) => {
    if (!selectedService) {
      setFeedback({ type: 'erro', text: 'Escolha um serviço antes de selecionar um horário.' });
      return;
    }

    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleServiceChange = (service: ServiceOption) => {
    setSelectedService(service);

    if (selectedSlot) {
      const slotStart = parseISO(selectedSlot.start);
      const slotEnd = addMinutes(slotStart, service.durationMinutes);
      setSelectedSlot({
        start: selectedSlot.start,
        end: slotEnd.toISOString(),
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const confirmBooking = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedSlot || !customerName || !customerPhone || !selectedService) {
      setFeedback({ type: 'erro', text: 'Preencha os campos obrigatórios para concluir o agendamento.' });
      return;
    }

    setIsSubmitting(true);
    let bookingCreated = false;

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: parsedBarberId,
          serviceId: isServiceIdUuid ? selectedService.id : undefined,
          serviceName: selectedService.title,
          servicePrice: selectedService.price,
          serviceDurationMinutes: selectedService.durationMinutes,
          datetimeStart: selectedSlot.start,
          guestName: customerName,
          guestPhone: customerPhone,
          email: customerEmail,
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData?.message || responseData?.error || 'Não foi possível concluir o agendamento.');
      }

      bookingCreated = true;

      // ── Redireciona para página de sucesso ───────────────────────────────
      const query = new URLSearchParams({
        barberId: parsedBarberId,
        barberName: `${barber?.firstName || ''} ${barber?.lastName || ''}`.trim() || 'Profissional',
        barberPhone,         // telefone buscado do perfil do barbeiro
        serviceName: selectedService.title,
        serviceDuration: String(selectedService.durationMinutes),
        servicePrice: String(selectedService.price),
        datetimeStart: selectedSlot.start,
        clientName: customerName,
        clientPhone: customerPhone,
      });

      router.push(`/agendar/sucesso?${query.toString()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro na conexão. Tente novamente.';
      setFeedback({ type: 'erro', text: message });
    } finally {
      setIsSubmitting(false);
      if (bookingCreated) {
        closeModal();
      }
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-barber-accent hover:text-barber-gold transition-colors mb-6 uppercase text-xs tracking-widest font-bold"
          >
            <ChevronLeft size={16} /> Voltar ao Início
          </Link>
          <h1 className="text-4xl md:text-5xl font-heading text-white mb-2">
            MARQUE SEU <span className="text-barber-gold">ESTILO</span>
          </h1>
          <p className="text-barber-accent uppercase tracking-widest text-xs flex items-center gap-2">
            <Scissors size={14} /> Profissional:{' '}
            <span className="text-white font-bold">{barber?.firstName || 'Especialista'}</span>
          </p>
        </header>

        {feedback && (
          <div
            className={`mb-8 rounded-2xl border px-4 py-3 flex items-start gap-3 ${feedback.type === 'erro'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              : feedback.type === 'sucesso'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-100'
              }`}
          >
            <AlertCircle size={18} className="mt-0.5" />
            <p className="text-sm uppercase tracking-wide font-semibold">{feedback.text}</p>
            <button
              onClick={() => setFeedback(null)}
              className="ml-auto text-xs uppercase tracking-widest opacity-80 hover:opacity-100"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-barber-gold flex items-center gap-2">
              <Scissors size={16} /> 1. Escolha o Serviço
            </h2>
            {services.length === 0 ? (
              <div className="bg-barber-dark border border-dashed border-white/10 rounded-2xl p-8 text-center">
                <p className="text-gray-400 text-sm uppercase tracking-widest">Nenhum serviço disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceChange(service)}
                    className={`p-4 rounded-2xl border text-left transition-all ${selectedService?.id === service.id
                      ? 'bg-barber-gold/10 border-barber-gold'
                      : 'bg-barber-dark border-white/5 hover:border-white/20'
                      }`}
                  >
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Serviço</p>
                    <h3 className="text-sm font-bold uppercase mb-3">{service.title}</h3>
                    <div className="flex items-center justify-between text-xs uppercase tracking-wider">
                      <span className="text-barber-gold">{formatCurrency(service.price)}</span>
                      <span className="text-gray-300">{service.durationMinutes} min</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-barber-gold flex items-center gap-2">
              <CalendarIcon size={16} /> 2. Escolha o Dia
            </h2>
            <div className="bg-barber-dark rounded-2xl border border-white/10 p-4 sm:p-6 w-full flex justify-center">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                minDate={new Date()}
                locale="pt-BR"
                className="custom-calendar"
                tileDisabled={({ date }) => {
                  const today = startOfDay(new Date());
                  return date < today || isDayClosed(date);
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-barber-gold flex items-center gap-2">
              <Clock size={16} /> 3. Escolha o Horário
            </h2>

            {daySlots.length === 0 ? (
              <div className="bg-barber-dark border border-dashed border-white/10 rounded-2xl p-10 text-center">
                <p className="text-gray-500 text-sm uppercase tracking-widest">Sem horários disponíveis para este dia.</p>
              </div>
            ) : (
              <>
                {isFetchingSlots && (
                  <p className="text-xs uppercase tracking-widest text-barber-accent">Atualizando horários...</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {daySlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleBooking(slot)}
                      className="h-24 rounded-2xl flex flex-col items-center justify-center transition-all border bg-barber-dark border-white/5 text-white hover:border-barber-gold hover:text-barber-gold group px-2"
                    >
                      <span className="text-[9px] uppercase font-bold tracking-widest mb-1 opacity-50">Disponível</span>
                      <span className="text-base font-heading font-bold leading-none">
                        {format(parseISO(slot.start), 'HH:mm')} - {format(parseISO(slot.end), 'HH:mm')}
                      </span>
                      <span className="text-[9px] uppercase mt-1 font-bold tracking-tighter opacity-70">
                        {selectedService ? formatCurrency(selectedService.price) : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-4">Problemas ao agendar?</p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            className="text-green-500 font-bold hover:text-white transition-colors uppercase text-sm tracking-widest"
            rel="noreferrer"
          >
            Suporte via WhatsApp
          </a>
        </div>
      </div>

      {isModalOpen && selectedSlot && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scale-up my-auto">
            <header className="bg-gradient-to-b from-barber-gold/10 to-transparent p-12 pb-8 relative border-b border-white/5">
              <button
                onClick={closeModal}
                className="absolute top-10 right-10 text-gray-500 hover:text-white transition-all hover:rotate-90 duration-300"
              >
                <X size={32} />
              </button>
              <div className="space-y-2">
                <h3 className="text-4xl md:text-5xl font-heading text-white tracking-[0.1em] uppercase leading-tight">
                  FINALIZAR <span className="text-barber-gold">RESERVA</span>
                </h3>
                <p className="text-barber-accent text-xs md:text-sm uppercase tracking-[0.3em] font-bold">
                  {format(parseISO(selectedSlot.start), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-xs uppercase tracking-wider text-white/70">
                  {selectedService.title} • {selectedService.durationMinutes} min • {formatCurrency(selectedService.price)}
                </p>
              </div>
            </header>

            <form onSubmit={confirmBooking} className="p-12 space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">
                  Serviço selecionado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceChange(service)}
                      className={`rounded-2xl border p-4 text-left transition-all ${selectedService.id === service.id
                        ? 'border-barber-gold bg-barber-gold/10'
                        : 'border-white/10 bg-barber-black/40 hover:border-white/30'
                        }`}
                    >
                      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Serviço</p>
                      <p className="text-sm font-bold uppercase">{service.title}</p>
                      <p className="text-xs uppercase tracking-wide text-barber-gold mt-1">
                        {service.durationMinutes} min • {formatCurrency(service.price)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                <div className="space-y-3">
                  <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">
                    Nome Completo *
                  </label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Ex: Ryan Gonçalves"
                    className="w-full bg-barber-black border border-white/10 focus:border-barber-gold rounded-2xl px-8 py-5 outline-none transition-all text-lg placeholder:text-gray-800 shadow-2xl focus:ring-2 focus:ring-barber-gold/10"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">
                    WhatsApp / Celular *
                  </label>
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    placeholder="DDD + Número"
                    className="w-full bg-barber-black border border-white/10 focus:border-barber-gold rounded-2xl px-8 py-5 outline-none transition-all text-lg placeholder:text-gray-800 shadow-2xl focus:ring-2 focus:ring-barber-gold/10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] text-gray-500 font-bold uppercase tracking-[0.25em] ml-2">
                  E-mail para confirmação (Opcional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="Ex: seuemail@exemplo.com"
                  className="w-full bg-barber-black border border-white/10 focus:border-barber-gold rounded-2xl px-8 py-5 outline-none transition-all text-lg placeholder:text-gray-800 shadow-2xl focus:ring-2 focus:ring-barber-gold/10"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-barber-gold hover:bg-white text-barber-black py-6 rounded-2xl font-bold uppercase tracking-[0.35em] text-base transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(212,175,55,0.15)] group"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-barber-black/30 border-t-barber-black rounded-full animate-spin" />
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
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
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
