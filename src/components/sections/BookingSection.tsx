
'use client';

export default function BookingSection() {
    return (
        <section id="booking" className="py-24 bg-barber-gray relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* Booking Form Layout */}
                <div className="bg-barber-black p-10 rounded-lg border border-white/5 relative z-10 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-display text-8xl text-barber-gold pointer-events-none">
                        06
                    </div>
                    <h3 className="text-3xl font-heading text-white mb-2">AGENDAR HORÁRIO</h3>
                    <p className="text-gray-400 mb-8 font-light text-sm">Preencha o formulário abaixo para reservar com seu barbeiro favorito.</p>

                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-widest mb-2 block group-focus-within:text-white transition-colors">Nome</label>
                                <input type="text" className="w-full bg-barber-gray border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors placeholder-gray-600" placeholder="Seu nome" />
                            </div>
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-widest mb-2 block group-focus-within:text-white transition-colors">Telefone</label>
                                <input type="tel" className="w-full bg-barber-gray border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors placeholder-gray-600" placeholder="(11) 99999-9999" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-xs text-barber-gold uppercase tracking-widest mb-2 block group-focus-within:text-white transition-colors">Serviço</label>
                            <select className="w-full bg-barber-gray border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors appearance-none cursor-pointer">
                                <option>Corte Clássico - R$ 45</option>
                                <option>Barba Premium - R$ 35</option>
                                <option>Combo (Corte + Barba) - R$ 70</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-widest mb-2 block group-focus-within:text-white transition-colors">Data</label>
                                <input type="date" className="w-full bg-barber-gray border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors text-gray-400" />
                            </div>
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-widest mb-2 block group-focus-within:text-white transition-colors">Horário</label>
                                <input type="time" className="w-full bg-barber-gray border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors text-gray-400" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-barber-gold text-barber-black font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors mt-4">
                            Confirmar Agendamento
                        </button>
                    </form>
                </div>

                {/* Visual / Info */}
                <div className="relative">
                    <div className="bg-[url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center h-[500px] w-full rounded-lg filter grayscale hover:grayscale-0 transition-all duration-700 opacity-80 mb-6"></div>
                    <div className="text-right">
                        <h4 className="text-barber-gold font-bold text-lg mb-2">HORÁRIO DE FUNCIONAMENTO</h4>
                        <p className="text-gray-400 font-light">Segunda - Sexta: 09:00 - 20:00</p>
                        <p className="text-gray-400 font-light">Sábado: 09:00 - 18:00</p>
                    </div>
                </div>

            </div>
        </section>
    );
}
