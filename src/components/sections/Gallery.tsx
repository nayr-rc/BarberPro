
export default function Gallery() {
    const images = [
        { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop", title: "Corte Moderno" },
        { url: "https://images.unsplash.com/photo-1621605815841-aa88805b0a7d?q=80&w=2070&auto=format&fit=crop", title: "Barba Desenhada" },
        { url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1976&auto=format&fit=crop", title: "Tradição" },
        { url: "https://images.unsplash.com/photo-1512690118299-a034440b4970?q=80&w=2070&auto=format&fit=crop", title: "Ambiente" },
        { url: "https://images.unsplash.com/photo-1593702295094-ada65bc43372?q=80&w=2070&auto=format&fit=crop", title: "Estilo" },
        { url: "https://images.unsplash.com/photo-1532710093739-9470acff878f?q=80&w=2070&auto=format&fit=crop", title: "Detalhes" },
    ];

    return (
        <section id="gallery" className="py-24 bg-barber-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-8">
                    <div>
                        <span className="text-barber-gold font-display text-xl mb-2 block">04</span>
                        <h2 className="text-4xl md:text-5xl font-heading text-white">NOSSOS TRABALHOS</h2>
                    </div>
                    <p className="text-gray-400 max-w-md text-right mt-4 md:mt-0 font-light italic">
                        "A perfeição está nos detalhes." - Confira alguns de nossos resultados.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="group relative h-80 overflow-hidden bg-barber-gray cursor-pointer">
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-barber-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white font-heading text-xl tracking-widest border-b-2 border-barber-gold pb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {img.title.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
