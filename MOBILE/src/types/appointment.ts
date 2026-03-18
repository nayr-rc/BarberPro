export type AppointmentStatus = 'Upcoming' | 'Past' | 'Cancelled';

export type Appointment = {
  id: string;
  clientName: string;
  serviceName: string;
  appointmentDateTime: string;
  price: number;
  status: AppointmentStatus;
};
