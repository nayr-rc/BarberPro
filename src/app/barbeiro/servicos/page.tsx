"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Scissors, ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function BarbeiroServicos() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [services, setServices] = useState<{ id: string, title: string, price: number }[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newPrice, setNewPrice] = useState('');

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "barber") {
            router.push("/auth/login");
        }
        // Load from local storage for cross-page demo persistence
        const saved = localStorage.getItem(`barber_services_${user?.id || 'default'}`);
        if (saved) {
            setServices(JSON.parse(saved));
        } else {
            // Default services if empty
            const defaults = [
                { id: '1', title: 'Corte Social', price: 35 },
                { id: '2', title: 'Barba Completa', price: 25 },
                { id: '3', title: 'Corte + Barba', price: 50 },
            ];
            setServices(defaults);
            localStorage.setItem(`barber_services_${user?.id || 'default'}`, JSON.stringify(defaults));
        }
    }, [isAuthenticated, user, router]);

    const saveServices = (list: any[]) => {
        setServices(list);
        localStorage.setItem(`barber_services_${user?.id || 'default'}`, JSON.stringify(list));
    };

    const addService = () => {
        if (!newTitle || !newPrice) return;
        const newList = [...services, { id: Date.now().toString(), title: newTitle, price: parseFloat(newPrice) }];
        saveServices(newList);
        setNewTitle('');
        setNewPrice('');
    };

    const removeService = (id: string) => {
        const newList = services.filter(s => s.id !== id);
        saveServices(newList);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-barber-black text-gray-100 flex flex-col font-body p-4 md:p-8">
            <div className="max-w-4xl mx-auto w-full space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/barbeiro/dashboard" className="inline-flex items-center gap-2 text-barber-accent hover:text-barber-gold transition-colors mb-4 group uppercase text-xs tracking-widest font-bold">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading text-white tracking-widest uppercase">MEUS <span className="text-barber-gold">SERVIÇOS</span></h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Add Service Card */}
                    <div className="bg-barber-dark border border-white/5 p-8 rounded-[2rem] shadow-xl h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <Scissors className="text-barber-gold" size={24} />
                            <h2 className="text-lg font-bold uppercase tracking-widest">Adicionar Serviço</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Título do Serviço</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="Ex: Corte Degradê"
                                    className="w-full bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-xl px-4 py-3 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Preço (R$)</label>
                                <input
                                    type="number"
                                    value={newPrice}
                                    onChange={e => setNewPrice(e.target.value)}
                                    placeholder="45.00"
                                    className="w-full bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-xl px-4 py-3 outline-none text-sm transition-all"
                                />
                            </div>
                            <button
                                onClick={addService}
                                className="w-full bg-barber-gold hover:bg-white text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs mt-2 transition-all active:scale-95"
                            >
                                Salvar Serviço
                            </button>
                        </div>
                    </div>

                    {/* Services List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="text-xl font-heading text-white tracking-widest uppercase">CATÁLOGO <span className="text-barber-gold text-base">({services.length})</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.length === 0 ? (
                                <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-gray-500 uppercase tracking-widest text-xs">Nenhum serviço cadastrado.</p>
                                </div>
                            ) : (
                                services.map(service => (
                                    <div key={service.id} className="bg-barber-dark border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-barber-gold/30 transition-all">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-white uppercase text-sm tracking-wide">{service.title}</h3>
                                            <p className="text-barber-gold font-heading text-lg">R$ {service.price.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => removeService(service.id)}
                                            className="p-3 text-gray-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
