import type { Metadata } from "next";
import "./globals.css";
import { Inter, Cinzel, Poppins } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"]
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"]
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "BarberPro - Gestão de Barbearias",
  description: "Sistema completo para barbearias",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable} ${poppins.variable} bg-black text-white antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
