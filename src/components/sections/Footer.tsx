
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-barber-black border-t border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="text-2xl font-bold font-heading text-barber-gold mb-6 block">
                            BARBER<span className="text-white">PRO</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Tradição e modernidade se encontram aqui. Oferecemos o melhor serviço de barbearia da cidade.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Contato</h4>
                        <div className="space-y-4 text-gray-400 text-sm">
                            <p className="hover:text-barber-gold transition-colors">
                                (11) 99999-9999
                            </p>
                            <p className="hover:text-barber-gold transition-colors">
                                contato@barberpro.com
                            </p>
                            <p className="hover:text-barber-gold transition-colors">
                                Rua das Flores, 123<br />Centro, São Paulo
                            </p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Links Rápidos</h4>
                        <div className="flex flex-col space-y-2 text-gray-400 text-sm">
                            <Link href="#about" className="hover:text-barber-gold transition-colors">Sobre Nós</Link>
                            <Link href="#services" className="hover:text-barber-gold transition-colors">Serviços</Link>
                            <Link href="#team" className="hover:text-barber-gold transition-colors">Equipe</Link>
                            <Link href="/auth/register" className="hover:text-barber-gold transition-colors">Agendar</Link>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Siga-nos</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-barber-gold hover:border-barber-gold transition-all">
                                FB
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-barber-gold hover:border-barber-gold transition-all">
                                IG
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-barber-gold hover:border-barber-gold transition-all">
                                TW
                            </a>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-white/5 text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} BARBERPRO. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}
