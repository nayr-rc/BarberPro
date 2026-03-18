import { create } from 'zustand';
import { api } from '../lib/api';
import { Appointment } from '../types/appointment';

type AgendaState = {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  loadAppointments: (barberId: string) => Promise<void>;
  markAsAttended: (appointmentId: string) => Promise<void>;
  cleanupExpired: () => void;
};

const isVisibleAppointment = (appointment: Appointment) => {
  if (appointment.status !== 'Upcoming') return false;
  const when = new Date(appointment.appointmentDateTime).getTime();
  if (Number.isNaN(when)) return true;
  return when > Date.now();
};

const mapAppointment = (raw: Record<string, unknown>): Appointment => {
  const serviceType = raw.serviceType as Record<string, unknown> | undefined;
  const firstName = String(raw.firstName || '');
  const lastName = String(raw.lastName || '');
  const clientName = `${firstName} ${lastName}`.trim() || 'Cliente';

  return {
    id: String(raw.id),
    clientName,
    serviceName: String(serviceType?.title || raw.serviceTypeName || 'Serviço'),
    appointmentDateTime: String(raw.appointmentDateTime || new Date().toISOString()),
    price: Number(serviceType?.price || raw.servicePrice || 0),
    status: String(raw.status || 'Upcoming') as Appointment['status'],
  };
};

export const useAgendaStore = create<AgendaState>((set, get) => ({
  appointments: [],
  isLoading: false,
  error: null,

  loadAppointments: async (barberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/appointments', {
        params: {
          preferredHairdresserId: barberId,
          status: 'Upcoming',
          limit: '300',
          sortBy: 'appointmentDateTime:asc',
          populate: 'serviceType',
        },
      });

      const results = (response.data?.results || []) as Record<string, unknown>[];
      const mapped = results.map(mapAppointment).filter(isVisibleAppointment);
      set({ appointments: mapped, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar agenda.';
      set({ isLoading: false, error: message });
    }
  },

  markAsAttended: async (appointmentId) => {
    const previous = get().appointments;
    set({ appointments: previous.filter((item) => item.id !== appointmentId) });

    try {
      await api.patch(`/appointments/${appointmentId}`, { status: 'Past' });
    } catch (err) {
      set({ appointments: previous });
      throw err;
    }
  },

  cleanupExpired: () => {
    set((state) => ({
      appointments: state.appointments.filter(isVisibleAppointment),
    }));
  },
}));
