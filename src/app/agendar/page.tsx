import BookingSection from "@/components/sections/BookingSection";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Suspense } from "react";

export default function AgendarPage() {
    return (
        <main className="min-h-screen bg-barber-black text-white selection:bg-barber-gold selection:text-black flex flex-col items-center overflow-x-hidden pt-20">
            <Navbar isAppOrBooking={true} />
            <div className="w-full">
                <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-barber-gold animate-pulse">Carregando formulário...</div>}>
                    <BookingSection />
                </Suspense>
                <Footer />
            </div>
        </main>
    );
}
