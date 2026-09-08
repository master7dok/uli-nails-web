"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Send, Flame } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface ServiceItem {
  id: string;
  category: string;
  titlePl: string;
  titleUa: string;
  descriptionPl?: string | null;
  descriptionUa?: string | null;
  pricePln: number;
  durationMin?: number | null;
  isPopular: boolean;
  sortOrder: number;
}

interface PriceListProps {
  services: ServiceItem[];
}

export default function PriceList({ services }: PriceListProps) {
  const { language, t, getLocalized } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("all");

  const categories = [
    { id: "all", label: t.prices.categoryAll },
    { id: "manicure", label: t.prices.categoryManicure },
    { id: "gel", label: t.prices.categoryGel },
    { id: "extension", label: t.prices.categoryExtension },
    { id: "care", label: t.prices.categoryCare },
  ];

  const filteredServices =
    activeTab === "all"
      ? services
      : services.filter(
          (s) =>
            s.category === activeTab ||
            (activeTab === "care" && (s.category === "care" || s.category === "additional"))
        );

  return (
    <section id="prices" className="py-24 bg-[#F5F2EB]/50 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-100 border border-blush-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {t.prices.badge}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {t.prices.title}
          </h2>
          <p className="text-base text-charcoal-600 leading-relaxed">
            {t.prices.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === cat.id
                  ? "bg-charcoal-900 text-white shadow-soft"
                  : "bg-white/80 hover:bg-white text-charcoal-600 border border-nude-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Instagram Price List Card */}
        <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-card border border-nude-200/90 relative">
          {/* Subtle top Instagram-like header label */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-nude-200 text-xs font-semibold uppercase tracking-widest text-charcoal-500">
            <span>Usługa / Послуга</span>
            <div className="flex items-center gap-8">
              <span className="hidden sm:inline">Czas / Час</span>
              <span>Cena / Ціна</span>
            </div>
          </div>

          <div className="divide-y divide-nude-100">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => {
                const title = getLocalized(service, "title");
                const description = getLocalized(service, "description");

                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Title & Description */}
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-lg sm:text-xl font-normal text-charcoal-900 group-hover:text-gold-700 transition-colors">
                          {title}
                        </h4>
                        {service.isPopular && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blush-100 text-gold-700 border border-blush-200">
                            <Flame className="w-3 h-3 text-pink-600" />
                            {t.prices.popularBadge}
                          </span>
                        )}
                      </div>
                      {description && (
                        <p className="text-xs sm:text-[13px] text-charcoal-500 mt-1 leading-relaxed max-w-xl">
                          {description}
                        </p>
                      )}
                    </div>

                    {/* Duration & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 shrink-0">
                      {service.durationMin && (
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {service.durationMin} {t.prices.minutes}
                          </span>
                        </div>
                      )}

                      <div className="text-right">
                        <span className="font-serif text-2xl font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                          {service.pricePln}
                        </span>{" "}
                        <span className="text-xs font-semibold text-charcoal-500 uppercase">
                          {t.prices.currency}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Quick Booking Bar */}
          <div className="mt-10 pt-6 border-t border-nude-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 bg-nude-50/70 p-5 rounded-2xl">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-charcoal-800">
                {language === "pl"
                  ? "Chcesz zarezerwować termin na stylizację?"
                  : "Бажаєте записатися на послугу?"}
              </p>
              <p className="text-xs text-charcoal-500">
                {language === "pl"
                  ? "Napisz bezpośrednio na Telegram lub Instagram"
                  : "Напишіть напряму в Telegram або Instagram Direct"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://t.me/uliana_p_u"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.prices.bookViaTelegram}</span>
              </a>

              <a
                href="https://instagram.com/uli.nails.krk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-charcoal-800 bg-white hover:bg-nude-100 border border-nude-300 transition-colors shadow-xs"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                <span>{t.prices.bookViaInstagram}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
