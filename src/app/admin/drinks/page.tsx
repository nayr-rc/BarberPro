"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";

interface Drink {
    id: string;
    name: string;
    price: number;
    active: boolean;
}

export default function AdminDrinks() {
    const { hasHydrated, user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (hasHydrated && (!isAuthenticated || user?.role !== "admin")) {
            router.push("/auth/login");
        } else {
            fetchDrinks();
        }
    }, [isAuthenticated, user, router]);

    const fetchDrinks = async () => {
        try {
            const { data } = await apiClient.get("/drinks");
            setDrinks(data);
        } catch (error) {
            console.error("Erro ao buscar bebidas", error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!name || !price) return;
            await apiClient.post("/drinks", {
                name,
                price: Number(price),
            });
            setName("");
            setPrice("");
            fetchDrinks();
        } catch (error) {
            console.error("Erro ao criar bebida", error);
        }
    };

    const toggleDrink = async (id: string, currentActive: boolean) => {
        try {
            await apiClient.patch(`/drinks/${id}`, {
                active: !currentActive,
            });
            fetchDrinks();
        } catch (error) {
            console.error("Erro ao atualizar bebida", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-barber-accent">Gerenciar Bebidas</h1>
                    <button onClick={() => router.push("/admin")} className="bg-barber-brown px-4 py-2 rounded text-barber-beige">Voltar</button>
                </header>

                <div className="bg-barber-dark border border-barber-brown rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-barber-beige mb-4">Adicionar Nova Bebida</h2>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-barber-accent text-sm mb-1 block">Nome</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white pb-2 focus:border-barber-gold outline-none" required placeholder="Ex: Cerveja IPA" />
                        </div>
                        <div className="flex-1">
                            <label className="text-barber-accent text-sm mb-1 block">Preço (R$)</label>
                            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-transparent border-b border-white/20 text-white pb-2 focus:border-barber-gold outline-none" required placeholder="15.00" />
                        </div>
                        <button type="submit" className="bg-barber-gold text-barber-black font-bold px-6 py-2 rounded hover:bg-white transition">Adicionar</button>
                    </form>
                </div>

                <div className="bg-barber-dark border border-barber-brown rounded-lg p-6">
                    <h2 className="text-xl font-bold text-barber-beige mb-4">Bebidas Cadastradas</h2>
                    <table className="w-full text-left text-white">
                        <thead>
                            <tr className="border-b border-white/10 text-barber-accent">
                                <th className="py-3">Nome</th>
                                <th className="py-3">Preço</th>
                                <th className="py-3">Status</th>
                                <th className="py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drinks.map(drink => (
                                <tr key={drink.id} className="border-b border-white/5">
                                    <td className="py-4">{drink.name}</td>
                                    <td className="py-4">R$ {drink.price.toFixed(2)}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${drink.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {drink.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => toggleDrink(drink.id, drink.active)} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition">
                                            {drink.active ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {drinks.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-400">Nenhuma bebida cadastrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
