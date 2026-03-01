"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/login", data);
      const { tokens, user } = response.data;
      const token = tokens.access.token;

      login(user, token);
      localStorage.setItem("token", token);

      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-barber-dark rounded-lg border border-barber-brown p-8">
        <h1 className="text-3xl font-bold text-barber-accent mb-8 text-center">BarberPro</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-barber-beige mb-2 font-semibold">Email</label>
            <input
              {...register("email", {
                required: "Email é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido",
                },
              })}
              type="email"
              className="w-full bg-barber-black text-barber-beige border border-barber-brown rounded px-4 py-2 focus:outline-none focus:border-barber-accent"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-barber-beige mb-2 font-semibold">Senha</label>
            <input
              {...register("password", {
                required: "Senha é obrigatória",
              })}
              type="password"
              className="w-full bg-barber-black text-barber-beige border border-barber-brown rounded px-4 py-2 focus:outline-none focus:border-barber-accent"
              placeholder="••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-barber-accent hover:bg-barber-brown text-barber-black font-bold py-2 rounded transition disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-barber-accent mt-6">
          Quer levar sua barbearia para o próximo nível?{" "}
          <Link href="/auth/register" className="text-barber-beige hover:underline font-semibold">
            Cadastre sua Barbearia
          </Link>
        </p>
      </div>
    </div>
  );
}
