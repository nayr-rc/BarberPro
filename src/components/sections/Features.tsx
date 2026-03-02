import { Calendar, Share2, Smartphone, Box, Users, HeadphonesIcon, TrendingUp, Cpu } from 'lucide-react';

export default function Features() {
    return (
        <section id="features" className="w-full py-64 lg:py-80 bg-barber-black relative overflow-hidden flex flex-col items-center">
            <div className="w-full max-w-7xl mx-auto px-6 flex flex-col items-center">

                {/* Header Section */}
                <div className="text-center mb-32 w-full">
                    <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 font-heading tracking-tight leading-tight">
                        Todas as ferramentas para o seu negócio<br className="hidden md:block" />na palma da sua mão
                    </h2>
                    <div className="w-32 h-1.5 bg-barber-gold mx-auto rounded-full"></div>
                </div>

                {/* Main 3 App Views - First Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 mb-32 text-center">
                    <div className="w-full bg-white/[0.03] border border-white/10 p-10 rounded-3xl flex flex-col items-center text-center hover:bg-white/[0.07] transition-all hover:-translate-y-2 duration-300 shadow-2xl">
                        <div className="p-4 bg-barber-gold/10 rounded-2xl mb-8">
                            <Calendar className="w-12 h-12 text-barber-gold" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">Acompanhe seus agendamentos</h3>
                        <p className="text-gray-400 font-light text-base leading-relaxed">Visualize sua agenda completa do dia, semana e mês. Cancele, remarque e confirme tudo pelo celular com 1 clique.</p>
                    </div>

                    <div className="w-full bg-white/[0.03] border border-white/10 p-10 rounded-3xl flex flex-col items-center text-center hover:bg-white/[0.07] transition-all hover:-translate-y-2 duration-300 shadow-2xl">
                        <div className="p-4 bg-barber-gold/10 rounded-2xl mb-8">
                            <Smartphone className="w-12 h-12 text-barber-gold" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">Personalize seu link</h3>
                        <p className="text-gray-400 font-light text-base leading-relaxed">Um site completo para a sua barbearia. Receba agendamentos online sem precisar atender ao telefone ou WhatsApp 24h.</p>
                    </div>

                    <div className="w-full bg-white/[0.03] border border-white/10 p-10 rounded-3xl flex flex-col items-center text-center hover:bg-white/[0.07] transition-all hover:-translate-y-2 duration-300 shadow-2xl">
                        <div className="p-4 bg-barber-gold/10 rounded-2xl mb-8">
                            <Share2 className="w-12 h-12 text-barber-gold" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">Integre com as redes sociais</h3>
                        <p className="text-gray-400 font-light text-base leading-relaxed">Coloque seu link na bio do Instagram e deixe a plataforma vender por você. Mande links no WhatsApp com facilidade.</p>
                    </div>
                </div>

                {/* Impact Divider Text */}
                <div className="text-center mb-36 w-full max-w-4xl mx-auto px-4 py-16 border-y border-white/5 bg-white/[0.01]">
                    <p className="text-gray-300 text-xl md:text-2xl font-light leading-relaxed italic">
                        "Deixe para trás a luta constante contra o tempo e descubra a revolução na sua rotina de trabalho com <span className="text-barber-gold font-bold">BarberPro</span>. Experimente a automatização que vai impulsionar a sua barbearia."
                    </p>
                </div>

                {/* Grid 6 Detailed Features */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="w-full flex flex-col items-center text-center p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-barber-gold/30 transition-all shadow-xl group">
                        <div className="w-16 h-16 rounded-2xl bg-barber-gold/10 flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform">
                            <Smartphone className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-4">Agendamento online</h4>
                        <p className="text-gray-400 text-base font-light leading-relaxed">Permita que seus clientes agendem serviços de forma simples e rápida a qualquer hora.</p>
                    </div>

                    <div className="w-full flex flex-col items-center text-center p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-barber-gold/30 transition-all shadow-xl group">
                        <div className="w-16 h-16 rounded-2xl bg-barber-gold/10 flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform">
                            <Box className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-4">Controle de estoque</h4>
                        <p className="text-gray-400 text-base font-light leading-relaxed">Mantenha o controle de produtos e bebidas. Registre entradas e saídas no dia a dia.</p>
                    </div>

                    <div className="w-full flex flex-col items-center text-center p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-barber-gold/30 transition-all shadow-xl group">
                        <div className="w-16 h-16 rounded-2xl bg-barber-gold/10 flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-4">Gestão de equipe</h4>
                        <p className="text-gray-400 text-base font-light leading-relaxed">Organize horários e acompanhe o desempenho com comissões automáticas.</p>
                    </div>

                    <div className="w-full flex flex-col items-center text-center p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-barber-gold/30 transition-all shadow-xl group">
                        <div className="w-16 h-16 rounded-2xl bg-barber-gold/10 flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform">
                            <HeadphonesIcon className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-4">Suporte humanizado</h4>
                        <p className="text-gray-400 text-base font-light leading-relaxed">Conte com um time pronto para te atender de forma rápida e focada em resultados.</p>
                    </div>

                    <div className="w-full flex flex-col items-center text-center p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-barber-gold/30 transition-all shadow-xl group">
                        <div className="w-16 h-16 rounded-2xl bg-barber-gold/10 flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-4">Controle financeiro</h4>
                        <p className="text-gray-400 text-base font-light leading-relaxed">Visibilidade completa de recebimentos diários para uma saúde impecável do negócio.</p>
                    </div>

                    <div className="w-full flex flex-col items-center text-center p-10 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-barber-gold/30 transition-all shadow-xl group">
                        <div className="w-16 h-16 rounded-2xl bg-barber-gold/10 flex items-center justify-center text-barber-gold mb-6 group-hover:scale-110 transition-transform">
                            <Cpu className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-4">Automação</h4>
                        <p className="text-gray-400 text-base font-light leading-relaxed">Lembretes automáticos para os clientes evitarem faltas e buracos na agenda.</p>
                    </div>
                </div>

            </div>
        </section>
    );
}
