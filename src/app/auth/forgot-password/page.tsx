"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronRight, Mail, Scissors } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { forgotPassword } from "@/lib/auth";

interface ForgotPasswordForm {
  email: string;
}

type RequestState = "idle" | "success";

const GENERIC_SUCCESS_MESSAGE =
  "Se o e-mail estiver cadastrado, enviaremos um link de recuperacao em instantes.";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError("");
    setRequestState("idle");

    try {
      await forgotPassword({ email: data.email.trim() });
      setRequestState("success");
    } catch {
      setError("Nao foi possivel enviar o link agora. Tente novamente em alguns instantes.");
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
            Recuperacao Segura
          </p>
        </div>

        <Card className="p-8 border-white/10 bg-white/[0.03] backdrop-blur-2xl">
          <header className="mb-8">
            <h2 className="text-xl font-bold uppercase tracking-tight">Recuperar acesso</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
              Informe seu e-mail para receber o link de redefinicao
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Input
                  {...register("email", {
                    required: "Email e obrigatorio",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email invalido",
                    },
                  })}
                  type="email"
                  className="pl-12"
                  placeholder="barbeiro@exemplo.com"
                  autoComplete="email"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              </div>
              {errors.email && (
                <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {requestState === "success" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
                {GENERIC_SUCCESS_MESSAGE}
              </div>
            )}

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
              Enviar link <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
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
