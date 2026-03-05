"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Clock, Calendar, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import apiClient from "@/lib/api";

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
    const { hasHydrated, user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [schedule, setSchedule] = useState<DayConfig[]>(DEFAULT_CONFIG);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (hasHydrated && !isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        const fetchSchedule = async () => {
            try {
                const { data } = await apiClient.get(`/availability?barberId=${user?.id}`);
                if (data.schedule && data.schedule.length > 0) {
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
                }
            } catch (err) {
                console.warn("Erro ao carregar agenda:", err);
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
        try {
            await apiClient.post('/availability', {
                barberId: user?.id,
                workingHours: schedule.map(({ dayId, isOpen, startTime, endTime }) => ({
                    dayId, isOpen, startTime, endTime
                }))
            });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Erro na sincronização:", err);
            alert('Erro ao salvar. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (hasHydrated && !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white p-6 pb-24 font-sans selection:bg-emerald-500/30">
            <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-10 sticky top-0 z-40 bg-black/60 backdrop-blur-xl py-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/barbeiro/dashboard")} className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5">
                        <ChevronLeft size={24} />
                    </Button>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-bold uppercase tracking-tight">Horários</h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Disponibilidade</p>
                    </div>
                </div>
                <Button
                    onClick={saveSchedule}
                    loading={isSaving}
                    variant="gold"
                    className="min-h-0 h-12 px-8 text-[10px] uppercase font-black tracking-widest shadow-2xl shadow-amber-500/20"
                >
                    <Save size={16} /> Salvar
                </Button>
            </header>

            <main className="max-w-4xl mx-auto w-full space-y-10 animate-fade-in-up">
                {showSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 mb-6 animate-slide-up shadow-2xl shadow-emerald-500/10">
                        <div className="bg-emerald-500 p-3 rounded-2xl text-black">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-400 uppercase tracking-widest text-xs">Agenda Atualizada!</p>
                            <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-[0.2em]">Seus horários estão online.</p>
                        </div>
                    </div>
                )}

                <Card className="p-8 flex items-center gap-6 border-amber-500/10 bg-amber-500/5">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
                        <AlertCircle size={32} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold uppercase tracking-widest text-sm text-amber-500">Gestão de Agenda</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                            Configure os dias e horários em que você está aberto para novos cortes.
                        </p>
                    </div>
                </Card>

                <div className="space-y-4">
                    {schedule.map((day) => (
                        <Card
                            key={day.dayId}
                            className={`p-8 flex flex-col md:flex-row items-center gap-8 transition-all border-white/5 bg-white/[0.02] ${day.isOpen ? 'opacity-100 hover:border-emerald-500/30' : 'opacity-40 grayscale'}`}
                        >
                            <div className="flex items-center gap-6 min-w-[200px] w-full md:w-auto">
                                <button
                                    onClick={() => handleToggle(day.dayId)}
                                    className={`relative w-16 h-8 rounded-full transition-all flex items-center px-1 shadow-inner ${day.isOpen ? 'bg-emerald-600' : 'bg-white/10'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${day.isOpen ? 'translate-x-8' : 'translate-x-0'}`} />
                                </button>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-lg uppercase tracking-tight">{day.dayLabel}</h3>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${day.isOpen ? 'text-emerald-400' : 'text-gray-600'}`}>
                                        {day.isOpen ? 'Trabalhando' : 'Folga'}
                                    </p>
                                </div>
                            </div>

                            {day.isOpen && (
                                <div className="flex flex-1 items-center justify-center md:justify-end gap-6 animate-fade-in w-full md:w-auto">
                                    <div className="space-y-2 flex-1 md:flex-none">
                                        <label className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Início</label>
                                        <Input
                                            type="time"
                                            value={day.startTime}
                                            onChange={(e) => handleTimeChange(day.dayId, 'startTime', e.target.value)}
                                            className="w-full md:w-[140px] appearance-none"
                                        />
                                    </div>
                                    <div className="w-4 h-[2px] bg-white/5 self-end mb-6 hidden md:block" />
                                    <div className="space-y-2 flex-1 md:flex-none">
                                        <label className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em] ml-1">Encerramento</label>
                                        <Input
                                            type="time"
                                            value={day.endTime}
                                            onChange={(e) => handleTimeChange(day.dayId, 'endTime', e.target.value)}
                                            className="w-full md:w-[140px] appearance-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
