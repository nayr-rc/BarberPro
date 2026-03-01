
'use client';

import { Star } from 'lucide-react';

export default function Testimonials() {
    const reviews = [
        { name: "João Silva", role: "Cliente VIP", text: "Melhor barbearia da cidade! O atendimento é impecável e o ambiente muito agradável." },
        { name: "Pedro Souza", role: "Empresário", text: "Profissionais de alta qualidade. Recomendo muito o corte com barba terapia." },
        { name: "Marcos Oliveira", role: "Advogado", text: "Ótimo serviço, pontuais e muito atenciosos. Voltarei com certeza." }
    ];

    return (
        <section id="testimonials" className="py-24 bg-barber-black relative overflow-hidden flex flex-col items-center">
            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                <span className="font-display text-[30rem] text-barber-gold leading-none">"</span>
            </div>

            <div className="max-w-7xl w-full mx-auto px-6 text-center relative z-10">
                <span className="text-barber-gold font-display text-xl mb-4 block">05</span>
                <h2 className="text-4xl md:text-5xl font-heading text-white mb-20 uppercase tracking-[0.2em]">
                    O QUE DIZEM <br className="md:hidden" />
                    <span className="text-gray-500">NOSSOS CLIENTES</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                    {reviews.map((review, index) => (
                        <div key={index} className="group bg-barber-gray/30 backdrop-blur-sm p-10 rounded-xl border border-white/5 hover:border-barber-gold/30 transition-all duration-500 flex flex-col items-center justify-between text-center min-h-[350px]">
                            <div className="w-full">
                                <div className="flex justify-center gap-2 text-barber-gold mb-8">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill="currentColor" strokeWidth={0} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                                    ))}
                                </div>
                                <p className="text-gray-400 italic text-lg leading-relaxed font-light mb-8 px-2 overflow-hidden">
                                    "{review.text}"
                                </p>
                            </div>

                            <div className="mt-auto pt-8 border-t border-white/5 w-full">
                                <h4 className="text-white font-bold tracking-widest uppercase text-sm mb-1">{review.name}</h4>
                                <p className="text-barber-gold/60 text-[10px] uppercase tracking-[0.3em] font-medium">{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
