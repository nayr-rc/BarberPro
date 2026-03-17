'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarPlus, CheckCircle2, ChevronLeft, RefreshCw, MessageCircle } from 'lucide-react';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

function AgendamentoSucessoConteudo() {
  const params = useSearchParams();

  const appointmentId = params.get('appointmentId') || '';
  const barberId = params.get('barberId') || '';
  const barberName = params.get('barberName') || 'Profissional';
  const barberPhone = params.get('barberPhone') || '';
  const serviceName = params.get('serviceName') || 'Serviço';
  const serviceDuration = Number(params.get('serviceDuration') || 30);
  const servicePrice = Number(params.get('servicePrice') || 0);
  const datetimeStart = params.get('datetimeStart');
  const clientName = params.get('clientName') || '';
  const clientPhone = params.get('clientPhone') || '';

  const appointmentDate = datetimeStart ? parseISO(datetimeStart) : new Date();

  const [dynamicWhatsappLink, setDynamicWhatsappLink] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLink() {
      if (appointmentId) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://barberpro-api-v4kj.onrender.com/v1'}/appointments/${appointmentId}/whatsapp-link`);
          if (res.ok) {
            const data = await res.json();
            if (data.link) {
              setDynamicWhatsappLink(data.link);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    fetchLink();
  }, [appointmentId]);

  // Link para adicionar ao Google Agenda
  const eventStart = format(appointmentDate, "yyyyMMdd'T'HHmmss'Z'");
  const eventEnd = format(
    new Date(appointmentDate.getTime() + serviceDuration * 60 * 1000),
    "yyyyMMdd'T'HHmmss'Z'"
  );
  const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Agendamento - ${serviceName}`
  )}&details=${encodeURIComponent(`Agendamento com ${barberName}`)}&dates=${eventStart}/${eventEnd}`;

  // Fallback if the dynamic link hasn't loaded or failed
  const whatsappMessage = [
    `✂️ *Novo Agendamento - BarberPro*`,
    ``,
    `👤 *Cliente:* ${clientName || 'Cliente'}`,
    `📱 *WhatsApp:* ${clientPhone || 'Não informado'}`,
    `💈 *Serviço:* ${serviceName}`,
    `📅 *Data e Hora:* ${format(appointmentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    ``,
    `_Acesse o painel do BarberPro para confirmar._`,
  ].join('\n');

  const cleanPhone = barberPhone.replace(/\D/g, '');
  const fallbackWhatsappLink = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const finalWhatsappLink = dynamicWhatsappLink || fallbackWhatsappLink;

  return (
    <div className="min-h-screen bg-barber-black text-white font-body flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">

        {/* Card de confirmação */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
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
              <span className="font-bold text-white">
                {format(appointmentDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
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

          {/* Botão WhatsApp em destaque — só aparece se o barbeiro tem telefone cadastrado */}
          {finalWhatsappLink && (
            <a
              href={finalWhatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full rounded-2xl bg-green-500 hover:bg-green-400 active:scale-[0.98] transition-all px-6 py-4 text-black font-black text-sm uppercase tracking-widest shadow-lg shadow-green-500/20 mb-4"
            >
              {/* Ícone SVG do WhatsApp */}
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.51-5.742-1.47l-6.251 1.637zm6.756-3.715c1.558.924 3.012 1.385 4.526 1.385 5.517 0 10.007-4.49 10.007-10.007 0-5.516-4.49-10.007-10.007-10.007-5.517 0-10.007 4.491-10.007 10.007 0 1.954.568 3.456 1.649 5.328l-.946 3.453 3.535-.924zm10.169-7.464c-.114-.19-.418-.304-.875-.532-.456-.228-2.698-1.332-3.116-1.484-.418-.152-.722-.228-.102-.304.304-.114.875-.684 1.065-.875.19-.19.342-.418.342-.684s-.114-.494-.228-.684c-.114-.19-.418-.494-.875-.722s-.342-.532-.76-.532h-.19c-.418 0-.989.152-1.484.684-.494.532-1.824 1.786-1.824 4.37s1.862 5.054 2.128 5.434c.266.38 3.686 5.624 8.93 7.828 1.248.528 2.217.848 2.972 1.088 1.254.396 2.392.342 3.292.208.972-.144 2.698-1.102 3.078-2.128.38-1.026.38-1.938.266-2.128z" />
              </svg>
              Avisar barbeiro no WhatsApp
            </a>
          )}

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
    </div>
  );
}

function AgendamentoSucessoFallback() {
  return (
    <div className="min-h-screen bg-barber-black text-white font-body flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-barber-accent">
          Carregando detalhes do agendamento...
        </p>
      </div>
    </div>
  );
}

export default function AgendamentoSucessoPage() {
  return (
    <Suspense fallback={<AgendamentoSucessoFallback />}>
      <AgendamentoSucessoConteudo />
    </Suspense>
  );
}
