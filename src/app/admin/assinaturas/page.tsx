"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import {
    CheckCircle, XCircle, Clock, Users, RefreshCw,
    ChevronLeft, ShieldCheck, AlertTriangle, Loader2
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscriber {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
    subscriptionStatus: "pending" | "active" | "expired";
    subscriptionExpiresAt?: string | null;
    subscriptionActivatedAt?: string | null;
    createdAt: string;
}

export default function AdminAssinaturas() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "active" | "expired">("all");
    const [processing, setProcessing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        if (user?.role !== "admin") {
            router.push("/admin");
            return;
        }
        fetchSubscribers();
    }, [isAuthenticated, user, router]);

    const fetchSubscribers = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get("/subscription/all");
            setSubscribers(res.data.results || []);
        } catch {
            setMessage({ text: "Erro ao carregar assinaturas", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (userId: string, name: string) => {
        setProcessing(userId);
        try {
            await apiClient.patch(`/subscription/${userId}/approve`);
            setMessage({ text: `✓ Assinatura de ${name} ativada por 30 dias!`, type: "success" });
            await fetchSubscribers();
        } catch (e: any) {
            setMessage({ text: e.response?.data?.message || "Erro ao aprovar", type: "error" });
        } finally {
            setProcessing(null);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleRevoke = async (userId: string, name: string) => {
        if (!confirm(`Revogar acesso de ${name}?`)) return;
        setProcessing(userId);
        try {
            await apiClient.patch(`/subscription/${userId}/revoke`);
            setMessage({ text: `Acesso de ${name} revogado.`, type: "error" });
            await fetchSubscribers();
        } catch (e: any) {
            setMessage({ text: e.response?.data?.message || "Erro ao revogar", type: "error" });
        } finally {
            setProcessing(null);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const filtered = subscribers.filter(s =>
        filter === "all" ? true : s.subscriptionStatus === filter
    );

    const counts = {
        all: subscribers.length,
        pending: subscribers.filter(s => s.subscriptionStatus === "pending").length,
        active: subscribers.filter(s => s.subscriptionStatus === "active").length,
        expired: subscribers.filter(s => s.subscriptionStatus === "expired").length,
    };

    if (!isAuthenticated || user?.role !== "admin") return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-16">
            {/* Header */}
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
                            <ShieldCheck className="w-5 h-5 text-barber-gold" />
                            Assinaturas
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Gerenciar Barbeiros</p>
                    </div>
                </div>
                <button onClick={fetchSubscribers} className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center hover:bg-white/10 transition-all text-gray-400">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
            </header>

            {/* Toast */}
            {message && (
                <div className={`mx-6 mt-4 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border ${message.type === "success"
                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                    {message.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                    {message.text}
                </div>
            )}

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

                {/* Resumo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(["all", "pending", "active", "expired"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`p-4 rounded-2xl border text-left transition-all ${filter === s
                                ? s === "pending" ? "bg-amber-500/10 border-amber-500/40"
                                    : s === "active" ? "bg-green-500/10 border-green-500/40"
                                        : s === "expired" ? "bg-red-500/10 border-red-500/40"
                                            : "bg-barber-gold/10 border-barber-gold/40"
                                : "bg-white/3 border-white/8 hover:border-white/20"
                                }`}
                        >
                            <p className="text-2xl font-black">{counts[s]}</p>
                            <p className={`text-[10px] uppercase tracking-widest font-black mt-1 ${filter === s
                                ? s === "pending" ? "text-amber-400"
                                    : s === "active" ? "text-green-400"
                                        : s === "expired" ? "text-red-400"
                                            : "text-barber-gold"
                                : "text-gray-500"
                                }`}>
                                {s === "all" ? "Total" : s === "pending" ? "Pendentes" : s === "active" ? "Ativos" : "Expirados"}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Lista */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-barber-gold" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-gray-600">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm uppercase tracking-widest font-bold">Nenhum barbeiro nesta categoria</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((sub) => {
                            const daysLeft = sub.subscriptionExpiresAt
                                ? differenceInDays(new Date(sub.subscriptionExpiresAt), new Date())
                                : null;
                            const isProc = processing === sub.id;

                            return (
                                <div key={sub.id} className="bg-[#111] border border-white/8 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Avatar + Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-barber-gold/20 to-barber-gold/5 border border-barber-gold/20 flex items-center justify-center font-black text-barber-gold text-lg flex-shrink-0">
                                            {sub.firstName?.[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white truncate">{sub.firstName} {sub.lastName}</p>
                                            <p className="text-xs text-gray-500 truncate">{sub.email}</p>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                                Cadastrado {format(new Date(sub.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${sub.subscriptionStatus === "pending"
                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                : sub.subscriptionStatus === "active"
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}>
                                                {sub.subscriptionStatus === "pending" ? "⏳ Pendente" : sub.subscriptionStatus === "active" ? "✓ Ativo" : "✗ Expirado"}
                                            </span>
                                            {sub.subscriptionStatus === "active" && daysLeft !== null && (
                                                <span className={`text-[10px] font-bold ${daysLeft <= 5 ? "text-red-400" : daysLeft <= 10 ? "text-amber-400" : "text-gray-500"}`}>
                                                    {daysLeft > 0 ? `${daysLeft}d restantes` : "Venceu hoje"}
                                                </span>
                                            )}
                                            {sub.subscriptionStatus === "active" && sub.subscriptionExpiresAt && (
                                                <span className="text-[10px] text-gray-600">
                                                    Vence {format(new Date(sub.subscriptionExpiresAt), "dd/MM/yyyy")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Ações */}
                                        <div className="flex gap-2">
                                            {sub.subscriptionStatus !== "active" && (
                                                <button
                                                    onClick={() => handleApprove(sub.id, `${sub.firstName}`)}
                                                    disabled={isProc}
                                                    className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-all disabled:opacity-50"
                                                    title="Aprovar / Ativar por 30 dias"
                                                >
                                                    {isProc ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            )}
                                            {sub.subscriptionStatus === "active" && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(sub.id, `${sub.firstName}`)}
                                                        disabled={isProc}
                                                        className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-all disabled:opacity-50"
                                                        title="Renovar +30 dias"
                                                    >
                                                        {isProc ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevoke(sub.id, `${sub.firstName}`)}
                                                        disabled={isProc}
                                                        className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all disabled:opacity-50"
                                                        title="Revogar acesso"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
