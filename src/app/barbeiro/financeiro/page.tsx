"use client";

import { useEffect, useState } from "react";
import { useGanhosStore } from "@/stores/useGanhosStore";
import { TrendingUp, Download, ChevronLeft, BarChart3, TrendingDown, DollarSign, Wallet, Calendar, PieChart } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

export default function BarbeiroFinanceiro() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { resumo, carregarResumo, isLoading } = useGanhosStore();
    const [periodo, setPeriodo] = useState<"hoje" | "semana" | "mes">("semana");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        carregarResumo(periodo);
    }, [periodo, carregarResumo, isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black pb-24 text-white font-sans selection:bg-emerald-500/30">
            {/* Header Premium */}
            <header className="px-6 pt-10 pb-8 flex items-center justify-between sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/barbeiro/dashboard")} className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Financeiro</h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Fluxo de Caixa e Relatórios</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5 text-emerald-400">
                    <BarChart3 className="w-5 h-5" />
                </Button>
            </header>

            <main className="px-6 py-10 space-y-10 max-w-7xl mx-auto w-full animate-fade-in-up">
                {/* Seletor de Período Premium */}
                <section className="flex flex-wrap gap-3">
                    {(["hoje", "semana", "mes"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${periodo === p ? "bg-amber-500 text-black border-amber-500 shadow-xl shadow-amber-500/20" : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"}`}
                        >
                            {p === "hoje" ? "Hoje" : p === "semana" ? "Semana" : "Mês"}
                        </button>
                    ))}
                </section>

                {/* Card de Faturamento Principal */}
                <section>
                    <Card className="p-12 text-center border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform duration-1000">
                            <PieChart size={300} />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="mx-auto w-16 h-16 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                                <TrendingUp size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ganhos no Período</p>
                                {isLoading ? (
                                    <div className="h-16 w-48 bg-white/5 mx-auto rounded-full animate-pulse mt-2" />
                                ) : (
                                    <p className="text-6xl font-black text-emerald-400 tracking-tight">
                                        R$ {resumo.totalSemana.toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                            <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                <TrendingUp size={14} /> +{resumo.comparacaoSemana}% em relação ao período anterior
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Grid de Detalhes Financeiros */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-8 border-amber-500/10 bg-amber-500/5 group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Saldo em Carteira</p>
                                <p className="text-2xl font-black">R$ 1.150,00</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest border-amber-500/20 bg-amber-500/5 text-amber-500">Solicitar Saque</Button>
                    </Card>

                    <Card className="p-8 border-blue-500/10 bg-blue-500/5 group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Previsão Próximo Mês</p>
                                <p className="text-2xl font-black">R$ 5.200,00</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full py-4 text-[10px] font-black uppercase tracking-widest border-blue-500/20 bg-blue-500/5 text-blue-400">Ver Projeções</Button>
                    </Card>
                </section>

                {/* Relatórios Detalhados */}
                <section className="pb-10">
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <Download size={16} className="text-gray-400" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Exportar Relatórios</h2>
                    </div>
                    <Card className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-dashed border-white/10 bg-white/[0.02]">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center text-gray-600">
                                <PieChart size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg uppercase tracking-tight">Histórico Mensal Completo</h3>
                                <p className="text-xs text-gray-600 font-medium uppercase tracking-widest">Formato PDF, CSV ou Excel</p>
                            </div>
                        </div>
                        <Button variant="gold" className="min-h-[58px] px-12 uppercase text-[10px] font-black tracking-[0.2em] shadow-2xl shadow-amber-500/20" onClick={() => alert("Relatório baixado! 📄")}>
                            <Download size={18} className="mr-2" /> Baixar PDF
                        </Button>
                    </Card>
                </section>
            </main>
        </div>
    );
}
