
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
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
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-barber-black/95 py-4 shadow-2xl border-b border-barber-gold/10' : 'bg-transparent py-8'}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold font-heading text-barber-gold tracking-[0.2em]">
                    BARBER<span className="text-white">PRO</span>
                </Link>

                <div className="hidden md:flex gap-10 items-center font-body text-[11px] font-bold tracking-[0.3em] text-gray-400">
                    <Link href="#about" className="hover:text-barber-gold transition-colors">SOBRE</Link>
                    <Link href="#services" className="hover:text-barber-gold transition-colors">SERVIÇOS</Link>
                    <Link href="#team" className="hover:text-barber-gold transition-colors">EQUIPE</Link>
                    <Link href="#gallery" className="hover:text-barber-gold transition-colors">TRABALHOS</Link>
                    <Link href="#booking" className="hover:text-barber-gold transition-colors">RESERVA</Link>
                </div>

                <div className="hidden md:block">
                    <Link href="#booking" className="px-8 py-3 bg-barber-gold text-barber-black hover:bg-white transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase">
                        BOOK NOW
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white focus:outline-none">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-barber-black z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-white">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <Link href="#about" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">SOBRE</Link>
                <Link href="#services" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">SERVIÇOS</Link>
                <Link href="#team" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">EQUIPE</Link>
                <Link href="#gallery" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-white hover:text-barber-gold">TRABALHOS</Link>
                <Link href="#booking" onClick={() => setIsOpen(false)} className="text-2xl font-heading text-barber-gold">RESERVA</Link>
            </div>
        </nav>
    );
}
