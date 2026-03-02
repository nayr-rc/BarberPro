import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-barber-black text-white selection:bg-barber-gold selection:text-black">
      <Navbar />
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <Hero />
        <Features />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
