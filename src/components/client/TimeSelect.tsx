"use client";

import { TimeSlot } from "@/lib/types";

interface TimeSelectProps {
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

export default function TimeSelect({
  timeSlots,
  selectedTime,
  onSelect,
}: TimeSelectProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-barber-beige">4. Selecione o Horário</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onSelect(slot.time)}
            disabled={!slot.available}
            className={`py-3 px-2 rounded-lg border-2 font-semibold transition ${
              selectedTime === slot.time
                ? "bg-barber-accent text-barber-black border-barber-accent"
                : slot.available
                ? "bg-barber-dark text-barber-beige border-barber-brown hover:border-barber-accent hover:bg-barber-brown"
                : "bg-barber-dark text-barber-brown border-barber-brown opacity-50 cursor-not-allowed"
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
      {timeSlots.every((s) => !s.available) && (
        <p className="text-red-400 text-center text-sm">
          Nenhum horário disponível para esta data
        </p>
      )}
    </div>
  );
}
