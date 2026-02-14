
import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-barber-black">
            {/* Background Image / Gradient / Texture */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512690118299-a034440b4970?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center filter brightness-[0.3] grayscale hover:grayscale-0 transition-all duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-barber-black/60 to-barber-black"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-10"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-barber-gold text-sm tracking-[0.6em] uppercase mb-6 font-medium">
                        Estilo & Tradição Masculina
                    </h2>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <h1 className="text-6xl md:text-9xl font-heading text-white mb-8 leading-tight tracking-tighter">
                        BARBER<span className="text-barber-gold">PRO</span>
                    </h1>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl mb-12 font-light leading-relaxed">
                        Desde 1990, elevando o padrão do cuidado masculino. Corte, barba e experiência.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                    <Link href="#booking" className="group relative px-10 py-5 bg-barber-gold text-barber-black font-bold tracking-widest overflow-hidden transition-all duration-300">
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300">AGENDAR HORÁRIO</span>
                        <div className="absolute inset-0 h-full w-full bg-barber-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                    <Link href="#services" className="text-white hover:text-barber-gold transition-colors tracking-[0.2em] text-sm uppercase font-semibold border-b border-transparent hover:border-barber-gold pb-1">
                        Nossos Serviços
                    </Link>
                </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-10 left-10 hidden lg:block overflow-hidden">
                <span className="text-barber-gold/10 font-heading text-[15rem] leading-none select-none">B</span>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                <span className="text-[10px] text-barber-gold/40 uppercase tracking-[0.3em] font-bold">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-barber-gold to-transparent animate-pulse"></div>
            </div>
        </section>
    );
}
