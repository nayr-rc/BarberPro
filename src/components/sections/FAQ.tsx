'use client';
import { useState } from 'react';

const FAQS = [
    { q: "Como funciona o aplicativo BarberPro?", a: "O BarberPro permite que você gerencie agendamentos, equipe, estoque e pagamentos em um só lugar. Tudo é feito de forma simples e eficiente, direto pelo celular ou computador." },
    { q: "Preciso pagar para usar o BarberPro?", a: "Temos 7 dias de teste grátis. Depois, cobramos um valor único mensal de R$ 32, sem taxas adicionais por agendamento." },
    { q: "Quais são os benefícios de usar o BarberPro?", a: "Você terá um link 24h para clientes agendarem sozinhos, diminuindo mensagens no WhatsApp. Organização de agenda, lembretes automáticos para evitar faltas e controle financeiro completo." },
    { q: "É seguro usar o BarberPro?", a: "Sim, seguimos os mais rígidos padrões de segurança e estamos em conformidade com a LGPD. Os dados do seu salão e dos seus clientes estão protegidos e criptografados." },
    { q: "Posso personalizar com a minha marca?", a: "Sim! Na página de agendamento que seus clientes acessam, você pode colocar seu logo, suas informações, serviços oferecidos e valores customizados." },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="w-full py-48 lg:py-64 bg-barber-black relative flex flex-col items-center">

            {/* Top Separator */}
            <div className="absolute top-0 w-32 h-1 bg-gradient-to-r from-transparent via-barber-gold to-transparent"></div>

            <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center">

                <div className="text-center mb-32 w-full">
                    <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 font-heading uppercase tracking-tighter">
                        Tire suas Dúvidas
                    </h2>
                    <div className="w-24 h-1.5 bg-barber-gold mx-auto rounded-full"></div>
                </div>

                <div className="w-full space-y-8 lg:space-y-10">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="group bg-white/[0.02] border border-white/5 p-4 lg:p-6 rounded-3xl hover:bg-white/[0.04] transition-all duration-300">
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex justify-between items-center py-4 text-left focus:outline-none px-4"
                            >
                                <span className={`text-xl lg:text-2xl font-bold transition-colors tracking-tight ${open === i ? 'text-barber-gold' : 'text-white'}`}>{faq.q}</span>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${open === i ? 'bg-barber-gold text-barber-black rotate-45' : 'bg-white/10 text-white'}`}>
                                    <span className="text-2xl font-light">+</span>
                                </div>
                            </button>
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-gray-400 font-light text-lg px-4 pt-4 pb-8 leading-relaxed max-w-3xl">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
