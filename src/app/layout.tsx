import type { Metadata } from "next";
import { Poppins, Cinzel, Old_Standard_TT } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin"],
});

const oldStandard = Old_Standard_TT({
  variable: "--font-old-standard",
  weight: ["400", "700"],
  subsets: ["latin"],
})


export const metadata: Metadata = {
  title: "BarberPro - Agendamento de Horários",
  description: "Plataforma de agendamento para barbearia. Marque seus horários com facilidade.",
  keywords: ["barbearia", "agendamento", "barbershop", "corte", "barba"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${cinzel.variable} ${oldStandard.variable}`}>
      <body className="antialiased bg-barber-black font-sans scroll-smooth" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
