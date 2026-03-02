"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Calendar,
  Users,
  Scissors,
  Coffee,
  UserSquare2,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  ScissorsLineDashed,
  LayoutDashboard
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (user?.role === "barber") {
      router.push("/barbeiro/dashboard");
    } else if (user?.role !== "admin") {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    router.push("/");
    setTimeout(() => {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem("token");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-gray-200 font-sans selection:bg-barber-gold selection:text-black">

      {/* Sidebar / Topbar */}
      <header className="fixed top-0 w-full z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-barber-gold font-bold tracking-[0.2em] text-xl">
            <LayoutDashboard className="w-6 h-6" />
            <span>PAINEL <span className="text-white">PRO</span></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-white">{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Administrador'}</span>
              <span className="text-xs text-barber-gold tracking-widest uppercase">{user?.role === 'admin' ? 'Master Barber' : 'Barbeiro Parceiro'}</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-barber-gold to-barber-brown border-2 border-barber-gold/50 flex items-center justify-center shadow-lg">
              <span className="text-black font-bold font-heading">{user?.firstName?.charAt(0) || 'B'}</span>
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

      {/* Main Content */}
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto space-y-8">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1e1e] to-[#121212] border border-white/5 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-barber-gold pointer-events-none">
            <ScissorsLineDashed size={200} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-2">
              Bom dia, <span className="font-bold text-barber-gold">{user?.firstName || 'Chefe'}</span>!
            </h2>
            <p className="text-gray-400 font-light max-w-xl">
              Aqui está o resumo de hoje. Mantenha sua agenda organizada e fature como um mestre.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col gap-4 shadow-lg hover:border-barber-gold/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-barber-gold/10 rounded-lg text-barber-gold group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3" /> +12%</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">14</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase font-bold">Agendamentos Hoje</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col gap-4 shadow-lg hover:border-barber-gold/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">842</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase font-bold">Clientes Ativos</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col gap-4 shadow-lg hover:border-barber-gold/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3" /> +5%</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase font-bold">Taxa de Conclusão</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 flex flex-col gap-4 shadow-lg hover:border-barber-gold/30 transition-all group">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-500/10 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">R$ 4.2k</div>
              <div className="text-xs text-gray-400 tracking-widest uppercase font-bold">Receita (Semana)</div>
            </div>
          </div>
        </div>

        {/* Management Options */}
        <h3 className="text-xl font-bold text-white pt-6 border-b border-white/5 pb-4 tracking-widest uppercase">Aplicativos e Gerenciamento</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          <button className="flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-white/5 rounded-2xl p-6 shadow-xl hover:-translate-y-1 hover:border-barber-gold/50 hover:shadow-barber-gold/10 transition-all duration-300 group">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform group-hover:bg-barber-gold/10">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">Agenda</h4>
            <p className="text-sm text-gray-400 font-light flex-1">Visualize os horários, aprove ou cancele agendamentos pendentes.</p>
          </button>

          <button className="flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-white/5 rounded-2xl p-6 shadow-xl hover:-translate-y-1 hover:border-barber-gold/50 hover:shadow-barber-gold/10 transition-all duration-300 group">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform group-hover:bg-barber-gold/10">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">Clientes</h4>
            <p className="text-sm text-gray-400 font-light flex-1">Acesse a base de dados de clientes, histórico de cortes e faltas.</p>
          </button>

          <button className="flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-white/5 rounded-2xl p-6 shadow-xl hover:-translate-y-1 hover:border-barber-gold/50 hover:shadow-barber-gold/10 transition-all duration-300 group">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform group-hover:bg-barber-gold/10">
              <Scissors className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">Serviços</h4>
            <p className="text-sm text-gray-400 font-light flex-1">Edite preços, adicione novos serviços, combos e tempo de duração.</p>
          </button>

          <button onClick={() => router.push("/admin/drinks")} className="flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-white/5 rounded-2xl p-6 shadow-xl hover:-translate-y-1 hover:border-barber-gold/50 hover:shadow-barber-gold/10 transition-all duration-300 group">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform group-hover:bg-barber-gold/10">
              <Coffee className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">Bebidas & Estoque</h4>
            <p className="text-sm text-gray-400 font-light flex-1">Gerencie produtos de frigobar, drinks e adicione novos itens.</p>
            <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center text-xs text-barber-gold uppercase tracking-widest font-bold">Acessar <TrendingUp className="w-3 h-3 ml-2" /></div>
          </button>

          <button onClick={() => router.push("/admin/assinaturas")} className="flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-white/5 rounded-2xl p-6 shadow-xl hover:-translate-y-1 hover:border-barber-gold/50 hover:shadow-barber-gold/10 transition-all duration-300 group">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform group-hover:bg-barber-gold/10">
              <UserSquare2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">Barbeiros / Equipe</h4>
            <p className="text-sm text-gray-400 font-light flex-1">Adicione ou remova permissões de barbeiros na plataforma e faturamento.</p>
          </button>

          <button className="flex flex-col text-left bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-white/5 rounded-2xl p-6 shadow-xl hover:-translate-y-1 hover:border-barber-gold/50 hover:shadow-barber-gold/10 transition-all duration-300 group">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-gray-500 mb-6 group-hover:scale-110 transition-transform group-hover:text-white">
              <Settings className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 tracking-wide">Configurações</h4>
            <p className="text-sm text-gray-400 font-light flex-1">Modifique o horário de funcionamento e informações do estabelecimento.</p>
          </button>

        </div>
      </main>
    </div>
  );
}
