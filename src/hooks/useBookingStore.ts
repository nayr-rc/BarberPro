
import { create } from 'zustand';

interface BookingState {
    selectedService: string;
    setSelectedService: (service: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    selectedService: '',
    setSelectedService: (service) => set({ selectedService: service }),
}));
