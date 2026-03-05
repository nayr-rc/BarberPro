"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, Coffee, Settings, LogOut, TrendingUp, CheckCircle, ScissorsLineDashed, LayoutDashboard, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { addDays, format, startOfDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

type DashboardAppointment = {
  id: string;
  appointmentDateTime: string;
  status: "Upcoming" | "Past" | "Cancelled";
  userId: string;
  serviceType?: { price?: number };
};

type DashboardStats = {
  appointmentsToday: number;
  activeClients: number;
  completionRate: number;
  weeklyRevenue: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export default function AdminDashboard() {
  const { hasHydrated, user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    activeClients: 0,
    completionRate: 0,
    weeklyRevenue: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const isAdmin = user?.role === "admin";

    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!isAdmin) {
      router.push("/barbeiro/dashboard");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (hasHydrated && (!isAuthenticated || user?.role !== "admin")) {
        return;
      }

      setIsLoadingStats(true);
      setDashboardError("");

      try {
        const [appointmentsRes, clientsRes] = await Promise.all([
          apiClient.get("/appointments", {
            params: {
              limit: 500,
              page: 1,
              populate: "serviceType",
              sortBy: "appointmentDateTime:desc",
            },
          }),
          apiClient.get("/users", {
            params: {
              role: "customer",
              limit: 500,
              page: 1,
            },
          }),
        ]);

        const appointments = (appointmentsRes.data.results || []) as DashboardAppointment[];
        const clients = clientsRes.data.results || [];

        const now = new Date();
        const todayStart = startOfDay(now);
        const tomorrowStart = addDays(todayStart, 1);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const thirtyDaysAgo = addDays(now, -30);

        const appointmentsToday = appointments.filter((appointment) => {
          const when = new Date(appointment.appointmentDateTime);
          return when >= todayStart && when < tomorrowStart;
        }).length;

        const recentAppointments = appointments.filter((appointment) => new Date(appointment.appointmentDateTime) >= thirtyDaysAgo);
        const activeClients = new Set(recentAppointments.map((appointment) => appointment.userId)).size || clients.length;

        const completedAppointments = recentAppointments.filter((appointment) => appointment.status === "Past").length;
        const trackedAppointments = recentAppointments.filter((appointment) => appointment.status !== "Cancelled").length;
        const completionRate = trackedAppointments > 0 ? Math.round((completedAppointments / trackedAppointments) * 100) : 0;

        const weeklyRevenue = appointments
          .filter((appointment) => {
            const when = new Date(appointment.appointmentDateTime);
            return when >= weekStart && when <= now && appointment.status !== "Cancelled";
          })
          .reduce((sum, appointment) => sum + Number(appointment.serviceType?.price || 0), 0);

        setStats({
          appointmentsToday,
          activeClients,
          completionRate,
          weeklyRevenue,
        });
      } catch {
        setDashboardError("Não foi possível carregar os indicadores do painel.");
      } finally {
        setIsLoadingStats(false);
      }
    };

    void loadDashboardStats();
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const currentDateLabel = useMemo(() => format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR }), []);

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-sans selection:bg-barber-gold selection:text-black">
      <header className="fixed top-0 w-full z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-barber-gold font-bold tracking-[0.2em] text-xl">
            <LayoutDashboard className="w-6 h-6" />
            <span>PAINEL <span className="text-white">PRO</span></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-white">{user?.firstName ? `${user.firstName} ${user.lastName}` : "Administrador"}</span>
              <span className="text-xs text-barber-gold tracking-widest uppercase">Gestão Master</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-barber-gold to-barber-brown border-2 border-barber-gold/50 flex items-center justify-center shadow-lg">
              <span className="text-black font-bold font-heading">{user?.firstName?.charAt(0) || "A"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 hover:text-red-400 transition-colors border-l border-white/10 pl-6 text-sm tracking-widest uppercase"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#121212] border border-white/5 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-barber-gold pointer-events-none">
            <ScissorsLineDashed size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">
              Bom dia, <span className="font-bold text-barber-gold">{user?.firstName || "Chefe"}</span>!
            </h2>
            <p className="text-gray-400 font-light max-w-xl">
              Visão executiva da operação. {currentDateLabel.charAt(0).toUpperCase() + currentDateLabel.slice(1)}.
            </p>
          </div>
        </div>

        {dashboardError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-center gap-2 text-rose-200">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-xs uppercase tracking-wider font-bold">{dashboardError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Calendar className="w-6 h-6" />} color="text-barber-gold" label="Agendamentos Hoje" value={isLoadingStats ? "..." : String(stats.appointmentsToday)} />
          <StatCard icon={<Users className="w-6 h-6" />} color="text-blue-400" label="Clientes Ativos" value={isLoadingStats ? "..." : String(stats.activeClients)} />
          <StatCard icon={<CheckCircle className="w-6 h-6" />} color="text-purple-400" label="Taxa de Conclusão" value={isLoadingStats ? "..." : `${stats.completionRate}%`} />
          <StatCard icon={<TrendingUp className="w-6 h-6" />} color="text-green-400" label="Receita (Semana)" value={isLoadingStats ? "..." : formatCurrency(stats.weeklyRevenue)} />
        </div>

        <h3 className="text-xl font-bold text-white pt-6 border-b border-white/5 pb-4 tracking-widest uppercase">Aplicativos e Gerenciamento</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminCard
            icon={<Calendar className="w-6 h-6" />}
            title="Agenda"
            description="Visão operacional dos agendamentos de todos os barbeiros, com filtros e ações administrativas."
            onClick={() => router.push("/admin/agenda")}
          />
          <AdminCard
            icon={<Users className="w-6 h-6" />}
            title="Clientes"
            description="Base consolidada de clientes com histórico de recorrência e indicadores de relacionamento."
            onClick={() => router.push("/admin/clientes")}
          />
          <AdminCard
            icon={<Coffee className="w-6 h-6" />}
            title="Bebidas & Estoque"
            description="Gerencie o frigobar, ative/desative itens e acompanhe disponibilidade."
            onClick={() => router.push("/admin/drinks")}
          />
          <AdminCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Assinaturas & Acessos"
            description="Aprove solicitações, pause/cancele planos e acompanhe logs de operação."
            onClick={() => router.push("/admin/assinaturas")}
            highlighted
          />
          <AdminCard
            icon={<Settings className="w-6 h-6" />}
            title="Configurações"
            description="Atualize dados administrativos, senha e verifique a saúde das integrações."
            onClick={() => router.push("/admin/configuracoes")}
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: string }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col gap-4 shadow-lg hover:border-barber-gold/30 transition-all group">
      <div className={`p-3 bg-white/5 rounded-lg ${color} group-hover:scale-110 transition-transform w-fit`}>{icon}</div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-gray-400 tracking-widest uppercase font-bold">{label}</div>
      </div>
    </div>
  );
}

function AdminCard({ icon, title, description, onClick, highlighted = false }: { icon: React.ReactNode; title: string; description: string; onClick: () => void; highlighted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
        highlighted ? "border-barber-gold/30 ring-1 ring-barber-gold/10 hover:border-barber-gold/50" : "border-white/5 hover:border-barber-gold/50"
      }`}
    >
      <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${highlighted ? "bg-barber-gold/10 text-barber-gold" : "bg-white/5 text-barber-gold group-hover:bg-barber-gold/10"}`}>
        {icon}
      </div>
      <h4 className="text-lg font-bold text-white mb-2 tracking-wide">{title}</h4>
      <p className="text-sm text-gray-400 font-light flex-1">{description}</p>
      <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center text-xs text-barber-gold uppercase tracking-widest font-bold">
        Acessar <Loader2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:animate-spin" />
      </div>
    </button>
  );
}
