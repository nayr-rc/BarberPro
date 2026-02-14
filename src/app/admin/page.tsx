"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-barber-brown bg-barber-dark">
        <h1 className="text-2xl font-bold text-barber-accent">BarberPro - Painel do Barbeiro</h1>
        <button
          onClick={handleLogout}
          className="bg-barber-brown hover:bg-barber-brown-light px-4 py-2 rounded text-barber-beige transition"
        >
          Sair
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-barber-dark border border-barber-brown rounded-lg p-8 mb-6">
            <h2 className="text-3xl font-bold text-barber-beige mb-4">
              Bem-vindo, {user?.name}! 👋
            </h2>
            <p className="text-barber-accent">
              Gerencie sua barbearia com facilidade
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6">
              <div className="text-barber-accent text-sm font-semibold mb-2">AGENDAMENTOS HOJE</div>
              <div className="text-4xl font-bold text-barber-beige">0</div>
            </div>
            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6">
              <div className="text-barber-accent text-sm font-semibold mb-2">CLIENTES CADASTRADOS</div>
              <div className="text-4xl font-bold text-barber-beige">0</div>
            </div>
            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6">
              <div className="text-barber-accent text-sm font-semibold mb-2">SERVIÇOS</div>
              <div className="text-4xl font-bold text-barber-beige">0</div>
            </div>
            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6">
              <div className="text-barber-accent text-sm font-semibold mb-2">RECEITA (MÊS)</div>
              <div className="text-4xl font-bold text-barber-beige">R$ 0</div>
            </div>
          </div>

          {/* Management Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 hover:border-barber-accent transition">
              <h3 className="text-xl font-bold text-barber-beige mb-2">📅 Agenda</h3>
              <p className="text-barber-accent mb-4">Visualize e gerencie os agendamentos</p>
              <button className="bg-barber-accent text-barber-black font-bold px-4 py-2 rounded hover:bg-barber-brown transition w-full">
                Ir para Agenda
              </button>
            </div>

            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 hover:border-barber-accent transition">
              <h3 className="text-xl font-bold text-barber-beige mb-2">👥 Clientes</h3>
              <p className="text-barber-accent mb-4">Veja informações dos clientes</p>
              <button className="bg-barber-accent text-barber-black font-bold px-4 py-2 rounded hover:bg-barber-brown transition w-full">
                Gerenciar Clientes
              </button>
            </div>

            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 hover:border-barber-accent transition">
              <h3 className="text-xl font-bold text-barber-beige mb-2">✂️ Serviços</h3>
              <p className="text-barber-accent mb-4">Configure seus serviços e preços</p>
              <button className="bg-barber-accent text-barber-black font-bold px-4 py-2 rounded hover:bg-barber-brown transition w-full">
                Gerenciar Serviços
              </button>
            </div>

            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 hover:border-barber-accent transition">
              <h3 className="text-xl font-bold text-barber-beige mb-2">📊 Relatórios</h3>
              <p className="text-barber-accent mb-4">Visualize métricas e análises</p>
              <button className="bg-barber-accent text-barber-black font-bold px-4 py-2 rounded hover:bg-barber-brown transition w-full">
                Ver Relatórios
              </button>
            </div>

            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 hover:border-barber-accent transition">
              <h3 className="text-xl font-bold text-barber-beige mb-2">👔 Barbeiros</h3>
              <p className="text-barber-accent mb-4">Gerencie seus barbeiros</p>
              <button className="bg-barber-accent text-barber-black font-bold px-4 py-2 rounded hover:bg-barber-brown transition w-full">
                Gerenciar Barbeiros
              </button>
            </div>

            <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 hover:border-barber-accent transition">
              <h3 className="text-xl font-bold text-barber-beige mb-2">⚙️ Configurações</h3>
              <p className="text-barber-accent mb-4">Configure sua barbearia</p>
              <button className="bg-barber-accent text-barber-black font-bold px-4 py-2 rounded hover:bg-barber-brown transition w-full">
                Configurações
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
