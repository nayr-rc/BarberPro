"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Settings, LogOut, ScissorsLineDashed, LayoutDashboard, ShieldCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { hasHydrated, user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const isAdmin = user?.role === "admin";

    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (!isAdmin) {
      router.push("/barbeiro/dashboard");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

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

        <h3 className="text-xl font-bold text-white pt-6 border-b border-white/5 pb-4 tracking-widest uppercase">Gerenciamento de Profissionais</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          <AdminCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Assinaturas & Acessos"
            description="Aprove ou recuse novos barbeiros na plataforma e gerencie permissões de status e planos."
            onClick={() => router.push("/admin/assinaturas")}
            highlighted
          />
          <AdminCard
            icon={<Settings className="w-6 h-6" />}
            title="Configurações"
            description="Atualize seus dados administrativos, regras do sistema e altere sua senha de acesso."
            onClick={() => router.push("/admin/configuracoes")}
          />
        </div>
      </main>
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
