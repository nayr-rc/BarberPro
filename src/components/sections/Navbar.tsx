'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavbarProps {
    isAppOrBooking?: boolean;
}

export default function Navbar({ isAppOrBooking = false }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed left-0 w-full z-50 transition-all duration-500 ${scrolled || isAppOrBooking ? 'top-0 bg-barber-black/95 py-4 shadow-2xl border-b border-barber-gold/10' : 'top-0 bg-barber-black/80 backdrop-blur-sm py-6 border-b border-white/5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold font-heading text-barber-gold tracking-[0.2em]">
                    BARBER<span className="text-white">PRO</span>
                </Link>

                {!isAppOrBooking && (
                    <div className="hidden md:flex gap-10 items-center font-body text-[11px] font-bold tracking-[0.3em] text-gray-400">
                        <Link href="#features" className="hover:text-barber-gold transition-colors">RECURSOS</Link>
                        <Link href="#pricing" className="hover:text-barber-gold transition-colors">PREÇO</Link>
                        <Link href="#faq" className="hover:text-barber-gold transition-colors">DÚVIDAS</Link>
                    </div>
                )}

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/auth/login" className="text-barber-gold hover:text-white transition-colors text-xs font-bold tracking-widest uppercase">
                        Entrar
                    </Link>
                    {!isAppOrBooking && (
                        <Link href="#pricing" className="px-6 py-3 bg-barber-gold text-barber-black rounded hover:bg-white transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase">
                            Assinar Agora
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                {!isAppOrBooking && (
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                )}
            </div>

            {/* Mobile Menu */}
            {!isAppOrBooking && (
                <div className={`fixed inset-0 bg-barber-black z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                    <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-white">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <Link href="#features" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">RECURSOS</Link>
                    <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">PREÇO</Link>
                    <Link href="#faq" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">DÚVIDAS</Link>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-barber-gold">ENTRAR</Link>
                </div>
            )}
        </nav>
    );
}
