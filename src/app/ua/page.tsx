import type { Metadata } from "next";
import HomePage from "../page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Uliana Nails | Експерт манікюру та навчання у Кракові",
  description:
    "Преміальний манікюр, укріплення твердим гелем та авторські курси для майстрів у Кракові. Ідеальний зріз та правильна архітектура нігтів.",
  alternates: {
    canonical: "https://ulinails.pl/ua",
    languages: {
      "uk-UA": "https://ulinails.pl/ua",
      "pl-PL": "https://ulinails.pl/pl",
      "x-default": "https://ulinails.pl/",
    },
  },
};

export default async function UaPage() {
  return <HomePage />;
}
