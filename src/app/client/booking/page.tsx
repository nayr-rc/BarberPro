"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ServiceSelect from "@/components/client/ServiceSelect";
import BarberSelect from "@/components/client/BarberSelect";
import DateSelect from "@/components/client/DateSelect";
import TimeSelect from "@/components/client/TimeSelect";
import BookingSummary from "@/components/client/BookingSummary";
import { Service, Barber, TimeSlot, BookingStep } from "@/lib/types";

// Mock data - replace with API calls
const mockServices: Service[] = [
  { id: "1", name: "Corte", price: 45.0, durationMinutes: 30 },
  { id: "2", name: "Barba", price: 35.0, durationMinutes: 20 },
  { id: "3", name: "Corte + Barba", price: 70.0, durationMinutes: 50 },
  { id: "4", name: "Tingimento", price: 60.0, durationMinutes: 45 },
];

const mockBarbers: Barber[] = [
  { id: "1", name: "João Silva", active: true },
  { id: "2", name: "Carlos Santos", active: true },
  { id: "3", name: "Pedro Costa", active: true },
];

// Generate time slots from 9:00 to 18:00
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      slots.push({
        time,
        // Mock: disable some slots
        available: Math.random() > 0.3,
      });
    }
  }
  return slots;
};

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [booking, setBooking] = useState<BookingStep>({
    service: null,
    barber: null,
    date: null,
    time: null,
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [isLoading, setIsLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    // Generate new time slots when date changes
    if (booking.date) {
      setTimeSlots(generateTimeSlots());
    }
  }, [booking.date]);

  const handleServiceSelect = (service: Service) => {
    setBooking({ ...booking, service });
    setCurrentStep(2);
  };

  const handleBarberSelect = (barber: Barber) => {
    setBooking({ ...booking, barber });
    setCurrentStep(3);
  };

  const handleDateSelect = (date: Date) => {
    setBooking({ ...booking, date });
    setCurrentStep(4);
  };

  const handleTimeSelect = (time: string) => {
    setBooking({ ...booking, time });
    setCurrentStep(5);
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Here you would send the booking data to the backend
      console.log("Booking confirmed:", booking);
      
      setBookingConfirmed(true);
      
      // Redirect to confirmation page after 2 seconds
      setTimeout(() => {
        router.push("/client/booking-confirmation");
      }, 2000);
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Erro ao confirmar reserva. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const newStep = currentStep - 1;
    if (newStep < 1) {
      router.push("/client");
      return;
    }
    setCurrentStep(newStep);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="text-6xl animate-bounce">✓</div>
          <h2 className="text-4xl font-bold text-barber-beige">
            Reserva Confirmada!
          </h2>
          <p className="text-barber-accent text-xl">
            Sua reserva foi agendada com sucesso
          </p>
          <p className="text-barber-beige text-lg">
            Redirecionando para detalhes da reserva...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-barber-beige mb-2">
            Agende seu Horário
          </h1>
          <p className="text-barber-accent">
            Passo {currentStep} de 5
          </p>
          
          {/* Progress Bar */}
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition ${
                  step <= currentStep
                    ? "bg-barber-accent"
                    : "bg-barber-brown"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-barber-dark border border-barber-brown rounded-lg p-8 space-y-8">
          {currentStep === 1 && (
            <ServiceSelect
              services={mockServices}
              selectedService={booking.service}
              onSelect={handleServiceSelect}
            />
          )}

          {currentStep === 2 && (
            <BarberSelect
              barbers={mockBarbers}
              selectedBarber={booking.barber}
              onSelect={handleBarberSelect}
            />
          )}

          {currentStep === 3 && (
            <DateSelect
              selectedDate={booking.date}
              onSelect={handleDateSelect}
            />
          )}

          {currentStep === 4 && (
            <TimeSelect
              timeSlots={timeSlots}
              selectedTime={booking.time}
              onSelect={handleTimeSelect}
            />
          )}

          {currentStep === 5 && (
            <BookingSummary
              service={booking.service}
              barber={booking.barber}
              date={booking.date}
              time={booking.time}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex gap-4 pt-6 border-t border-barber-brown">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-barber-brown text-barber-beige hover:bg-barber-brown transition"
              >
                {currentStep === 1 ? "Voltar" : "Anterior"}
              </button>
              <button
                onClick={() => {
                  if (currentStep === 1 && booking.service)
                    handleServiceSelect(booking.service);
                  else if (currentStep === 2 && booking.barber)
                    handleBarberSelect(booking.barber);
                  else if (currentStep === 3 && booking.date)
                    handleDateSelect(booking.date);
                  else if (currentStep === 4 && booking.time)
                    handleTimeSelect(booking.time);
                }}
                disabled={
                  (currentStep === 1 && !booking.service) ||
                  (currentStep === 2 && !booking.barber) ||
                  (currentStep === 3 && !booking.date) ||
                  (currentStep === 4 && !booking.time)
                }
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition ${
                  (currentStep === 1 && !booking.service) ||
                  (currentStep === 2 && !booking.barber) ||
                  (currentStep === 3 && !booking.date) ||
                  (currentStep === 4 && !booking.time)
                    ? "bg-barber-brown text-barber-beige opacity-50 cursor-not-allowed"
                    : "bg-barber-accent text-barber-black hover:bg-barber-brown"
                }`}
              >
                Próximo
              </button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-barber-brown/20 border border-barber-brown rounded-lg p-6 text-center">
          <p className="text-barber-accent text-sm">
            ℹ️ Todos os horários são confirmados em tempo real. Você receberá uma confirmação por email.
          </p>
        </div>
      </div>
    </div>
  );
}
