
import Image from 'next/image';

export default function Team() {
    const team = [
        { name: "Leon Michwell", role: "Master Barber", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leon&backgroundColor=b6e3f4" },
        { name: "Carlos Silva", role: "Fade Specialist", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=c0aede" },
        { name: "Ana Souza", role: "Stylist", img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=ffdfbf" },
    ];

    return (
        <section id="team" className="py-24 bg-barber-dark">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-barber-gold font-display text-xl mb-2">03</span>
                    <h2 className="text-4xl md:text-5xl font-heading text-white mb-6">NOSSA EQUIPE</h2>
                    <p className="text-gray-400 max-w-2xl font-light">
                        Profissionais dedicados a transformar seu visual. Conheça quem faz a mágica acontecer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <div key={index} className="group relative overflow-hidden bg-barber-black rounded-lg transform hover:-translate-y-2 transition-transform duration-300 shadow-xl">
                            <div className="aspect-[3/4] relative bg-barber-gray flex items-end justify-center overflow-hidden">
                                {/* Image Placeholder - In production, replace with actual photos */}
                                <div className="absolute inset-0 bg-gradient-to-t from-barber-black via-transparent to-transparent opacity-80 z-10"></div>

                                {/* Use a Next.js Image or simple img if external */}
                                <img
                                    src={member.img}
                                    alt={member.name}
                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                                />

                                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-barber-gold transition-colors">{member.name}</h3>
                                    <p className="text-sm text-gray-400 uppercase tracking-widest">{member.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
