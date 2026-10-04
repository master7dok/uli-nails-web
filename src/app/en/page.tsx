import type { Metadata } from "next";
import HomePage from "../page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uliana Nails | Gel Expert & Professional Nail Training Kraków",
  description:
    "Premium gel manicure, thin hard gel architecture, and certified offline courses for nail stylists in Kraków. Zero lifting and anatomical safety.",
  alternates: {
    canonical: "https://ulinails.pl/en",
    languages: {
      "uk-UA": "https://ulinails.pl/ua",
      "pl-PL": "https://ulinails.pl/pl",
      "en-US": "https://ulinails.pl/en",
      "x-default": "https://ulinails.pl/",
    },
  },
};

export default async function EnPage() {
  return <HomePage />;
}
