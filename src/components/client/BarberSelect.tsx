"use client";

import { Barber } from "@/lib/types";

interface BarberSelectProps {
  barbers: Barber[];
  selectedBarber: Barber | null;
  onSelect: (barber: Barber) => void;
}

export default function BarberSelect({
  barbers,
  selectedBarber,
  onSelect,
}: BarberSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-barber-beige">2. Selecione o Barbeiro</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => onSelect(barber)}
            className={`p-4 rounded-lg border-2 transition text-center ${
              selectedBarber?.id === barber.id
                ? "bg-barber-brown border-barber-accent"
                : "bg-barber-dark border-barber-brown hover:border-barber-accent"
            } ${!barber.active ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!barber.active}
          >
            <div className="text-3xl mb-2">💈</div>
            <h4 className="text-barber-beige font-bold">{barber.name}</h4>
            {!barber.active && (
              <p className="text-red-400 text-xs mt-2">Indisponível</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
