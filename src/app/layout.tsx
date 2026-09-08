import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Uliana Nails | Gel Expert & Professional Nail Training Kraków",
  description:
    "Преміальний манікюр, укріплення твердим гелем та авторські курси для майстрів у Кракові. Stylizacja paznokci, architektura żelu oraz profesjonalne szkolenia stacjonarne Kraków.",
  keywords: [
    "paznokcie Kraków",
    "kurs stylizacji paznokci Kraków",
    "manicure hybrydowy Kraków",
    "paznokcie żelowe Kraków",
    "манікюр Краків",
    "курси манікюру Краків",
    "нарощування нігтів Краків",
    "Uliana Nails",
  ],
  authors: [{ name: "Uliana Nails" }],
  openGraph: {
    title: "Uliana Nails | Gel Expert & Nail Training Kraków",
    description: "Ekskluzywna estetyka paznokci i profesjonalne szkolenia w Krakowie.",
    url: "https://ulinails.pl",
    siteName: "Uliana Nails",
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF8F5] text-[#2A2523]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
