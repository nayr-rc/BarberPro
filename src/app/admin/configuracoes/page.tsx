"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { AlertTriangle, CheckCircle2, ChevronLeft, Loader2, Save, Settings, ShieldCheck } from "lucide-react";

type AdminProfile = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
};

type HealthStatus = {
  status: string;
  uptime?: number;
  timestamp?: string;
};

export default function AdminConfiguracoesPage() {
  const { hasHydrated, user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [profile, setProfile] = useState<AdminProfile>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.role !== "admin") {
      router.push("/admin");
      return;
    }

    const fetchData = async () => {
      if (!user?.id) {
        return;
      }

      setIsLoading(true);
      try {
        const [userRes, healthRes] = await Promise.all([
          apiClient.get(`/users/${user.id}`),
          apiClient.get("/health"),
        ]);

        const admin = userRes.data;
        setProfile({
          firstName: admin.firstName || "",
          lastName: admin.lastName || "",
          email: admin.email || "",
          contactNumber: admin.contactNumber || "",
        });

        setHealth(healthRes.data || null);
      } catch {
        setFeedback({ type: "error", text: "Não foi possível carregar as configurações administrativas." });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [isAuthenticated, user, router]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) {
      return;
    }

    setIsSavingProfile(true);
    setFeedback(null);
    try {
      await apiClient.patch(`/users/${user.id}`, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        contactNumber: profile.contactNumber,
      });

      setFeedback({ type: "success", text: "Perfil administrativo atualizado com sucesso." });
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Não foi possível atualizar o perfil.";

      setFeedback({ type: "error", text: message || "Não foi possível atualizar o perfil." });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id) {
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({ type: "error", text: "A nova senha precisa ter pelo menos 8 caracteres." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: "error", text: "A confirmação da senha não confere." });
      return;
    }

    setIsSavingPassword(true);
    setFeedback(null);

    try {
      await apiClient.patch(`/users/${user.id}/password`, {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setFeedback({ type: "success", text: "Senha alterada com sucesso." });
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Não foi possível alterar a senha.";

      setFeedback({ type: "error", text: message || "Não foi possível alterar a senha." });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (hasHydrated && (!isAuthenticated || user?.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-14">
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
              <Settings className="w-5 h-5 text-barber-gold" />
              Configurações
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Perfil administrativo e segurança</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {feedback && (
          <div
            className={`rounded-xl border px-4 py-3 flex items-center gap-2 ${
              feedback.type === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <p className="text-xs uppercase tracking-widest font-semibold">{feedback.text}</p>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-barber-gold" />
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
              <h2 className="text-sm uppercase tracking-widest text-barber-gold font-black">Dados do administrador</h2>
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome" value={profile.firstName} onChange={(value) => setProfile((prev) => ({ ...prev, firstName: value }))} />
                <Field label="Sobrenome" value={profile.lastName} onChange={(value) => setProfile((prev) => ({ ...prev, lastName: value }))} />
                <Field label="E-mail" type="email" value={profile.email} onChange={(value) => setProfile((prev) => ({ ...prev, email: value }))} />
                <Field label="Telefone" value={profile.contactNumber} onChange={(value) => setProfile((prev) => ({ ...prev, contactNumber: value }))} />

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-barber-gold/40 bg-barber-gold/10 px-4 py-3 text-xs uppercase tracking-widest font-bold text-barber-gold hover:bg-barber-gold/20 disabled:opacity-40"
                >
                  <Save className="w-4 h-4" />
                  {isSavingProfile ? "Salvando..." : "Salvar alterações"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
              <h2 className="text-sm uppercase tracking-widest text-barber-gold font-black inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Segurança de acesso
              </h2>

              <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field
                  label="Senha atual"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                />
                <Field label="Nova senha" type="password" value={newPassword} onChange={setNewPassword} />
                <Field
                  label="Confirmar nova senha"
                  type="password"
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                />

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="md:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-xs uppercase tracking-widest font-bold text-white hover:bg-white/10 disabled:opacity-40"
                >
                  {isSavingPassword ? "Atualizando senha..." : "Atualizar senha"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
              <h2 className="text-sm uppercase tracking-widest text-barber-gold font-black">Status de integração</h2>
              <div className="grid md:grid-cols-2 gap-3 text-xs uppercase tracking-wider">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-gray-500 mb-1">API Base</p>
                  <p className="text-gray-200 break-all">{process.env.NEXT_PUBLIC_API_URL || "Não definida"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-gray-500 mb-1">Health Check</p>
                  <p className="text-gray-200">
                    {health?.status ? `Status: ${health.status}` : "Sem resposta"}
                    {health?.uptime !== undefined ? ` • Uptime: ${Math.round(health.uptime)}s` : ""}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2 block">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-barber-gold/50"
      />
    </label>
  );
}
