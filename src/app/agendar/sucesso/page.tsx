'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarPlus, CheckCircle2, ChevronLeft, RefreshCw } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export default function AgendamentoSucessoPage() {
  const params = useSearchParams();

  const barberId = params.get('barberId') || '';
  const barberName = params.get('barberName') || 'Profissional';
  const serviceName = params.get('serviceName') || 'Serviço';
  const serviceDuration = Number(params.get('serviceDuration') || 30);
  const servicePrice = Number(params.get('servicePrice') || 0);
  const datetimeStart = params.get('datetimeStart');

  const appointmentDate = datetimeStart ? parseISO(datetimeStart) : new Date();
  const eventStart = format(appointmentDate, "yyyyMMdd'T'HHmmss'Z'");
  const eventEnd = format(new Date(appointmentDate.getTime() + serviceDuration * 60 * 1000), "yyyyMMdd'T'HHmmss'Z'");
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Agendamento - ${serviceName}`
  )}&details=${encodeURIComponent(`Agendamento com ${barberName}`)}&dates=${eventStart}/${eventEnd}`;

  return (
    <div className="min-h-screen bg-barber-black text-white font-body flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
        <div className="flex items-center gap-3 text-emerald-400 mb-6">
          <CheckCircle2 size={28} />
          <p className="text-xs uppercase tracking-[0.25em] font-bold">Agendamento confirmado</p>
        </div>

        <h1 className="text-3xl md:text-4xl font-heading uppercase tracking-[0.08em] mb-3">
          Tudo certo com sua reserva
        </h1>
        <p className="text-sm text-gray-300 uppercase tracking-wider mb-8">
          Seu horário foi salvo com sucesso. Confira os detalhes abaixo.
        </p>

        <div className="space-y-4 border border-white/10 rounded-2xl p-5 bg-black/30 mb-8">
          <div className="flex justify-between text-xs uppercase tracking-widest">
            <span className="text-gray-400">Profissional</span>
            <span className="font-bold text-white">{barberName}</span>
          </div>
          <div className="flex justify-between text-xs uppercase tracking-widest">
            <span className="text-gray-400">Serviço</span>
            <span className="font-bold text-white">{serviceName}</span>
          </div>
          <div className="flex justify-between text-xs uppercase tracking-widest">
            <span className="text-gray-400">Data e hora</span>
            <span className="font-bold text-white">{format(appointmentDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between text-xs uppercase tracking-widest">
            <span className="text-gray-400">Duração</span>
            <span className="font-bold text-white">{serviceDuration} min</span>
          </div>
          <div className="flex justify-between text-xs uppercase tracking-widest">
            <span className="text-gray-400">Valor</span>
            <span className="font-bold text-barber-gold">{formatCurrency(servicePrice)}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <a
            href={calendarLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
          >
            <CalendarPlus size={16} /> Adicionar lembrete
          </a>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} /> Voltar
          </Link>
          <Link
            href={barberId ? `/agendar/${barberId}` : '/'}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-barber-gold/40 bg-barber-gold/10 px-4 py-3 text-xs uppercase tracking-[0.2em] font-bold text-barber-gold hover:bg-barber-gold/20 transition-colors"
          >
            <RefreshCw size={16} /> Novo agendamento
          </Link>
        </div>
      </div>
    </div>
  );
}
