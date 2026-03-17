"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Check, ArrowRight, ShieldCheck, Lock, Zap } from "lucide-react";
import Image from "next/image";

const PIX_CODE = "00020126360014BR.GOV.BCB.PIX0114+55719990340675204000053039865802BR5923Ryan Goncalves da Silva6009SAO PAULO62140510w0IbCKBo9t63049A4A";
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(PIX_CODE)}&bgcolor=111111&color=AF8447&margin=16`;

export default function PagamentoPage() {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(PIX_CODE);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleConfirm = () => {
        setConfirmed(true);
        setTimeout(() => {
            router.push("/auth/register");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-16 selection:bg-barber-gold selection:text-black">

            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-barber-gold/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">

                {/* Logo / Topo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 text-barber-gold font-bold tracking-[0.25em] text-sm uppercase mb-6 border border-barber-gold/20 px-4 py-2 rounded-full bg-barber-gold/5">
                        <Zap className="w-3.5 h-3.5" /> BarberPro Premium
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                        Finalize sua <span className="text-barber-gold">Assinatura</span>
                    </h1>
                    <p className="text-gray-400 font-light">
                        Pague via PIX e crie sua conta em segundos
                    </p>
                </div>

                {/* Card Principal */}
                <div className="bg-[#141414] border border-white/8 rounded-3xl overflow-hidden shadow-2xl">

                    {/* Valor */}
                    <div className="bg-gradient-to-r from-barber-gold/10 to-transparent border-b border-white/5 px-8 py-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total a pagar</p>
                            <div className="flex items-end gap-1">
                                <span className="text-gray-400 text-lg font-bold">R$</span>
                                <span className="text-4xl font-black text-barber-gold leading-none">25</span>
                                <span className="text-gray-400 font-bold mb-1">/mês</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Plano</p>
                            <p className="text-sm font-bold text-white">Acesso Mensal</p>
                        </div>
                    </div>

                    <div className="px-8 py-8 space-y-8">

                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-xs uppercase tracking-widest font-bold text-gray-500">Escaneie o QR Code</p>
                            <div className="p-3 bg-[#111] border border-barber-gold/20 rounded-2xl shadow-xl shadow-barber-gold/5">
                                <img
                                    src={QR_URL}
                                    alt="QR Code PIX"
                                    width={220}
                                    height={220}
                                    className="rounded-xl block"
                                />
                            </div>
                            <p className="text-xs text-gray-600 font-light">Abra o app do seu banco → PIX → Ler QR Code</p>
                        </div>

                        {/* Divisor */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-xs text-gray-600 uppercase tracking-widest font-bold">ou copie o código</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        {/* Copiar código PIX */}
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">PIX Copia e Cola</p>
                            <div className="flex items-center gap-3 bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 group">
                                <p className="flex-1 text-xs text-gray-400 font-mono break-all leading-relaxed select-all">
                                    {PIX_CODE}
                                </p>
                                <button
                                    onClick={handleCopy}
                                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-barber-gold/10 border border-barber-gold/20 flex items-center justify-center text-barber-gold hover:bg-barber-gold/20 active:scale-95 transition-all"
                                    title="Copiar código PIX"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            {copied && (
                                <p className="text-xs text-green-400 font-medium mt-2 flex items-center gap-1.5">
                                    <Check className="w-3 h-3" /> Código copiado! Cole no seu app de banco.
                                </p>
                            )}
                        </div>

                        {/* Botão de confirmação */}
                        <button
                            onClick={handleConfirm}
                            disabled={confirmed}
                            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl
                ${confirmed
                                    ? "bg-green-500 text-white shadow-green-500/20 scale-[0.98]"
                                    : "bg-barber-gold text-barber-black hover:bg-white hover:text-black shadow-barber-gold/20 active:scale-95"
                                }`}
                        >
                            {confirmed ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Pagamento confirmado! Redirecionando...
                                </>
                            ) : (
                                <>
                                    Já efetuei o pagamento
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {/* Segurança */}
                        <div className="flex items-center justify-center gap-6 pt-2">
                            <div className="flex items-center gap-1.5 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
                                <ShieldCheck className="w-3.5 h-3.5" /> Pagamento seguro
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600 text-[10px] uppercase tracking-widest font-bold">
                                <Lock className="w-3.5 h-3.5" /> Dados protegidos
                            </div>
                        </div>

                    </div>
                </div>

                {/* Rodapé */}
                <p className="text-center text-xs text-gray-600 mt-8 font-light">
                    Após o pagamento, você receberá acesso imediato à plataforma.
                    <br />Dúvidas? Entre em contato via WhatsApp.
                </p>

            </div>
        </div>
    );
}
