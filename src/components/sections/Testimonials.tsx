
'use client';

import { Star } from 'lucide-react';

export default function Testimonials() {
    const reviews = [
        { name: "João Silva", role: "Cliente VIP", text: "Melhor barbearia da cidade! O atendimento é impecável e o ambiente muito agradável." },
        { name: "Pedro Souza", role: "Empresário", text: "Profissionais de alta qualidade. Recomendo muito o corte com barba terapia." },
        { name: "Marcos Oliveira", role: "Advogado", text: "Ótimo serviço, pontuais e muito atenciosos. Voltarei com certeza." }
    ];

    return (
        <section className="py-24 bg-barber-black relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <span className="font-display text-[20rem] text-barber-gold">"</span>
            </div>

            <div className="max-w-7xl mx-auto px-6 text-center">
                <span className="text-barber-gold font-display text-xl mb-4 block">05</span>
                <h2 className="text-4xl md:text-5xl font-heading text-white mb-16 uppercase tracking-wider">O que dizem nossos clientes</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <div key={index} className="bg-barber-gray p-8 rounded-lg border border-white/5 hover:border-barber-gold transition-all duration-300 transform hover:-translate-y-2">
                            <div className="flex justify-center gap-1 text-barber-gold mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-gray-400 italic mb-6 leading-relaxed">"{review.text}"</p>
                            <div>
                                <h4 className="text-white font-bold">{review.name}</h4>
                                <p className="text-barber-gold text-xs uppercase tracking-widest">{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
