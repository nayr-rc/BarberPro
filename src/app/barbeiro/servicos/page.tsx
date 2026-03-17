"use client";

import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Scissors, ChevronLeft, Trash2, Plus, DollarSign, Clock, Sparkles, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import apiClient from "@/lib/api";

type BarberService = {
  id: string;
  title: string;
  price: number;
  durationMinutes: number;
};

type ServiceApiItem = {
  id: string;
  title: string;
  price: number;
  durationMinutes?: number;
};

type LegacyLocalService = {
  title: string;
  price: number;
  duration?: string;
};

export default function BarbeiroServicos() {
  const { hasHydrated, user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [services, setServices] = useState<BarberService[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const barberId = user?.id || "";

  const loadServices = useCallback(async () => {
    if (!barberId) {
      return;
    }

    setIsLoading(true);
    setFeedback("");

    try {
      const response = await apiClient.get("/services", {
        params: {
          barberId,
          limit: 100,
          sortBy: "createdAt:desc",
        },
      });

      const mapped: BarberService[] = (response.data.results || []).map((service: ServiceApiItem) => ({
        id: String(service.id),
        title: String(service.title),
        price: Number(service.price || 0),
        durationMinutes: Number(service.durationMinutes || 30),
      }));

      const legacyKey = `barber_services_${barberId}`;
      const legacyRaw = typeof window !== "undefined" ? localStorage.getItem(legacyKey) : null;
      if (legacyRaw) {
        const legacyServices = JSON.parse(legacyRaw) as LegacyLocalService[];
        const currentSignature = new Set(
          mapped.map((service) => `${service.title.toLowerCase()}::${service.price}::${service.durationMinutes}`)
        );

        const missingLegacy = legacyServices.filter((service) => {
          const duration = Number(service.duration || 30);
          const signature = `${String(service.title || "").toLowerCase()}::${Number(service.price || 0)}::${duration}`;
          return !currentSignature.has(signature);
        });

        if (missingLegacy.length > 0) {
          await Promise.all(
            missingLegacy.map((service) =>
              apiClient.post("/services", {
                title: String(service.title || "Serviço"),
                description: String(service.title || "Serviço"),
                price: Number(service.price || 0),
                durationMinutes: Number(service.duration || 30),
              })
            )
          );

          const refreshed = await apiClient.get("/services", {
            params: {
              barberId,
              limit: 100,
              sortBy: "createdAt:desc",
            },
          });

          const refreshedMapped: BarberService[] = (refreshed.data.results || []).map((service: ServiceApiItem) => ({
            id: String(service.id),
            title: String(service.title),
            price: Number(service.price || 0),
            durationMinutes: Number(service.durationMinutes || 30),
          }));

          setServices(refreshedMapped);
          localStorage.removeItem(legacyKey);
          return;
        }

        localStorage.removeItem(legacyKey);
      }

      setServices(mapped);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Não foi possível carregar seus serviços.";

      setFeedback(message || "Não foi possível carregar seus serviços.");
    } finally {
      setIsLoading(false);
    }
  }, [barberId]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    void loadServices();
  }, [isAuthenticated, router, loadServices]);

  const canAddService = useMemo(() => {
    const duration = Number(newDuration);
    const price = Number(newPrice);

    return Boolean(
      newTitle.trim() &&
        Number.isFinite(price) &&
        price >= 0 &&
        Number.isFinite(duration) &&
        duration >= 15 &&
        duration <= 240
    );
  }, [newTitle, newPrice, newDuration]);

  const addService = async () => {
    if (!canAddService || !barberId) {
      return;
    }

    setIsSaving(true);
    setFeedback("");

    try {
      await apiClient.post("/services", {
        title: newTitle.trim(),
        description: newTitle.trim(),
        price: Number(newPrice),
        durationMinutes: Number(newDuration),
      });

      setNewTitle("");
      setNewPrice("");
      setNewDuration("30");
      await loadServices();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Não foi possível adicionar o serviço.";

      setFeedback(message || "Não foi possível adicionar o serviço.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeService = async (id: string) => {
    if (!confirm("Deseja remover este serviço?")) {
      return;
    }

    setFeedback("");

    try {
      await apiClient.delete(`/services/${id}`);
      await loadServices();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Não foi possível remover o serviço.";

      setFeedback(message || "Não foi possível remover o serviço.");
    }
  };

  if (hasHydrated && !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white p-6 pb-24 font-sans selection:bg-emerald-500/30">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between mb-10 sticky top-0 z-40 bg-black/60 backdrop-blur-xl py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/barbeiro/dashboard")}
            className="min-h-0 w-12 h-12 p-0 rounded-2xl border border-white/5 bg-white/5"
          >
            <ChevronLeft size={24} />
          </Button>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold uppercase tracking-tight">Meus Serviços</h1>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">Catálogo e Preços</p>
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-amber-500">
          <Sparkles size={20} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full space-y-10 animate-fade-in-up">
        {feedback && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} />
            <p className="text-xs uppercase tracking-wider font-semibold">{feedback}</p>
          </div>
        )}

        <section>
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <Plus size={16} className="text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Novo Serviço</h2>
          </div>
          <Card className="p-8 border-white/10 bg-white/[0.03]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Nome do Serviço</label>
                <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Ex: Corte Degradê + Pigmentação" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Preço Sugerido</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={newPrice}
                    onChange={(event) => setNewPrice(event.target.value)}
                    placeholder="0.00"
                    className="pl-12"
                  />
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Tempo (min)</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={newDuration}
                    onChange={(event) => setNewDuration(event.target.value)}
                    placeholder="30"
                    className="pl-12"
                  />
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                </div>
              </div>
            </div>
            <Button
              onClick={addService}
              variant="gold"
              disabled={!canAddService || isSaving}
              className="w-full min-h-[64px] uppercase text-xs font-black tracking-[0.2em] shadow-2xl shadow-amber-500/20"
            >
              {isSaving ? "Salvando..." : "Adicionar ao Catálogo"}
            </Button>
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <Scissors size={16} className="text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400">Serviços Ativos</h2>
          </div>

          {isLoading ? (
            <Card className="p-20 text-center border-dashed border-white/10 bg-white/[0.02]">
              <p className="text-sm uppercase tracking-widest font-bold text-gray-400">Carregando serviços...</p>
            </Card>
          ) : services.length === 0 ? (
            <Card className="p-20 text-center opacity-30 border-dashed border-white/10 bg-white/[0.02]">
              <Scissors size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-sm uppercase tracking-widest font-bold">Nenhum serviço disponível.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.id} className="p-6 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                      <Scissors size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white uppercase tracking-tight text-lg">{service.title}</h3>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">R$ {service.price.toFixed(2)}</p>
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {service.durationMinutes} min
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-3 text-gray-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 size={20} />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
