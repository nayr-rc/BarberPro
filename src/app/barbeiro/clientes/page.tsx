"use client";

import { useEffect, useState } from "react";
import { useClientesStore } from "@/stores/useClientesStore";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, ChevronLeft, Phone, Scissors, Calendar } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import NovoAgendamentoModal from "@/components/modals/NovoAgendamentoModal";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Clientes() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const { clientes, carregarClientes, busca, buscarClientes } = useClientesStore();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        carregarClientes();
    }, [isAuthenticated, carregarClientes, router]);

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        c.telefone.includes(busca)
    );

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
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Meus Clientes</h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Base de Dados</p>
                    </div>
                </div>
                <Button variant="gold" size="sm" className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 shadow-xl shadow-amber-500/20" onClick={() => setModalOpen(true)}>
                    <Plus className="w-6 h-6" />
                </Button>
            </header>

            <main className="px-6 mt-8 space-y-10 max-w-7xl mx-auto w-full animate-fade-in-up">
                {/* Busca Premium */}
                <section>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        <Input
                            className="pl-16 py-8 rounded-[2rem] bg-white/5 border-white/5 focus:border-emerald-500/30 transition-all font-medium placeholder:text-gray-600 block w-full"
                            placeholder="Buscar cliente pelo nome ou telefone..."
                            value={busca}
                            onChange={(e) => buscarClientes(e.target.value)}
                        />
                    </div>
                </section>

                {/* Estatísticas Rápidas */}
                <section className="grid grid-cols-2 gap-4">
                    <Card className="p-6 border-amber-500/10 bg-amber-500/5 group">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Ativos</p>
                        <p className="text-3xl font-black">{clientes.length}</p>
                    </Card>
                    <Card className="p-6 border-emerald-500/10 bg-emerald-500/5 group">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Satisfação</p>
                        <p className="text-3xl font-black">99%</p>
                    </Card>
                </section>

                {/* Lista de Clientes */}
                <section>
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <Users size={16} className="text-amber-400" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">Diretório de Clientes</h2>
                    </div>

                    <div className="space-y-4">
                        {clientesFiltrados.length === 0 ? (
                            <Card className="py-20 text-center opacity-50 border-dashed border-white/10 bg-white/[0.02]">
                                <p className="text-sm uppercase tracking-widest font-medium">Nenhum cliente encontrado</p>
                            </Card>
                        ) : (
                            clientesFiltrados.map((cliente) => (
                                <Card key={cliente.id} className="p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-2xl font-black text-gray-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-all">
                                            {cliente.nome.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg uppercase tracking-tight text-white">{cliente.nome}</h3>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                    <Phone size={12} className="text-emerald-500" /> {cliente.telefone}
                                                </p>
                                                <p className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest border-l border-white/10 pl-3">
                                                    <Scissors size={12} className="text-amber-500" /> {cliente.totalCortes} Cortes
                                                </p>
                                                <p className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest border-l border-white/10 pl-3">
                                                    <Calendar size={12} className="text-blue-500" /> {cliente.ultimoAgendamento}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="min-h-0 w-12 h-12 p-0 rounded-2xl bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all">
                                        <Users size={18} />
                                    </Button>
                                </Card>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <NovoAgendamentoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    );
}
