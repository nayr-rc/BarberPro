"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { ChevronLeft, Search, Users, Clock3, Scissors, Phone, Mail, RefreshCw, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Appointment = {
  id: string;
  userId: string;
  appointmentDateTime: string;
  status: "Upcoming" | "Past" | "Cancelled";
  preferredHairdresser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  serviceType?: {
    id: string;
    title: string;
    price?: number;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
  };
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
};

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalAppointments: number;
  totalSpent: number;
  lastAppointment?: string;
  favoriteBarber: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function AdminClientesPage() {
  const { hasHydrated, user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/admin");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appointmentsRes, customersRes] = await Promise.all([
          apiClient.get("/appointments", {
            params: {
              limit: 1000,
              populate: "user,preferredHairdresser,serviceType",
              sortBy: "appointmentDateTime:desc",
            },
          }),
          apiClient.get("/users", {
            params: {
              role: "customer",
              limit: 1000,
              sortBy: "createdAt:desc",
            },
          }),
        ]);

        setAppointments(appointmentsRes.data.results || []);
        setCustomers(customersRes.data.results || []);
      } catch {
        setAppointments([]);
        setCustomers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [isAuthenticated, user, router]);

  const rows = useMemo(() => {
    const customerMap = new Map<string, CustomerRow>();

    customers.forEach((customer) => {
      customerMap.set(customer.id, {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.contactNumber || "-",
        totalAppointments: 0,
        totalSpent: 0,
        favoriteBarber: "-",
      });
    });

    const barberFrequencyByCustomer = new Map<string, Record<string, number>>();

    appointments.forEach((appointment) => {
      const userId = appointment.userId || appointment.user?.id;
      if (!userId) {
        return;
      }

      const customerName = appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : "Cliente";
      const existing = customerMap.get(userId) || {
        id: userId,
        name: customerName,
        email: appointment.user?.email || "",
        phone: appointment.user?.contactNumber || "-",
        totalAppointments: 0,
        totalSpent: 0,
        favoriteBarber: "-",
      };

      existing.totalAppointments += 1;
      if (appointment.status !== "Cancelled") {
        existing.totalSpent += Number(appointment.serviceType?.price || 0);
      }

      if (!existing.lastAppointment || new Date(appointment.appointmentDateTime) > new Date(existing.lastAppointment)) {
        existing.lastAppointment = appointment.appointmentDateTime;
      }

      customerMap.set(userId, existing);

      if (appointment.preferredHairdresser) {
        const barberName = `${appointment.preferredHairdresser.firstName} ${appointment.preferredHairdresser.lastName}`;
        const currentFreq = barberFrequencyByCustomer.get(userId) || {};
        currentFreq[barberName] = (currentFreq[barberName] || 0) + 1;
        barberFrequencyByCustomer.set(userId, currentFreq);
      }
    });

    customerMap.forEach((customer, customerId) => {
      const barberFreq = barberFrequencyByCustomer.get(customerId);
      if (!barberFreq) {
        return;
      }

      const [favorite] = Object.entries(barberFreq).sort((a, b) => b[1] - a[1]);
      customer.favoriteBarber = favorite ? favorite[0] : "-";
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalAppointments - a.totalAppointments);
  }, [customers, appointments]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => {
      return (
        row.name.toLowerCase().includes(normalizedQuery) ||
        row.email.toLowerCase().includes(normalizedQuery) ||
        row.phone.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [rows, query]);

  const stats = useMemo(() => {
    const activeLast60Days = rows.filter((row) => row.lastAppointment && new Date(row.lastAppointment) >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)).length;
    const totalRevenue = rows.reduce((sum, row) => sum + row.totalSpent, 0);

    return {
      totalCustomers: rows.length,
      activeLast60Days,
      totalRevenue,
    };
  }, [rows]);

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
              <Users className="w-5 h-5 text-barber-gold" />
              Clientes
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Relacionamento e histórico consolidado</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all text-gray-300"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard label="Total de clientes" value={String(stats.totalCustomers)} icon={<Users className="w-4 h-4" />} />
          <SummaryCard label="Ativos (60 dias)" value={String(stats.activeLast60Days)} icon={<Clock3 className="w-4 h-4" />} />
          <SummaryCard label="Receita consolidada" value={formatCurrency(stats.totalRevenue)} icon={<Scissors className="w-4 h-4" />} />
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-barber-gold/50"
            placeholder="Buscar por nome, e-mail ou telefone"
          />
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-barber-gold" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="py-20 text-center text-gray-500">Nenhum cliente encontrado para os filtros informados.</div>
        ) : (
          <div className="space-y-3">
            {filteredRows.map((row) => (
              <div key={row.id} className="bg-[#111] border border-white/10 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate text-lg uppercase tracking-tight">{row.name}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400 uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /> {row.email || "Sem e-mail"}</span>
                      <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {row.phone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs uppercase tracking-wider">
                    <MetricChip label="Agendamentos" value={String(row.totalAppointments)} />
                    <MetricChip label="Faturamento" value={formatCurrency(row.totalSpent)} />
                    <MetricChip label="Barbeiro favorito" value={row.favoriteBarber} />
                    <MetricChip
                      label="Última visita"
                      value={
                        row.lastAppointment
                          ? `${formatDistanceToNow(new Date(row.lastAppointment), { addSuffix: true, locale: ptBR })}`
                          : "Sem histórico"
                      }
                    />
                  </div>
                </div>

                {row.lastAppointment && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-4 border-t border-white/5 pt-3">
                    Último agendamento em {format(new Date(row.lastAppointment), "dd/MM/yyyy HH:mm")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold inline-flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-2xl font-black mt-2">{value}</p>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 min-w-[120px]">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-200 normal-case leading-tight">{value}</p>
    </div>
  );
}
