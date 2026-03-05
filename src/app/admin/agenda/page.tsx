"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { AlertTriangle, Calendar, ChevronLeft, Clock3, Loader2, RefreshCw, Search } from "lucide-react";
import { addMinutes, format, isSameDay, parseISO } from "date-fns";

type Appointment = {
  id: string;
  status: "Upcoming" | "Past" | "Cancelled";
  appointmentDateTime: string;
  additionalNotes?: string | null;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  preferredHairdresserId?: string;
  serviceTypeId?: string;
  serviceTypeName?: string;
  servicePrice?: number;
  serviceDurationMinutes?: number;
  user?: {
    firstName: string;
    lastName: string;
    contactNumber?: string;
  };
  preferredHairdresser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  serviceType?: {
    title: string;
    price?: number;
    durationMinutes?: number;
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const getCustomerName = (appointment: Appointment) => {
  const firstName = appointment.user?.firstName || appointment.firstName || "";
  const lastName = appointment.user?.lastName || appointment.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Cliente";
};

const getBarberName = (appointment: Appointment) => {
  const firstName = appointment.preferredHairdresser?.firstName || "";
  const lastName = appointment.preferredHairdresser?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Barbeiro";
};

const getServiceTitle = (appointment: Appointment) => {
  return appointment.serviceType?.title || appointment.serviceTypeName || "Serviço";
};

const getServicePrice = (appointment: Appointment) => {
  return Number(appointment.serviceType?.price ?? appointment.servicePrice ?? 0);
};

const getServiceDurationMinutes = (appointment: Appointment) => {
  return Number(appointment.serviceType?.durationMinutes ?? appointment.serviceDurationMinutes ?? 30);
};

export default function AdminAgendaPage() {
  const { hasHydrated, user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Upcoming" | "Past" | "Cancelled">("all");
  const [barberFilter, setBarberFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchAppointments = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);

    try {
      const response = await apiClient.get("/appointments", {
        params: {
          limit: 1000,
          populate: "user,preferredHairdresser,serviceType",
          sortBy: "appointmentDateTime:asc",
        },
      });

      const payload = response.data;
      const results = Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [];
      setAppointments(results as Appointment[]);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/admin");
      return;
    }

    void fetchAppointments();
  }, [isAuthenticated, user, router, fetchAppointments]);

  const barberOptions = useMemo(() => {
    const map = new Map<string, string>();
    appointments.forEach((appointment) => {
      const barberId = appointment.preferredHairdresser?.id || appointment.preferredHairdresserId;
      if (barberId) {
        map.set(barberId, getBarberName(appointment));
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const dateObj = selectedDate ? parseISO(`${selectedDate}T00:00:00`) : null;
    const normalizedQuery = query.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDateTime);
      const barberId = appointment.preferredHairdresser?.id || appointment.preferredHairdresserId || "";
      const customerName = getCustomerName(appointment).toLowerCase();
      const barberName = getBarberName(appointment).toLowerCase();
      const serviceName = getServiceTitle(appointment).toLowerCase();

      const matchesDate =
        !dateObj ||
        (Number.isNaN(dateObj.getTime()) ? true : !Number.isNaN(appointmentDate.getTime()) && isSameDay(appointmentDate, dateObj));
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const matchesBarber = barberFilter === "all" || barberId === barberFilter;
      const matchesQuery =
        !normalizedQuery ||
        customerName.includes(normalizedQuery) ||
        barberName.includes(normalizedQuery) ||
        serviceName.includes(normalizedQuery);

      return matchesDate && matchesStatus && matchesBarber && matchesQuery;
    });
  }, [appointments, selectedDate, statusFilter, barberFilter, query]);

  const conflictingIds = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    filteredAppointments.forEach((appointment) => {
      const barberId = appointment.preferredHairdresser?.id;
      if (!barberId) {
        return;
      }

      const list = grouped.get(barberId) || [];
      list.push(appointment);
      grouped.set(barberId, list);
    });

    const conflictSet = new Set<string>();
    grouped.forEach((list) => {
      const sorted = [...list].sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());
      for (let i = 0; i < sorted.length; i += 1) {
        const current = sorted[i];
        const currentStart = new Date(current.appointmentDateTime);
        const currentEnd = addMinutes(currentStart, getServiceDurationMinutes(current));

        for (let j = i + 1; j < sorted.length; j += 1) {
          const next = sorted[j];
          const nextStart = new Date(next.appointmentDateTime);
          const nextEnd = addMinutes(nextStart, getServiceDurationMinutes(next));

          if (nextStart >= currentEnd) {
            break;
          }

          if (currentStart < nextEnd && currentEnd > nextStart) {
            conflictSet.add(current.id);
            conflictSet.add(next.id);
          }
        }
      }
    });

    return conflictSet;
  }, [filteredAppointments]);

  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const upcoming = filteredAppointments.filter((appointment) => appointment.status === "Upcoming").length;
    const completed = filteredAppointments.filter((appointment) => appointment.status === "Past").length;
    const cancelled = filteredAppointments.filter((appointment) => appointment.status === "Cancelled").length;
    const projectedRevenue = filteredAppointments
      .filter((appointment) => appointment.status !== "Cancelled")
      .reduce((sum, appointment) => sum + getServicePrice(appointment), 0);

    return { total, upcoming, completed, cancelled, projectedRevenue };
  }, [filteredAppointments]);

  const updateStatus = async (appointmentId: string, nextStatus: "Upcoming" | "Past" | "Cancelled") => {
    setUpdatingId(appointmentId);
    try {
      await apiClient.patch(`/appointments/${appointmentId}`, {
        status: nextStatus,
      });
      await fetchAppointments();
    } finally {
      setUpdatingId(null);
    }
  };

  if (hasHydrated && (!isAuthenticated || user?.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-14">
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-barber-gold" />
              Agenda
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Operações e monitoramento da agenda dos barbeiros</p>
          </div>
        </div>
        <button
          onClick={() => void fetchAppointments()}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all text-gray-300"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard label="Total" value={String(stats.total)} />
          <KpiCard label="Pendentes" value={String(stats.upcoming)} />
          <KpiCard label="Concluídos" value={String(stats.completed)} />
          <KpiCard label="Cancelados" value={String(stats.cancelled)} />
          <KpiCard label="Receita projetada" value={formatCurrency(stats.projectedRevenue)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-barber-gold/50"
              placeholder="Buscar cliente, barbeiro ou serviço"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-barber-gold/50"
            />
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="px-3 rounded-xl border border-white/10 bg-white/5 text-xs uppercase tracking-widest text-gray-300 hover:bg-white/10"
            >
              Todas
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | "Upcoming" | "Past" | "Cancelled")}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-barber-gold/50"
          >
            <option value="all">Todos os status</option>
            <option value="Upcoming">Pendentes</option>
            <option value="Past">Concluídos</option>
            <option value="Cancelled">Cancelados</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setBarberFilter("all")}
            className={`text-xs uppercase tracking-widest px-3 py-2 rounded-lg border ${
              barberFilter === "all" ? "border-barber-gold/50 bg-barber-gold/10 text-barber-gold" : "border-white/10 text-gray-400"
            }`}
          >
            Todos os barbeiros
          </button>
          {barberOptions.map((barber) => (
            <button
              key={barber.id}
              onClick={() => setBarberFilter(barber.id)}
              className={`text-xs uppercase tracking-widest px-3 py-2 rounded-lg border ${
                barberFilter === barber.id ? "border-barber-gold/50 bg-barber-gold/10 text-barber-gold" : "border-white/10 text-gray-400"
              }`}
            >
              {barber.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-barber-gold" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-20 text-center text-gray-500">Nenhum agendamento encontrado para os filtros selecionados.</div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.appointmentDateTime);
              const customerName = getCustomerName(appointment);
              const barberName = getBarberName(appointment);
              const serviceTitle = getServiceTitle(appointment);
              const servicePrice = getServicePrice(appointment);
              const isConflict = conflictingIds.has(appointment.id);
              const statusClass =
                appointment.status === "Past"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : appointment.status === "Cancelled"
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/30";

              return (
                <div key={appointment.id} className="bg-[#111] border border-white/10 rounded-2xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white uppercase tracking-tight text-lg">{customerName}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                        {barberName} • {serviceTitle}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                        <Clock3 className="w-3 h-3" />
                        {Number.isNaN(appointmentDate.getTime()) ? "Data inválida" : format(appointmentDate, "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border font-bold ${statusClass}`}>
                        {appointment.status === "Upcoming" ? "Pendente" : appointment.status === "Past" ? "Concluído" : "Cancelado"}
                      </span>
                      {isConflict && (
                        <span className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border font-bold border-rose-500/40 bg-rose-500/10 text-rose-300 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Conflito
                        </span>
                      )}
                      <span className="text-xs text-barber-gold font-semibold">{formatCurrency(servicePrice)}</span>
                    </div>

                    <div className="flex gap-2">
                      <ActionButton
                        label="Concluir"
                        disabled={updatingId === appointment.id || appointment.status === "Past"}
                        onClick={() => void updateStatus(appointment.id, "Past")}
                      />
                      <ActionButton
                        label="Reabrir"
                        disabled={updatingId === appointment.id || appointment.status === "Upcoming"}
                        onClick={() => void updateStatus(appointment.id, "Upcoming")}
                      />
                      <ActionButton
                        label="Cancelar"
                        danger
                        disabled={updatingId === appointment.id || appointment.status === "Cancelled"}
                        onClick={() => void updateStatus(appointment.id, "Cancelled")}
                      />
                    </div>
                  </div>

                  {appointment.additionalNotes && (
                    <p className="text-xs text-gray-400 border-t border-white/5 pt-3 mt-3">Observação: {appointment.additionalNotes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</p>
      <p className="text-xl font-black mt-2">{value}</p>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, danger = false }: { label: string; onClick: () => void; disabled: boolean; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg border transition-all disabled:opacity-40 ${
        danger
          ? "border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
          : "border-white/20 text-gray-200 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
