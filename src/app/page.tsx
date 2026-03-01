
import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Team from "@/components/sections/Team";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
import BookingSection from "@/components/sections/BookingSection";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-barber-black text-white selection:bg-barber-gold selection:text-black flex flex-col items-center overflow-x-hidden">
      <Navbar />
      <div className="w-full">
        <Hero />
        <About />
        <Services />
        <Team />
        <Gallery />
        <Testimonials />
        <BookingSection />
        <Footer />
      </div>
    </main>
  );
}