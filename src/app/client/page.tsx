"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ClientDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black via-barber-brown-light to-barber-beige-light">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-barber-accent/20 bg-gradient-to-r from-barber-dark to-barber-black/60 shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-48 h-48 bg-barber-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-barber-brown rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex items-center justify-between p-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="text-5xl drop-shadow-lg">✂️</div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-barber-accent to-barber-brown-light bg-clip-text text-transparent tracking-tight">BarberPro</h1>
              <p className="text-sm text-barber-beige/70">Seu estilo, nossa paixão</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-barber-accent to-barber-brown text-barber-black font-bold px-7 py-3 rounded-xl shadow-md hover:scale-105 hover:bg-barber-brown-light transition-all duration-200"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-barber-brown/40 to-barber-accent/20 border border-barber-accent/10 shadow-xl p-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-barber-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative">
                <div className="flex items-center gap-6 mb-4">
                  <span className="text-6xl animate-bounce">👋</span>
                  <div>
                    <h2 className="text-5xl font-black text-barber-beige tracking-tight">
                      Olá, {user?.name?.split(" ")[0]}!
                    </h2>
                    <p className="text-barber-accent/90 font-semibold text-lg mt-1">Bem-vindo de volta ao seu espaço</p>
                  </div>
                </div>
                <p className="text-barber-beige/80 text-base mt-4">Gerencie seus agendamentos e mantenha seu estilo sempre em dia</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-barber-beige mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-barber-accent to-barber-brown rounded-full"></span>
              Ações Rápidas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Novo Agendamento */}
              <Link href="/client/booking" className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-barber-dark to-barber-black border border-barber-accent/30 p-8 hover:border-barber-accent transition-all duration-300 hover:shadow-2xl hover:shadow-barber-accent/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-barber-accent/10 rounded-full blur-3xl group-hover:blur-2xl transition-all -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3">📅</div>
                  <h4 className="text-2xl font-bold text-barber-beige mb-2">Novo Agendamento</h4>
                  <p className="text-barber-accent/80 mb-6 text-sm leading-relaxed">Reserve seu horário com os melhores barbeiros da região</p>
                  <button className="bg-gradient-to-r from-barber-accent to-barber-brown-light text-barber-black font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-barber-accent/50 transition-all transform group-hover:scale-105 inline-flex items-center gap-2">
                    Agendar Agora
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </Link>

              {/* Meus Agendamentos */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-barber-dark to-barber-black border border-barber-brown-light/30 p-8 hover:border-barber-brown-light transition-all duration-300 hover:shadow-2xl hover:shadow-barber-brown/20 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-barber-brown-light/10 rounded-full blur-3xl group-hover:blur-2xl transition-all -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-3">📋</div>
                  <h4 className="text-2xl font-bold text-barber-beige mb-2">Meus Agendamentos</h4>
                  <p className="text-barber-accent/80 mb-6 text-sm leading-relaxed">Confira seus compromissos confirmados e próximos</p>
                  <button className="bg-gradient-to-r from-barber-brown to-barber-brown-light text-barber-black font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-barber-brown/50 transition-all transform group-hover:scale-105 inline-flex items-center gap-2">
                    Ver Agendamentos
                    <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-barber-beige mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-barber-accent to-barber-brown rounded-full"></span>
              Mais Opções
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Histórico */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-barber-dark/50 to-barber-black/50 border border-barber-beige/10 p-6 hover:border-barber-beige/30 transition-all duration-300 hover:shadow-xl hover:shadow-barber-beige/10 cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-barber-beige/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <span className="text-4xl">⏱️</span>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-barber-beige mb-1">Histórico</h4>
                    <p className="text-barber-accent/70 text-sm mb-4">Seus atendimentos anteriores</p>
                    <button className="text-barber-accent hover:text-barber-accent/80 text-sm font-semibold transition">Ver histórico →</button>
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-barber-dark/50 to-barber-black/50 border border-barber-beige/10 p-6 hover:border-barber-beige/30 transition-all duration-300 hover:shadow-xl hover:shadow-barber-beige/10 cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-barber-beige/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <span className="text-4xl">⚙️</span>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-barber-beige mb-1">Configurações</h4>
                    <p className="text-barber-accent/70 text-sm mb-4">Atualize seus dados</p>
                    <button className="text-barber-accent hover:text-barber-accent/80 text-sm font-semibold transition">Configurar →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-barber-accent/10 to-barber-brown/10 border border-barber-accent/20 p-6">
            <div className="absolute top-0 left-0 w-32 h-32 bg-barber-accent/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
            <div className="relative z-10">
              <h3 className="text-barber-beige font-bold mb-4 flex items-center gap-2 text-lg">
                <span className="text-2xl">💡</span>
                Dicas Importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <span className="text-barber-accent text-xl">✓</span>
                  <p className="text-barber-beige/80 text-sm"><span className="font-semibold">Cancele até 24h antes</span> do seu agendamento sem penalidade</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-barber-accent text-xl">✓</span>
                  <p className="text-barber-beige/80 text-sm"><span className="font-semibold">Confirmação por email</span> será enviada após cada agendamento</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-barber-accent text-xl">✓</span>
                  <p className="text-barber-beige/80 text-sm"><span className="font-semibold">Dados 100% protegidos</span> com segurança de ponta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
