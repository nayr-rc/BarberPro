import Link from "next/link";

export default function Home() {
  const services = [
    { name: "Corte Clássico", price: "$45", icon: "✂️" },
    { name: "Barba Premium", price: "$35", icon: "🧔" },
    { name: "Corte + Barba", price: "$70", icon: "💈" },
    { name: "Tingimento", price: "$60", icon: "🎨" },
    { name: "Barba Quente", price: "$40", icon: "🔥" },
    { name: "Limpeza Facial", price: "$50", icon: "✨" },
  ];

  const barbers = [
    { name: "Leon Michwell", instagram: "@leonbarber", certs: ["2025 Melhor Barbeiro", "2024 Cortes Profissionais"] },
    { name: "Carlos Silva", instagram: "@carlosbarber", certs: ["2025 Melhor Barba", "2024 Top Rated"] },
  ];

  const testimonials = [
    { name: "John Moore", rating: 5, text: "Melhor experiência em corte que já tive. Profissionais incríveis!" },
    { name: "Robbie Jones", rating: 5, text: "Atendimento excepcional e resultado perfeito. Voltarei com certeza!" },
  ];

  return (
    <div className="min-h-screen bg-barber-black text-barber-beige">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-barber-dark to-barber-black/80 border-b border-barber-accent/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✂️</span>
            <h1 className="text-xl font-black text-barber-accent">Barber</h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#home" className="hover:text-barber-accent transition">HOME</a>
            <a href="#services" className="hover:text-barber-accent transition">SERVICES</a>
            <a href="#barbers" className="hover:text-barber-accent transition">BARBERS</a>
            <a href="#booking" className="hover:text-barber-accent transition">BOOKING</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm hover:text-barber-accent transition">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-barber-accent text-barber-black px-4 py-2 rounded text-sm font-bold hover:bg-barber-brown-light transition">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-0 w-96 h-96 bg-barber-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-6xl md:text-7xl font-black leading-tight mb-8">
                RAISE YOUR <span className="text-barber-accent">LEVEL</span> INSTANTLY
              </h2>
              <p className="text-barber-beige/70 text-lg mb-8 leading-relaxed">
                Experimente o melhor em cortes, barbas e cuidados pessoais. Nossos barbeiros profissionais estão prontos para elevar seu estilo.
              </p>
              <Link href="/auth/register" className="inline-block border-2 border-barber-accent text-barber-accent px-8 py-3 font-bold hover:bg-barber-accent hover:text-barber-black transition transform hover:scale-105">
                BOOK NOW
              </Link>
            </div>
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-barber-accent/20 to-transparent rounded-2xl border border-barber-accent/30"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-barber-dark via-transparent to-transparent rounded-2xl flex items-end justify-center pb-8">
                <span className="text-7xl">💈</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-b from-barber-black to-barber-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-barber-accent text-sm font-bold mb-2">PROFESSIONAL SERVICES</p>
            <h3 className="text-5xl font-black text-barber-beige mb-4">OUR SERVICES</h3>
            <p className="text-barber-beige/70 text-lg">Desfrute de uma variedade de nossos melhores serviços que farão você se sentir melhor.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="group bg-barber-dark/50 border border-barber-brown/30 p-8 rounded-xl hover:border-barber-accent transition-all hover:shadow-lg hover:shadow-barber-accent/20">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h4 className="text-barber-beige font-bold text-lg mb-2 uppercase">{service.name}</h4>
                <p className="text-barber-accent font-bold text-xl">{service.price}</p>
                <p className="text-barber-beige/60 text-sm mt-3">Disponível para todos os clientes</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section id="barbers" className="py-24 bg-barber-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 bg-gradient-to-br from-barber-accent/10 to-transparent rounded-2xl border border-barber-accent/20 flex items-end justify-center pb-8">
              <span className="text-6xl">👨‍💼</span>
            </div>
            <div>
              <p className="text-barber-accent text-sm font-bold mb-2">MEET OUR TEAM</p>
              <h3 className="text-5xl font-black text-barber-beige mb-6">OUR BARBERS</h3>
              <p className="text-barber-beige/70 text-lg mb-8 leading-relaxed">
                Conheça os profissionais experientes que irão transformar seu visual. Cada barbeiro em nossa equipe é altamente treinado e dedicado em proporcionar a melhor experiência.
              </p>
              {barbers[0] && (
                <div className="bg-barber-dark/50 border border-barber-brown/30 p-6 rounded-xl">
                  <h4 className="text-barber-beige font-bold text-lg mb-2">{barbers[0].name}</h4>
                  <p className="text-barber-accent text-sm mb-4">{barbers[0].instagram}</p>
                  <p className="text-barber-beige/70 text-sm">Certificações & Prêmios:</p>
                  <ul className="text-barber-accent text-sm mt-2 space-y-1">
                    {barbers[0].certs.map((cert, i) => (
                      <li key={i}>✓ {cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-barber-black to-barber-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h3 className="text-5xl font-black text-barber-beige mb-4">WHAT OUR CUSTOMERS SAY</h3>
            <p className="text-barber-beige/70 text-lg">O que nossos clientes pensam sobre nós</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-barber-dark/50 border border-barber-brown/30 p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-barber-accent rounded-full flex items-center justify-center text-barber-black font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-barber-beige font-bold">{testimonial.name.toUpperCase()}</h4>
                    <p className="text-barber-accent text-sm">{'⭐'.repeat(testimonial.rating)}</p>
                  </div>
                </div>
                <p className="text-barber-beige/70 leading-relaxed">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-24 bg-barber-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 bg-gradient-to-br from-barber-accent/20 to-transparent rounded-2xl border border-barber-accent/30 flex items-end justify-center pb-8">
              <span className="text-6xl">🪑</span>
            </div>
            <div>
              <h3 className="text-5xl font-black text-barber-beige mb-4">BOOK A SEAT</h3>
              <p className="text-barber-beige/70 text-lg mb-8">Preencha o formulário e reserve seu lugar. Nossa equipe confirmará seu agendamento.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-barber-beige/70 text-sm mb-2">Select Date</label>
                  <input type="date" className="w-full bg-barber-dark border border-barber-brown/30 text-barber-beige px-4 py-3 rounded" />
                </div>
                <div>
                  <label className="block text-barber-beige/70 text-sm mb-2">Select Time</label>
                  <input type="time" className="w-full bg-barber-dark border border-barber-brown/30 text-barber-beige px-4 py-3 rounded" />
                </div>
                <div>
                  <label className="block text-barber-beige/70 text-sm mb-2">Select Service</label>
                  <select className="w-full bg-barber-dark border border-barber-brown/30 text-barber-beige px-4 py-3 rounded">
                    <option>Choose a service</option>
                    {services.map((s, i) => (
                      <option key={i}>{s.name} - {s.price}</option>
                    ))}
                  </select>
                </div>
                <Link href="/auth/register" className="inline-block w-full bg-barber-accent text-barber-black font-bold px-6 py-3 rounded text-center hover:bg-barber-brown-light transition">
                  BOOK NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-barber-dark to-barber-black border-t border-barber-brown/30 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-barber-accent font-bold mb-4">OPEN</h4>
              <p className="text-barber-beige/70 text-sm">MONDAY - FRIDAY</p>
              <p className="text-barber-beige/70 text-sm">9AM - 9PM</p>
              <p className="text-barber-beige/70 text-sm mt-4">SATURDAY & SUNDAY</p>
              <p className="text-barber-beige/70 text-sm">10AM - 8PM</p>
            </div>
            <div>
              <h4 className="text-barber-accent font-bold mb-4">OUR BRANCHES</h4>
              <p className="text-barber-beige/70 text-sm mb-3">📍 Centro - Rua Principal, 123</p>
              <p className="text-barber-beige/70 text-sm mb-3">📍 Zona Sul - Av. Paulista, 456</p>
              <p className="text-barber-beige/70 text-sm">📍 Zona Leste - Rua Secundária, 789</p>
            </div>
            <div>
              <h4 className="text-barber-accent font-bold mb-4">CONTACT</h4>
              <p className="text-barber-beige/70 text-sm mb-2">📞 (11) 3000-0000</p>
              <p className="text-barber-beige/70 text-sm mb-2">📧 contato@barberpro.com.br</p>
            </div>
            <div>
              <h4 className="text-barber-accent font-bold mb-4">FOLLOW US</h4>
              <div className="flex gap-4">
                <a href="#" className="text-barber-accent hover:text-barber-brown-light transition">📘 Facebook</a>
                <a href="#" className="text-barber-accent hover:text-barber-brown-light transition">𝕏 Twitter</a>
                <a href="#" className="text-barber-accent hover:text-barber-brown-light transition">📷 Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-barber-brown/30 pt-8 text-center">
            <p className="text-barber-beige/60 text-sm">Copyright © 2026 BarberPro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
