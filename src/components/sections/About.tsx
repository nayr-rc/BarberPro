
export default function About() {
    return (
        <section id="about" className="py-24 bg-barber-dark/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Text Content */}
                <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <span className="text-barber-gold font-display text-xl mb-2 block">01</span>
                    <h2 className="text-4xl md:text-5xl font-heading text-white mb-6 leading-tight">
                        TRADIÇÃO QUE <br />
                        <span className="text-gray-500">ATRAVESSA GERAÇÕES</span>
                    </h2>
                    <p className="text-gray-400 mb-6 text-lg font-light leading-relaxed max-w-xl">
                        Desde 1990, a BarberPro tem sido sinônimo de excelência em cuidados masculinos.
                        Mais do que um corte, oferecemos uma experiência de relaxamento e estilo.
                    </p>
                    <p className="text-gray-400 mb-8 text-lg font-light leading-relaxed max-w-xl">
                        Nossos profissionais são mestres na arte da barbearia clássica e moderna,
                        garantindo que cada cliente saia não apenas com um visual renovado, mas com a autoestima elevada.
                    </p>

                    <div className="flex gap-12 border-t border-white/10 pt-8 w-full justify-center lg:justify-start">
                        <div className="text-center lg:text-left">
                            <span className="block text-3xl font-bold text-barber-gold mb-1">15+</span>
                            <span className="text-gray-500 text-sm uppercase tracking-wider">Anos de Experiência</span>
                        </div>
                        <div className="text-center lg:text-left">
                            <span className="block text-3xl font-bold text-barber-gold mb-1">5k+</span>
                            <span className="text-gray-500 text-sm uppercase tracking-wider">Clientes Satisfeitos</span>
                        </div>
                    </div>
                </div>

                {/* Image/Visual */}
                <div className="relative h-[400px] md:h-[600px] w-full bg-barber-black rounded-lg overflow-hidden border border-white/5 group shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center filter grayscale group-hover:grayscale-0 transition-all duration-700 transform scale-105 group-hover:scale-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-barber-black via-transparent to-transparent opacity-60"></div>
                </div>

            </div>
        </section>
    );
}
