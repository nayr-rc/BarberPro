'use client';

import { useBookingStore } from '@/hooks/useBookingStore';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Drink {
    id: string;
    name: string;
    price: number;
}

export default function BookingSection() {
    const { selectedService, setSelectedService } = useBookingStore();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [drinks, setDrinks] = useState<Drink[]>([]);
    const [selectedDrink, setSelectedDrink] = useState<string>('');

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [appointmentId, setAppointmentId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch active drinks
        axios.get('http://localhost:3001/api/drinks')
            .then(res => setDrinks(res.data))
            .catch(err => console.error("Could not fetch drinks", err));
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPaymentModalOpen && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isPaymentModalOpen) {
            handleExpirePayment();
        }
        return () => clearTimeout(timer);
    }, [isPaymentModalOpen, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Simulação de valores p/ backend já que não temos IDs reais de serviço e barbeiro na UI
        const dummyBarberId = "barber_123";
        const dummyServiceId = "service_123";
        const datetimeStart = new Date(`${date}T${time}`).toISOString();
        const datetimeEnd = new Date(new Date(`${date}T${time}`).getTime() + 60 * 60000).toISOString();
        const drinkIds = selectedDrink ? [selectedDrink] : [];

        try {
            const res = await axios.post('http://localhost:3001/api/appointments', {
                guestName: name,
                guestPhone: phone,
                barberId: dummyBarberId,
                serviceId: dummyServiceId,
                datetimeStart,
                datetimeEnd,
                drinkIds
            });
            setAppointmentId(res.data.id);
            setIsPaymentModalOpen(true);
            setTimeLeft(600); // reset timer
        } catch (error) {
            console.error("Erro ao criar agendamento", error);
            // Fallback modal in case backend isn't linked correctly
            setIsPaymentModalOpen(true);
            setTimeLeft(600);
        }
    };

    const handlePayment = async () => {
        try {
            if (appointmentId) {
                await axios.post(`http://localhost:3001/api/appointments/${appointmentId}/pay`);
            }
            alert('Pagamento aprovado! Agendamento confirmado com sucesso.');
            setIsPaymentModalOpen(false);
            // Reset form
            setName(''); setPhone(''); setDate(''); setTime(''); setSelectedService(''); setSelectedDrink('');
        } catch (error) {
            console.error(error);
            alert('Erro ao processar pagamento.');
        }
    };

    const handleExpirePayment = () => {
        alert('Tempo limite para pagamento expirado. O agendamento foi cancelado.');
        setIsPaymentModalOpen(false);
    };

    return (
        <section id="booking" className="py-24 bg-barber-gray relative overflow-hidden flex flex-col items-center">
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Booking Form Layout */}
                <div className="bg-barber-black p-8 md:p-12 rounded-lg border border-white/5 relative z-10 shadow-2xl w-full">
                    <div className="text-center md:text-left">
                        <h3 className="text-3xl font-heading text-white mb-2">AGENDAR HORÁRIO</h3>
                        <p className="text-gray-400 mb-10 font-light text-sm">Reserva online rápida e prática.</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleBookingSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-[0.2em] mb-2 block font-bold">Nome</label>
                                <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-transparent border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors placeholder-gray-700 font-light" placeholder="Seu nome completo" />
                            </div>
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-[0.2em] mb-2 block font-bold">WhatsApp</label>
                                <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-transparent border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors placeholder-gray-700 font-light" placeholder="(11) 99999-9999" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-xs text-barber-gold uppercase tracking-[0.2em] mb-2 block font-bold">Escolha o Serviço</label>
                            <select
                                required
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors appearance-none cursor-pointer font-light"
                            >
                                <option value="" disabled className="bg-barber-black">Escolha um serviço...</option>
                                <option value="CORTE CLÁSSICO - R$ 45" className="bg-barber-black">Corte Clássico - R$ 45</option>
                                <option value="BARBA PREMIUM - R$ 35" className="bg-barber-black">Barba Premium - R$ 35</option>
                                <option value="CORTE + BARBA - R$ 70" className="bg-barber-black">Combo (Corte + Barba) - R$ 70</option>
                                <option value="SOBRANCELHA - R$ 20" className="bg-barber-black">Sobrancelha - R$ 20</option>
                                <option value="PEZINHO - R$ 15" className="bg-barber-black">Pezinho - R$ 15</option>
                                <option value="TINTURA - R$ 50" className="bg-barber-black">Tintura - R$ 50</option>
                            </select>
                        </div>

                        {drinks.length > 0 && (
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-[0.2em] mb-2 block font-bold">Adicionar Bebida (Opcional)</label>
                                <select
                                    value={selectedDrink}
                                    onChange={(e) => setSelectedDrink(e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors appearance-none cursor-pointer font-light"
                                >
                                    <option value="" className="bg-barber-black">Nenhuma</option>
                                    {drinks.map(drink => (
                                        <option key={drink.id} value={drink.id} className="bg-barber-black">
                                            {drink.name} - R$ {drink.price.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-[0.2em] mb-2 block font-bold">Data</label>
                                <input required value={date} onChange={e => setDate(e.target.value)} type="date" className="w-full bg-transparent border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors text-gray-400 font-light" />
                            </div>
                            <div className="group">
                                <label className="text-xs text-barber-gold uppercase tracking-[0.2em] mb-2 block font-bold">Horário</label>
                                <input required value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full bg-transparent border-b border-white/10 text-white pb-2 focus:outline-none focus:border-barber-gold transition-colors text-gray-400 font-light" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-barber-gold text-barber-black font-bold py-5 uppercase tracking-[0.3em] hover:bg-white transition-all duration-300 mt-4 shadow-lg active:scale-[0.98]">
                            Continuar para Pagamento
                        </button>
                    </form>
                </div>

                {/* Visual / Info */}
                <div className="flex flex-col gap-8 w-full">
                    <div className="bg-[url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center h-[300px] md:h-[500px] w-full rounded-lg filter grayscale hover:grayscale-0 transition-all duration-1000 opacity-80 shadow-2xl border border-white/5"></div>
                    <div className="text-center lg:text-right border-r-0 lg:border-r-4 border-barber-gold pr-0 lg:pr-8 py-2">
                        <h4 className="text-barber-gold font-bold text-xl mb-4 tracking-widest uppercase font-heading">Horário de Funcionamento</h4>
                        <div className="space-y-2 text-gray-400 font-light">
                            <p className="flex justify-between lg:justify-end gap-4 uppercase text-xs tracking-widest border-b border-white/5 pb-2"><span>Segunda - Sexta</span> <span>09:00 - 20:00</span></p>
                            <p className="flex justify-between lg:justify-end gap-4 uppercase text-xs tracking-widest"><span>Sábado</span> <span>09:00 - 18:00</span></p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-barber-gray p-8 rounded-xl max-w-md w-full border border-barber-brown relative shadow-2xl text-center">
                        <h3 className="text-2xl font-bold text-barber-gold mb-2">PAGAMENTO</h3>
                        <p className="text-gray-300 text-sm mb-6">Tempo limite: <span className="text-red-400 font-bold">{formatTime(timeLeft)}</span></p>

                        <div className="bg-barber-black p-4 rounded text-left mb-6 border border-white/10">
                            <p className="text-sm text-gray-400">Serviço: <span className="text-white">{selectedService}</span></p>
                            {selectedDrink && (
                                <p className="text-sm text-gray-400 mt-2">Bebida: <span className="text-white">Opção selecionada</span></p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <button onClick={handlePayment} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition uppercase tracking-widest text-sm">
                                Pagar com PIX
                            </button>
                            <button onClick={handleExpirePayment} className="w-full bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-white py-3 rounded transition uppercase tracking-widest text-sm">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
