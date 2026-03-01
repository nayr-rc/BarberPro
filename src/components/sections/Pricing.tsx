export default function Pricing() {
    return (
        <section id="pricing" className="w-full py-48 lg:py-64 bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-barber-gold/50 to-transparent"></div>

            <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center">

                <div className="text-center mb-32 w-full">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 font-heading uppercase tracking-tighter">
                        Preço Simples e Transparente
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-xl font-light leading-relaxed">
                        Invista no crescimento do seu salão sem taxas ocultas. <br className="hidden sm:block" /> E o melhor, os primeiros 7 dias são totalmente grátis.
                    </p>
                </div>

                <div className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#1a1a1a] to-[#050505] rounded-[2.5rem] border border-barber-gold/30 p-12 lg:p-16 shadow-2xl relative transition-transform hover:scale-[1.02] duration-500">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-barber-gold text-barber-black font-bold uppercase tracking-widest text-sm px-8 py-3 rounded-full shadow-2xl whitespace-nowrap z-10">
                        Plano Anual
                    </div>

                    <div className="text-center mb-12">
                        <h3 className="text-3xl text-white font-bold mb-6">BarberPro Premium</h3>
                        <div className="flex justify-center items-end gap-2 mb-4">
                            <span className="text-2xl text-gray-500 font-bold mb-2">R$</span>
                            <span className="text-8xl font-black text-barber-gold font-heading leading-none">32</span>
                            <span className="text-gray-500 font-bold mb-2 text-xl">/mês</span>
                        </div>
                        <p className="text-base text-gray-500 font-light">Cobre até 5 barbeiros no mesmo painel.</p>
                    </div>

                    <div className="h-px w-full bg-white/5 mb-10"></div>

                    <ul className="space-y-6 mb-12">
                        {[
                            'Agendamentos 100% ilimitados',
                            'Até 5 colaboradores inclusos',
                            'Dashboard de Receita e Lucro',
                            'Gestão de Produtos e Consumo',
                            'Link Personalizado (SeuSite.com)',
                            'Suporte WhatsApp Prioritário'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-gray-200">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-barber-gold/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-barber-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-lg font-light tracking-wide">{item}</span>
                            </li>
                        ))}
                    </ul>

                    <button className="w-full bg-barber-gold text-barber-black font-black text-xl uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-white hover:text-black transition-all duration-500 shadow-[0_20px_50px_rgba(175,132,71,0.2)] active:scale-95">
                        Começar Teste Grátis
                    </button>

                    <p className="text-center text-sm text-gray-500 mt-8 font-light italic">
                        Cancele a qualquer momento. Suporte 24/7.
                    </p>
                </div>

            </div>
        </section>
    );
}
