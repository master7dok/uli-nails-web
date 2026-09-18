import type { Metadata } from "next";
import HomePage from "../page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uliana Nails | Ekspert stylizacji paznokci & Szkolenia Kraków",
  description:
    "Ekskluzywny manicure, architektura żelu oraz profesjonalne szkolenia stacjonarne dla stylistek w Krakowie. Cienkie krawędzie i sterylność.",
  alternates: {
    canonical: "https://ulinails.pl/pl",
    languages: {
      "uk-UA": "https://ulinails.pl/ua",
      "pl-PL": "https://ulinails.pl/pl",
      "x-default": "https://ulinails.pl/",
    },
  },
};

export default async function PlPage() {
  return <HomePage />;
}
