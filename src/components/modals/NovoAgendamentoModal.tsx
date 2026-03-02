"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useAgendaStore } from "@/stores/useAgendaStore";
import { X } from "lucide-react";

type NovoAgendamentoModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function NovoAgendamentoModal({ isOpen, onClose }: NovoAgendamentoModalProps) {
    const [loading, setLoading] = useState(false);
    const { adicionarAgendamento } = useAgendaStore();
    const [form, setForm] = useState({
        cliente: "",
        servico: "",
        data: new Date().toISOString().split('T')[0],
        hora: "09:00",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API
        await new Promise(r => setTimeout(r, 1200));

        adicionarAgendamento({
            cliente: form.cliente,
            servico: form.servico,
            data: form.data,
            hora: form.hora,
            status: "confirmado",
            valor: 85,
        });

        alert("Agendamento criado com sucesso! ✅");
        setLoading(false);
        onClose();
        setForm({
            cliente: "",
            servico: "",
            data: new Date().toISOString().split('T')[0],
            hora: "09:00",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <Card className="w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-0 overflow-hidden border-white/10 shadow-2xl animate-slide-up">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Novo Agendamento</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Preencha os dados do cliente</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Cliente</label>
                        <Input
                            placeholder="Nome do cliente"
                            value={form.cliente}
                            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Serviço</label>
                        <Input
                            placeholder="Ex: Corte + Barba"
                            value={form.servico}
                            onChange={(e) => setForm({ ...form, servico: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Data</label>
                            <Input
                                type="date"
                                value={form.data}
                                onChange={(e) => setForm({ ...form, data: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Hora</label>
                            <Input
                                type="time"
                                value={form.hora}
                                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <Button variant="ghost" className="flex-1 min-h-[58px]" onClick={onClose} type="button">
                            Cancelar
                        </Button>
                        <Button variant="gold" className="flex-1 min-h-[58px] uppercase text-xs font-black tracking-widest" type="submit" loading={loading}>
                            Confirmar
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
