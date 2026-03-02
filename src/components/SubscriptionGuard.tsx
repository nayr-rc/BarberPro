"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { AlertTriangle, RefreshCw, LogOut, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionGuardProps {
    children: React.ReactNode;
}

/**
 * Envolve páginas do barbeiro.
 * - Se não autenticado → redireciona para /auth/login
 * - Se assinatura pendente ou expirada → exibe tela de bloqueio
 * - Se ativo → renderiza children
 */
export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const router = useRouter();
    const { user, isAuthenticated, logout, isSubscriptionActive } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) return null;

    // Admin sempre passa
    const isAdmin = user.role === "admin" ||
        user.email?.toLowerCase()?.includes("narsie454");

    if (isAdmin) return <>{children}</>;

    // Assinatura ativa → tudo certo
    if (isSubscriptionActive()) return <>{children}</>;

    // Status da assinatura para exibir mensagem correta
    const isPending = user.subscriptionStatus === "pending" || !user.subscriptionStatus;
    const isExpired = user.subscriptionStatus === "expired" ||
        (user.subscriptionStatus === "active" && user.subscriptionExpiresAt &&
            new Date(user.subscriptionExpiresAt) <= new Date());

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-16">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl ${isPending ? "bg-amber-500/5" : "bg-red-500/5"}`} />
            </div>

            <div className="relative w-full max-w-md text-center space-y-8">

                {/* Ícone */}
                <div className={`mx-auto w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl ${isPending
                    ? "bg-amber-500/10 border border-amber-500/20 shadow-amber-500/10"
                    : "bg-red-500/10 border border-red-500/20 shadow-red-500/10"
                    }`}>
                    {isPending
                        ? <Clock className="w-12 h-12 text-amber-400" />
                        : <AlertTriangle className="w-12 h-12 text-red-400" />
                    }
                </div>

                {/* Título */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black uppercase tracking-tight">
                        {isPending ? "Pagamento Pendente" : "Assinatura Expirada"}
                    </h1>
                    <p className="text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
                        {isPending
                            ? "Sua conta está aguardando a confirmação do pagamento pelo administrador. Assim que confirmado, seu acesso será liberado."
                            : "Sua assinatura de 30 dias venceu. Renove via PIX para continuar acessando a plataforma."
                        }
                    </p>
                </div>

                {/* Info de conta */}
                <div className="bg-[#141414] border border-white/8 rounded-2xl p-6 text-left space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Conta</span>
                        <span className="text-white font-bold">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Status</span>
                        <span className={`font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full ${isPending
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                            }`}>
                            {isPending ? "Pendente" : "Expirada"}
                        </span>
                    </div>
                    {isExpired && user.subscriptionExpiresAt && (
                        <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Venceu em</span>
                            <span className="text-red-400 font-bold text-xs">
                                {format(new Date(user.subscriptionExpiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Ações */}
                <div className="space-y-3">
                    {isExpired && (
                        <a
                            href="/pagamento"
                            className="flex items-center justify-center gap-3 w-full py-5 bg-barber-gold text-barber-black font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-2xl shadow-amber-500/20 active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Renovar Agora — R$ 25/mês
                        </a>
                    )}

                    {isPending && (
                        <div className="flex items-center justify-center gap-3 w-full py-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-sm uppercase tracking-widest rounded-2xl">
                            <Clock className="w-4 h-4 animate-pulse" />
                            Aguardando confirmação...
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/8 text-gray-400 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair da conta
                    </button>
                </div>

                <p className="text-xs text-gray-600 font-light">
                    Dúvidas? Entre em contato pelo WhatsApp com o administrador.
                </p>
            </div>
        </div>
    );
}
