"use client";

import Link from "next/link";

export default function BookingConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-barber-dark border border-barber-brown rounded-lg p-8 text-center space-y-6">
        <div className="text-6xl">✓</div>
        
        <h1 className="text-3xl font-bold text-barber-beige">
          Reserva Confirmada!
        </h1>
        
        <div className="bg-barber-brown/20 border border-barber-brown rounded-lg p-6 text-left space-y-3">
          <p className="text-barber-accent">
            <span className="font-bold">ID da Reserva:</span>
            <br />
            <span className="text-barber-beige">#BRB-2026-0213-001</span>
          </p>
          <p className="text-barber-accent">
            <span className="font-bold">Email de Confirmação:</span>
            <br />
            <span className="text-barber-beige">Um email foi enviado para você</span>
          </p>
        </div>

        <div className="bg-barber-brown rounded-lg p-4 space-y-2">
          <h3 className="text-barber-beige font-bold">Próximas Etapas:</h3>
          <ul className="text-barber-accent text-sm space-y-1 text-left">
            <li>✓ Sua reserva foi confirmada</li>
            <li>• Chegue 5 minutos antes do horário</li>
            <li>• Você pode cancelar até 24h antes</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/client"
            className="block w-full px-6 py-3 bg-barber-accent text-barber-black font-bold rounded-lg hover:bg-barber-brown transition"
          >
            Voltar ao Dashboard
          </Link>
          <Link
            href="/client/appointments"
            className="block w-full px-6 py-3 border-2 border-barber-accent text-barber-accent font-bold rounded-lg hover:bg-barber-accent hover:text-barber-black transition"
          >
            Meus Agendamentos
          </Link>
        </div>
      </div>
    </div>
  );
}
