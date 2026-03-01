import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-barber-black pt-20">
            {/* Background Image / Gradient / Texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-barber-black via-[#1a1a1a] to-[#2d2d2d]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-10"></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-barber-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-10">

                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-barber-gold text-sm md:text-base tracking-[0.4em] uppercase mb-4 font-bold">
                        Para Barbeiros Empreendedores
                    </h2>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.1] font-heading">
                        Simplifique a forma como você administra seu negócio
                    </h1>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <p className="text-gray-400 text-lg md:text-xl xl:text-2xl mb-12 font-light leading-relaxed max-w-2xl mx-auto">
                        Não importa o tamanho do seu estabelecimento, o BarberPro é projetado para impulsionar sua produtividade, liberando você para focar no que realmente importa: crescer e prosperar.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up w-full sm:w-auto" style={{ animationDelay: '0.8s' }}>
                    <Link href="#pricing" className="px-8 py-4 bg-barber-gold text-barber-black font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 w-full sm:w-auto text-center rounded">
                        Começar Teste Grátis
                    </Link>
                    <Link href="#features" className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-wider hover:border-barber-gold hover:text-barber-gold transition-all duration-300 w-full sm:w-auto text-center rounded">
                        Ver Recursos
                    </Link>
                </div>

            </div>
        </section>
    );
}
