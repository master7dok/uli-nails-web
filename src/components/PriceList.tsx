"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Send, Flame, ChevronRight, Gem } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { getSettingText, getInstagramLink } from "@/lib/settingsHelper";

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
  settings?: Record<string, string>;
}

export default function PriceList({ services, settings }: PriceListProps) {
  const { language, t, getLocalized } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("all");
  const instagram = getInstagramLink(language, settings);

  const categories = [
    { id: "all", label: t.prices.categoryAll },
    { id: "manicure", label: t.prices.categoryManicure },
    { id: "pedicure", label: t.prices.categoryPedicure },
    { id: "additional", label: t.prices.categoryAdditional },
  ];

  const filteredServices =
    activeTab === "all"
      ? services
      : services.filter((s) => {
          if (activeTab === "manicure") {
            return s.category === "manicure" || s.category === "gel" || s.category === "extension";
          }
          if (activeTab === "pedicure") {
            return s.category === "pedicure";
          }
          if (activeTab === "additional") {
            return s.category === "additional" || s.category === "care";
          }
          return s.category === activeTab;
        });

  return (
    <section id="prices" className="py-24 bg-[#F5F2EB]/50 relative overflow-hidden">
      {/* Decorative ambient blurred spots for depth */}
      <div className="absolute top-1/4 left-[-10%] w-96 h-96 rounded-full bg-blush-100/40 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-[-10%] w-[420px] h-[420px] rounded-full bg-nude-200/40 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with scroll reveal */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-100 border border-blush-200 mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {t.prices.badge}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {getSettingText(settings, "text_prices_title", language, t.prices.title)}
          </h2>
          <p className="text-base text-charcoal-600 leading-relaxed">
            {getSettingText(settings, "text_prices_subtitle", language, t.prices.subtitle)}
          </p>
        </motion.div>

        {/* Category Tabs with Animated Pill indicator */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none"
        >
          {categories.map((cat) => {
            const isActive = activeTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`relative px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-charcoal-600 hover:text-charcoal-900 bg-white/80 hover:bg-white border border-nude-200/90 shadow-xs"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePriceCategoryPill"
                    className="absolute inset-0 bg-charcoal-900 rounded-full shadow-soft"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Main Price List Card with interactive scroll reveal */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-white/95 backdrop-blur-sm p-5 sm:p-9 shadow-card border border-nude-200/90 relative"
        >
          {/* Top header labels */}
          <div className="flex items-center justify-between pb-5 mb-3 border-b border-nude-200 text-[11px] font-semibold uppercase tracking-widest text-charcoal-400 px-2 sm:px-4">
            <span>Usługa / Послуга</span>
            <div className="flex items-center gap-8">
              <span className="hidden sm:inline">Czas / Час</span>
              <span>Cena / Ціна</span>
            </div>
          </div>

          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => {
                const title = getLocalized(service, "title");
                const description = getLocalized(service, "description");
                const uniqueKey =
                  service.id && String(service.id).trim() !== ""
                    ? String(service.id)
                    : `service-${service.category || "item"}-${index}`;

                return (
                  <motion.div
                    key={uniqueKey}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, delay: index * 0.035 }}
                    className="py-3.5 px-3 sm:px-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-all duration-200 hover:bg-[#FAF7F2] border border-transparent hover:border-gold-300/40 hover:shadow-xs"
                  >
                    {/* Title & Description */}
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-gold-600 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 shrink-0 hidden sm:block" />
                        <h4 className="font-serif text-base sm:text-lg font-normal text-charcoal-900 group-hover:text-gold-800 transition-colors">
                          {title}
                        </h4>
                        {service.isPopular && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blush-100 text-gold-800 border border-blush-200 shrink-0">
                            <Flame className="w-3 h-3 text-pink-600" />
                            <span>{t.prices.popularBadge}</span>
                          </span>
                        )}
                      </div>
                      {description && (
                        <p className="text-xs sm:text-[13px] text-charcoal-500 mt-1 leading-relaxed max-w-xl sm:pl-5.5">
                          {description}
                        </p>
                      )}
                    </div>

                    {/* Duration & Price */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 shrink-0">
                      {service.durationMin && (
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-400 group-hover:text-charcoal-600 font-medium transition-colors">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          <span>
                            {service.durationMin} {t.prices.minutes}
                          </span>
                        </div>
                      )}

                      <div className="text-right">
                        <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors">
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

          {/* Quick Booking Interactive Bar */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 pt-6 border-t border-nude-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 bg-nude-50/80 p-5 rounded-2xl"
          >
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold text-charcoal-900 flex items-center justify-center sm:justify-start gap-1.5">
                <Gem className="w-4 h-4 text-gold-600" />
                <span>
                  {language === "pl"
                    ? "Chcesz zarezerwować termin na stylizację?"
                    : "Бажаєте записатися на послугу?"}
                </span>
              </p>
              <p className="text-xs text-charcoal-500 mt-0.5">
                {language === "pl"
                  ? "Napisz bezpośrednio na Telegram lub Instagram"
                  : "Напишіть напряму в Telegram або Instagram Direct"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="https://t.me/uliana_p_u"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.prices.bookViaTelegram}</span>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Instagram ${instagram.handle}`}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-semibold text-charcoal-800 bg-white hover:bg-nude-100 border border-nude-300 transition-colors shadow-xs"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                <span>{t.prices.bookViaInstagram}</span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
