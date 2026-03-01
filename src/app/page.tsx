import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-barber-black text-white selection:bg-barber-gold selection:text-black flex flex-col items-center overflow-x-hidden">
      <Navbar />
      <div className="w-full">
        <Hero />
        <Features />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}