"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, KeyRound, Lock, Scissors } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { resetPassword } from "@/lib/auth";

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch("password");
  const hasToken = useMemo(() => token.trim().length > 0, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!hasToken) {
      setError("Link invalido. Solicite uma nova recuperacao de senha.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword(token, { password: data.password });
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Nao foi possivel redefinir sua senha. Solicite um novo link e tente novamente.";

      setError(message || "Nao foi possivel redefinir sua senha. Solicite um novo link e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-barber-gold to-amber-600 rounded-[2.5rem] flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-amber-500/20">
            <Scissors className="text-black" size={44} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Barber<span className="text-barber-gold">Pro</span>
          </h1>
          <p className="text-[10px] font-black tracking-[0.4em] text-gray-500 uppercase mt-2 border-t border-white/5 pt-2 inline-flex gap-2">
            Nova Credencial
          </p>
        </div>

        <Card className="p-8 border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={30} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-tight">Senha atualizada</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Sua conta ja pode ser acessada com a nova senha
                </p>
              </div>
              <Link
                href="/auth/login"
                className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-barber-gold to-amber-500 px-7 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:brightness-110 active:scale-[0.96]"
              >
                Ir para o login
              </Link>
            </div>
          ) : !hasToken ? (
            <div className="text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                <KeyRound size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-tight">Link invalido</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Solicite um novo e-mail para redefinir sua senha
                </p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-barber-gold to-amber-500 px-7 text-xs font-black uppercase tracking-[0.2em] text-black transition-all hover:brightness-110 active:scale-[0.96]"
              >
                Solicitar novo link
              </Link>
            </div>
          ) : (
            <>
              <header className="mb-8">
                <h2 className="text-xl font-bold uppercase tracking-tight">Definir nova senha</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
                  Use pelo menos 8 caracteres com letras e numeros
                </p>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Nova senha</label>
                  <div className="relative">
                    <Input
                      {...register("password", {
                        required: "Senha e obrigatoria",
                        pattern: {
                          value: PASSWORD_RULE,
                          message: "Use 8 caracteres com ao menos 1 letra e 1 numero",
                        },
                      })}
                      type="password"
                      className="pl-12"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirmar senha</label>
                  <div className="relative">
                    <Input
                      {...register("confirmPassword", {
                        required: "Confirme sua senha",
                        validate: (value) => value === password || "As senhas nao coincidem",
                      })}
                      type="password"
                      className="pl-12"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  variant="gold"
                  className="w-full min-h-[64px] uppercase text-xs font-black tracking-[0.2em] shadow-2xl shadow-amber-500/20 mt-4 group"
                >
                  Salvar nova senha <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </>
          )}
        </Card>

        <footer className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Voltar para o login
          </Link>
        </footer>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-barber-gold">Carregando recuperacao...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
