"use client";

import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DollarSign, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function BarbeiroFinanceiro() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== "barber") {
            router.push("/auth/login");
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-barber-black text-gray-100 flex flex-col font-body p-6">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/barbeiro/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ChevronLeft size={24} className="text-barber-gold" />
                </Link>
                <h1 className="text-2xl font-heading text-white tracking-widest uppercase">Financeiro</h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <DollarSign size={64} className="text-barber-gold mb-2" />
                <h2 className="text-xl font-bold">Relatórios em Breve</h2>
                <p className="text-sm max-w-xs uppercase tracking-widest">Acompanhe seus lucros diários, semanais e comissões aqui.</p>
            </main>
        </div>
    );
}
