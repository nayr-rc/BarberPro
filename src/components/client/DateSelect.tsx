"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarStyles.css";

interface DateSelectProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export default function DateSelect({ selectedDate, onSelect }: DateSelectProps) {
  // Disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-barber-beige">3. Selecione a Data</h3>
      <div className="bg-barber-dark rounded-lg border border-barber-brown p-6 w-full flex justify-center">
        <Calendar
          onChange={(date) => onSelect(date as Date)}
          value={selectedDate}
          minDate={new Date()}
          tileDisabled={({ date }) => isDateDisabled(date)}
          className="custom-calendar"
        />
      </div>
      {selectedDate && (
        <div className="text-center text-barber-beige">
          Data selecionada:{" "}
          <span className="font-bold text-barber-accent">
            {selectedDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
