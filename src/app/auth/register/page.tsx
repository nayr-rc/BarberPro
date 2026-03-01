"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError("");
    try {
      const nameParts = data.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

      const response = await apiClient.post("/auth/register", {
        firstName,
        lastName,
        email: data.email,
        contactNumber: data.phone,
        password: data.password,
      });

      const { tokens, user } = response.data;
      const token = tokens.access.token;

      login(user, token);
      localStorage.setItem("token", token);

      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-black to-barber-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-barber-dark rounded-lg border border-barber-brown p-8">
        <h1 className="text-3xl font-bold text-barber-accent mb-8 text-center uppercase tracking-widest">Novo Barbeiro</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-barber-beige mb-2 font-semibold">Nome Completo</label>
            <input
              {...register("name", { required: "Nome é obrigatório" })}
              type="text"
              className="w-full bg-barber-black text-barber-beige border border-barber-brown rounded px-4 py-2 focus:outline-none focus:border-barber-accent"
              placeholder="Seu Nome"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

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
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-barber-beige mb-2 font-semibold">Telefone</label>
            <input
              {...register("phone", { required: "Telefone é obrigatório" })}
              type="tel"
              className="w-full bg-barber-black text-barber-beige border border-barber-brown rounded px-4 py-2 focus:outline-none focus:border-barber-accent"
              placeholder="(11) 99999-9999"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-barber-beige mb-2 font-semibold">Confirmar Senha</label>
            <input
              {...register("confirmPassword", {
                required: "Confirme a senha",
                validate: (value) => value === password || "Senhas não coincidem",
              })}
              type="password"
              className="w-full bg-barber-black text-barber-beige border border-barber-brown rounded px-4 py-2 focus:outline-none focus:border-barber-accent"
              placeholder="••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
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
            {isLoading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-center text-barber-accent mt-6">
          Já é nosso parceiro?{" "}
          <Link href="/auth/login" className="text-barber-beige hover:underline font-semibold text-xs tracking-widest uppercase ml-2">
            Acessar Painel
          </Link>
        </p>
      </div>
    </div>
  );
}
