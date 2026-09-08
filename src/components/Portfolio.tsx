"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ZoomIn, Sparkles } from "lucide-react";

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
}

export default function Portfolio({ items }: PortfolioProps) {
  const { t, getLocalized } = useLanguage();
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
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-nude-100 border border-nude-300 mb-4">
            <Camera className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {t.portfolio.badge}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {t.portfolio.title}
          </h2>
          <p className="text-base text-charcoal-600 leading-relaxed">
            {t.portfolio.subtitle}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeCategory === tab.id
                  ? "bg-charcoal-900 text-white shadow-soft"
                  : "bg-white/90 hover:bg-white text-charcoal-600 border border-nude-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => {
              const title = getLocalized(item, "title");

              return (
                <motion.div
                  key={item.id}
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
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px"
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
