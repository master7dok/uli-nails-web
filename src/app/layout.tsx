import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import CookieConsent from "@/components/CookieConsent";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ulinails.pl"),
  alternates: {
    canonical: "https://ulinails.pl",
    languages: {
      "pl-PL": "https://ulinails.pl",
      "uk-UA": "https://ulinails.pl",
      "x-default": "https://ulinails.pl",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <LanguageProvider>
          {children}
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
