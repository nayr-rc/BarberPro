export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Barber {
  id: string;
  name: string;
  active: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingStep {
  service: Service | null;
  barber: Barber | null;
  date: Date | null;
  time: string | null;
}
