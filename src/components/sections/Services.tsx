
import { Scissors, Armchair, PenTool, CheckCircle, Clock, Star } from 'lucide-react';

export default function Services() {
    const services = [
        { title: "CORTE CLÁSSICO", price: "R$ 45", icon: Scissors, desc: "Corte tradicional com tesoura e máquina." },
        { title: "BARBA PREMIUM", price: "R$ 35", icon: Armchair, desc: "Toalha quente, navalha e hidratação." },
        { title: "CORTE + BARBA", price: "R$ 70", icon: CheckCircle, desc: "O combo completo para o homem moderno." },
        { title: "SOBRANCELHA", price: "R$ 20", icon: PenTool, desc: "Ajuste fino com navalha ou pinça." },
        { title: "PEZINHO", price: "R$ 15", icon: Star, desc: "Alinhamento e acabamento perfeito." },
        { title: "TINTURA", price: "R$ 50", icon: Clock, desc: "Cobertura de brancos ou estilo platinado." }
    ];

    return (
        <section id="services" className="py-24 bg-barber-black relative">
            <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                <Scissors size={400} strokeWidth={0.5} />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-8">
                    <div>
                        <span className="text-barber-gold font-display text-xl mb-2 block">02</span>
                        <h2 className="text-4xl md:text-5xl font-heading text-white">NOSSOS SERVIÇOS</h2>
                    </div>
                    <p className="text-gray-400 max-w-md text-right mt-4 md:mt-0 font-light">
                        Especialistas em cortes clássicos e modernos. Utilizamos apenas os melhores produtos do mercado.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="group p-8 bg-barber-gray border border-white/5 hover:border-barber-gold transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <service.icon size={80} />
                            </div>

                            <service.icon className="w-10 h-10 text-barber-gold mb-6" />

                            <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                            <p className="text-gray-400 text-sm mb-6">{service.desc}</p>

                            <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                <span className="text-2xl font-display text-barber-gold">{service.price}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Agende agora</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
