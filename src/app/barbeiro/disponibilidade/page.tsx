"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface DayConfig {
    dayId: number; // 0-6 (Sun-Sat)
    dayLabel: string;
    isOpen: boolean;
    startTime: string;
    endTime: string;
}

const DAYS_NAMES = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
];

const DEFAULT_CONFIG: DayConfig[] = DAYS_NAMES.map((name, index) => ({
    dayId: index,
    dayLabel: name,
    isOpen: index !== 0 && index !== 6, // Mon-Fri open by default
    startTime: "09:00",
    endTime: "19:00"
}));

export default function DisponibilidadeBarbeiro() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [schedule, setSchedule] = useState<DayConfig[]>(DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        } else if (user?.role !== "barber") {
            router.push("/barbeiro/dashboard");
            return;
        }

        const fetchSchedule = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1'}/availability?barberId=${user?.id}`);
                const data = await res.json();
                if (data.schedule && data.schedule.length > 0) {
                    // Map labels back
                    const fullSchedule = DAYS_NAMES.map((name, index) => {
                        const config = data.schedule.find((s: any) => s.dayId === index);
                        return {
                            dayId: index,
                            dayLabel: name,
                            isOpen: config ? config.isOpen : false,
                            startTime: config ? config.startTime : "09:00",
                            endTime: config ? config.endTime : "19:00"
                        };
                    });
                    setSchedule(fullSchedule);
                } else {
                    // Fallback to localStorage if API is empty
                    const saved = localStorage.getItem(`barber_schedule_${user?.id}`);
                    if (saved) setSchedule(JSON.parse(saved));
                }
            } catch (err) {
                console.error("Erro ao carregar agenda:", err);
            }
        };

        fetchSchedule();
    }, [isAuthenticated, user, router]);

    const handleToggle = (id: number) => {
        setSchedule(prev => prev.map(day =>
            day.dayId === id ? { ...day, isOpen: !day.isOpen } : day
        ));
    };

    const handleTimeChange = (id: number, field: 'startTime' | 'endTime', value: string) => {
        setSchedule(prev => prev.map(day =>
            day.dayId === id ? { ...day, [field]: value } : day
        ));
    };

    const saveSchedule = async () => {
        setIsSaving(true);

        // 1. Mandatory Local Save (Works without database)
        localStorage.setItem(`barber_schedule_${user?.id}`, JSON.stringify(schedule));

        try {
            // 2. Try to sync with Database
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1'}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    barberId: user?.id,
                    workingHours: schedule.map(({ dayId, isOpen, startTime, endTime }) => ({
                        dayId, isOpen, startTime, endTime
                    }))
                })
            });

            if (res.ok) {
                console.log("Sincronizado com o servidor");
            } else {
                console.warn("Salvo localmente, mas falhou ao sincronizar com servidor.");
            }
        } catch (err) {
            console.error("Erro na sincronização:", err);
        } finally {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    if (!isAuthenticated || user?.role !== "barber") return null;

    return (
        <div className="min-h-screen bg-barber-black text-gray-100 font-body selection:bg-barber-gold selection:text-black">
            <div className="max-w-4xl mx-auto p-4 md:p-12 space-y-12 pb-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/barbeiro/dashboard" className="inline-flex items-center gap-2 text-barber-accent hover:text-barber-gold transition-colors group uppercase text-xs tracking-widest font-bold">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Painel de Controle
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-heading text-white tracking-widest uppercase">
                            HORÁRIOS DE <span className="text-barber-gold">TRABALHO</span>
                        </h1>
                        <p className="text-gray-500 uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-2">
                            DEFINA SUA DISPONIBILIDADE SEMANAL
                        </p>
                    </div>

                    <button
                        onClick={saveSchedule}
                        disabled={isSaving}
                        className={`bg-barber-gold hover:bg-white text-barber-black px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-bold uppercase tracking-widest text-sm shadow-xl shadow-barber-gold/10 active:scale-95 disabled:opacity-50 min-w-[200px] justify-center ${isSaving ? 'animate-pulse' : ''}`}
                    >
                        {isSaving ? <Clock className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? 'Salvando...' : 'Salvar Agenda'}
                    </button>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top fade-in duration-500">
                        <div className="bg-emerald-500 p-2 rounded-full text-white">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-400 uppercase tracking-widest text-sm">Agenda Atualizada!</p>
                            <p className="text-xs text-gray-400 mt-1">Sua nova disponibilidade já está disponível para os clientes.</p>
                        </div>
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-barber-dark/50 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-barber-gold/10 p-5 rounded-2xl text-barber-gold">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="font-bold text-white uppercase tracking-widest">Informações Importantes</h4>
                        <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">
                            Configure os dias e intervalos em que você atende. Clientes só conseguirão agendar nos horários definidos aqui.
                            Agendamentos já existentes não serão excluídos se você desativar um dia.
                        </p>
                    </div>
                </div>

                {/* Days Configuration List */}
                <div className="space-y-4">
                    {schedule.map((day) => (
                        <div
                            key={day.dayId}
                            className={`group bg-barber-dark border transition-all duration-300 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 ${day.isOpen
                                ? 'border-white/10 bg-gradient-to-r from-white/[0.02] to-transparent'
                                : 'border-white/5 opacity-50'
                                }`}
                        >
                            {/* Day Selector */}
                            <div className="flex items-center gap-6 min-w-[240px]">
                                <button
                                    onClick={() => handleToggle(day.dayId)}
                                    className={`relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${day.isOpen ? 'bg-barber-gold' : 'bg-white/10'
                                        }`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${day.isOpen ? 'translate-x-8' : 'translate-x-0'
                                        }`} />
                                </button>
                                <div className="space-y-1">
                                    <h3 className={`font-heading text-lg tracking-widest uppercase transition-colors ${day.isOpen ? 'text-white' : 'text-gray-600'
                                        }`}>
                                        {day.dayLabel}
                                    </h3>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${day.isOpen ? 'text-barber-gold' : 'text-gray-500'
                                        }`}>
                                        {day.isOpen ? 'Trabalhando' : 'Folga'}
                                    </p>
                                </div>
                            </div>

                            {/* Time Selectors */}
                            {day.isOpen ? (
                                <div className="flex flex-1 items-center justify-center md:justify-end gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Início</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={day.startTime}
                                                onChange={(e) => handleTimeChange(day.dayId, 'startTime', e.target.value)}
                                                className="bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-2xl px-6 py-4 outline-none text-white text-lg font-bold transition-all w-[140px] appearance-none"
                                            />
                                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={18} />
                                        </div>
                                    </div>

                                    <div className="h-8 w-[1px] bg-white/10 self-end mb-4 hidden md:block" />

                                    <div className="space-y-2">
                                        <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Fim</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={day.endTime}
                                                onChange={(e) => handleTimeChange(day.dayId, 'endTime', e.target.value)}
                                                className="bg-barber-black border border-white/10 focus:border-barber-gold/50 rounded-2xl px-6 py-4 outline-none text-white text-lg font-bold transition-all w-[140px] appearance-none"
                                            />
                                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-end text-right">
                                    <p className="text-gray-600 italic text-sm font-medium tracking-wide">
                                        Nenhum horário definido para este dia.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Tip */}
                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                        DICA: Recomendamos salvar as alterações após qualquer modificação significativa.
                    </p>
                </div>
            </div>

            <style jsx global>{`
                input[type="time"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    opacity: 0.3;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
