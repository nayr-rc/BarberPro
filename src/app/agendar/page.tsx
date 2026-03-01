import BookingSection from "@/components/sections/BookingSection";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

export default function AgendarPage() {
    return (
        <main className="min-h-screen bg-barber-black text-white selection:bg-barber-gold selection:text-black flex flex-col items-center overflow-x-hidden pt-20">
            <Navbar isAppOrBooking={true} />
            <div className="w-full">
                <BookingSection />
                <Footer />
            </div>
        </main>
    );
}
