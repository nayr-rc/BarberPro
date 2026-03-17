"use client";

import { Service, Barber } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookingSummaryProps {
  service: Service | null;
  barber: Barber | null;
  date: Date | null;
  time: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function BookingSummary({
  service,
  barber,
  date,
  time,
  onConfirm,
  onCancel,
  isLoading,
}: BookingSummaryProps) {
  const isComplete = service && barber && date && time;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-barber-beige">5. Confirmação da Reserva</h3>
      
      <div className="bg-barber-dark border-2 border-barber-brown rounded-lg p-6 space-y-4">
        {/* Summary Items */}
        <div className="space-y-3">
          {service ? (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown">
              <span className="text-barber-accent">Serviço:</span>
              <span className="text-barber-beige font-bold">{service.name}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown opacity-50">
              <span className="text-barber-accent">Serviço:</span>
              <span className="text-barber-beige">Não selecionado</span>
            </div>
          )}

          {barber ? (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown">
              <span className="text-barber-accent">Barbeiro:</span>
              <span className="text-barber-beige font-bold">{barber.name}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown opacity-50">
              <span className="text-barber-accent">Barbeiro:</span>
              <span className="text-barber-beige">Não selecionado</span>
            </div>
          )}

          {date ? (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown">
              <span className="text-barber-accent">Data:</span>
              <span className="text-barber-beige font-bold">
                {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown opacity-50">
              <span className="text-barber-accent">Data:</span>
              <span className="text-barber-beige">Não selecionada</span>
            </div>
          )}

          {time ? (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown">
              <span className="text-barber-accent">Horário:</span>
              <span className="text-barber-beige font-bold">{time}</span>
            </div>
          ) : (
            <div className="flex justify-between items-center pb-3 border-b border-barber-brown opacity-50">
              <span className="text-barber-accent">Horário:</span>
              <span className="text-barber-beige">Não selecionado</span>
            </div>
          )}
        </div>

        {/* Price */}
        {service && (
          <div className="bg-barber-brown rounded p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-barber-beige font-bold">Valor Total:</span>
              <span className="text-2xl font-bold text-barber-accent">
                R$ {service.price.toFixed(2)}
              </span>
            </div>
            {service.durationMinutes && (
              <p className="text-barber-accent text-sm mt-2">
                ⏱️ Duração: {service.durationMinutes} minutos
              </p>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 rounded-lg border-2 border-barber-brown text-barber-beige hover:bg-barber-brown transition disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!isComplete || isLoading}
          className={`flex-1 px-6 py-3 rounded-lg font-bold transition ${
            isComplete && !isLoading
              ? "bg-barber-accent text-barber-black hover:bg-barber-brown cursor-pointer"
              : "bg-barber-brown text-barber-beige opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Processando..." : "Confirmar Reserva"}
        </button>
      </div>

      {!isComplete && (
        <p className="text-center text-barber-accent text-sm">
          Complete todas as etapas para confirmar sua reserva
        </p>
      )}
    </div>
  );
}
