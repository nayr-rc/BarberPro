
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

                    {/* Support */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Suporte</h4>
                        <div className="space-y-4 text-gray-400 text-sm">
                            <p className="font-light italic mb-4">Dúvidas ou problemas? Fale diretamente conosco.</p>
                            <a
                                href="https://wa.me/5571999034067"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-300 font-bold"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.481 8.403 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.51-5.742-1.47l-6.251 1.637zm6.756-3.715c1.558.924 3.012 1.385 4.526 1.385 5.517 0 10.007-4.49 10.007-10.007 0-5.516-4.49-10.007-10.007-10.007-5.517 0-10.007 4.491-10.007 10.007 0 1.954.568 3.456 1.649 5.328l-.946 3.453 3.535-.924zm10.169-7.464c-.114-.19-.418-.304-.875-.532-.456-.228-2.698-1.332-3.116-1.484-.418-.152-.722-.228-.102-.304.304-.114.875-.684 1.065-.875.19-.19.342-.418.342-.684s-.114-.494-.228-.684c-.114-.19-.418-.494-.875-.722s-.342-.532-.76-.532h-.19c-.418 0-.989.152-1.484.684-.494.532-1.824 1.786-1.824 4.37s1.862 5.054 2.128 5.434c.266.38 3.686 5.624 8.93 7.828 1.248.528 2.217.848 2.972 1.088 1.254.396 2.392.342 3.292.208.972-.144 2.698-1.102 3.078-2.128.38-1.026.38-1.938.266-2.128z" /></svg>
                                WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">Links Rápidos</h4>
                        <div className="flex flex-col space-y-2 text-gray-400 text-sm">
                            <Link href="#features" className="hover:text-barber-gold transition-colors">Recursos</Link>
                            <Link href="#pricing" className="hover:text-barber-gold transition-colors">Preço</Link>
                            <Link href="#faq" className="hover:text-barber-gold transition-colors">Dúvidas</Link>
                        </div>
                    </div>

                    {/* Business */}
                    <div className="md:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-sm tracking-widest uppercase">BarberPro</h4>
                        <div className="flex flex-col space-y-2 text-gray-400 text-sm">
                            <Link href="/auth/login" className="hover:text-barber-gold transition-colors">Acessar Painel</Link>
                            <Link href="/auth/register" className="hover:text-barber-gold transition-colors">Criar Conta</Link>
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
