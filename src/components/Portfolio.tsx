"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ZoomIn, Sparkles } from "lucide-react";
import { getSettingText } from "@/lib/settingsHelper";

interface PortfolioItem {
  id: string;
  imageUrl: string;
  titlePl?: string | null;
  titleUa?: string | null;
  category: string;
  featured: boolean;
  sortOrder: number;
}

interface PortfolioProps {
  items: PortfolioItem[];
  settings?: Record<string, string>;
}

export default function Portfolio({ items, settings }: PortfolioProps) {
  const { language, t, getLocalized } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);

  const filterTabs = [
    { id: "all", label: t.portfolio.tabAll },
    { id: "gel", label: t.portfolio.tabGel },
    { id: "manicure", label: t.portfolio.tabManicure },
    { id: "french", label: t.portfolio.tabFrench },
    { id: "correction", label: t.portfolio.tabCorrection },
  ];

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <section id="portfolio" className="py-24 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-nude-100 border border-nude-300 mb-4 shadow-xs">
            <Camera className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {getSettingText(settings, "text_portfolio_badge", language, t.portfolio.badge)}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {getSettingText(settings, "text_portfolio_title", language, t.portfolio.title)}
          </h2>
          <p className="text-base text-charcoal-600 leading-relaxed">
            {getSettingText(settings, "text_portfolio_subtitle", language, t.portfolio.subtitle)}
          </p>
        </motion.div>

        {/* Filter Tabs with animated pill */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none"
        >
          {filterTabs.map((tab) => {
            const isActive = activeCategory === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`relative px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-charcoal-600 hover:text-charcoal-900 bg-white/80 hover:bg-white border border-nude-200/90 shadow-xs"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePortfolioCategoryPill"
                    className="absolute inset-0 bg-charcoal-900 rounded-full shadow-soft"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const title = getLocalized(item, "title");

              return (
                <motion.div
                  key={item.id || `portfolio-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative rounded-2xl overflow-hidden aspect-square bg-nude-200 cursor-pointer shadow-soft hover:shadow-card transition-all"
                >
                  <Image
                    src={item.imageUrl}
                    alt={title || "Uliana Nails portfolio artwork"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 380px"
                    priority={index < 2}
                    loading={index < 4 ? "eager" : "lazy"}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/75 via-charcoal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                    <div className="flex items-center justify-between">
                      <p className="font-serif text-sm sm:text-base font-medium line-clamp-1">
                        {title}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            className="relative max-w-3xl w-full bg-charcoal-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Close Lightbox"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-charcoal-800/80 hover:bg-charcoal-700 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full aspect-square sm:aspect-[4/3] bg-charcoal-950">
              <Image
                src={selectedPhoto.imageUrl}
                alt="Selected nail photo"
                fill
                className="object-contain"
              />
            </div>

            {getLocalized(selectedPhoto, "title") && (
              <div className="p-4 bg-charcoal-900 text-center">
                <p className="font-serif text-base text-nude-100">
                  {getLocalized(selectedPhoto, "title")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
