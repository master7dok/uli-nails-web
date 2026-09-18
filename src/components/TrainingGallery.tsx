"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, X, ZoomIn, Award } from "lucide-react";
import { getSettingText } from "@/lib/settingsHelper";

export interface TrainingPhotoItem {
  id: string;
  imageUrl: string;
  titlePl?: string | null;
  titleUa?: string | null;
  category: string;
  objectPosition?: string | null;
  featured: boolean;
  sortOrder: number;
}

interface TrainingGalleryProps {
  items: TrainingPhotoItem[];
  settings?: Record<string, string>;
}

export default function TrainingGallery({ items, settings }: TrainingGalleryProps) {
  const { language, t, getLocalized } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<TrainingPhotoItem | null>(null);

  const hasPedicure = items.some((item) => item.category === "pedicure");
  const filterTabs = [
    {
      id: "all",
      label: (t as any).trainingGallery?.tabAll || (language === "ua" ? "Всі фото" : "Wszystkie"),
    },
    {
      id: "process",
      label: (t as any).trainingGallery?.tabProcess || (language === "ua" ? "Процес навчання" : "Proces szkoleń"),
    },
    {
      id: "certificates",
      label: (t as any).trainingGallery?.tabCertificates || (language === "ua" ? "Випускниці та дипломи" : "Kursantki i certyfikaty"),
    },
    {
      id: "practice",
      label: (t as any).trainingGallery?.tabPractice || (language === "ua" ? "Практика на моделях" : "Praktyka na modelkach"),
    },
    {
      id: "practice_dual_forms",
      label: (t as any).trainingGallery?.tabPracticeDualForms || (language === "ua" ? "Практика на моделях - Нарощення на верхні форми" : "Praktyka na modelkach - Przedłużanie dual forms"),
    },
    ...(hasPedicure
      ? [
          {
            id: "pedicure",
            label: language === "ua" ? "Педикюр" : "Pedicure",
          },
        ]
      : []),
  ];

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const getCategoryBadgeLabel = (cat: string) => {
    switch (cat) {
      case "process":
        return language === "ua" ? "Процес" : "Proces";
      case "certificates":
        return language === "ua" ? "Сертифікати" : "Certyfikaty";
      case "practice":
        return language === "ua" ? "Практика" : "Praktyka";
      case "practice_dual_forms":
        return language === "ua" ? "Верхні форми" : "Dual forms";
      case "students":
        return language === "ua" ? "Учениці" : "Kursantki";
      case "pedicure":
        return language === "ua" ? "Педикюр" : "Pedicure";
      default:
        return language === "ua" ? "Курси" : "Szkolenie";
    }
  };

  return (
    <section id="training" className="py-24 bg-white relative overflow-hidden">
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
            <GraduationCap className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {getSettingText(
                settings,
                "text_training_badge",
                language,
                (t as any).trainingGallery?.badge || (language === "ua" ? "Атмосфера навчання" : "Atmosfera szkoleń")
              )}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {getSettingText(
              settings,
              "text_training_title",
              language,
              (t as any).trainingGallery?.title || (language === "ua" ? "Фото з курсів та випускниці" : "Zdjęcia ze szkoleń i kursantki")
            )}
          </h2>
          <p className="text-base text-charcoal-600 leading-relaxed">
            {getSettingText(
              settings,
              "text_training_subtitle",
              language,
              (t as any).trainingGallery?.subtitle ||
                (language === "ua"
                  ? "Живі моменти з авторських курсів: практика на моделях, постановка руки, вручення дипломів та перші впевнені кроки в професії."
                  : "Żywe chwile z kursów autorskich: praktyka na modelkach, ułożenie ręki, wręczenie certyfikatów i pierwsze pewne kroki w zawodzie.")
            )}
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
                    : "text-charcoal-600 hover:text-charcoal-900 bg-nude-50 hover:bg-nude-100/80 border border-nude-200 shadow-xs"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTrainingCategoryPill"
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
                  key={item.id || `training-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative rounded-2xl overflow-hidden aspect-square sm:aspect-[4/3] bg-nude-100 cursor-pointer shadow-soft hover:shadow-card transition-all"
                >
                  <Image
                    src={item.imageUrl}
                    alt={title || "Uliana Nails training masterclass photo"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                    priority={index < 2}
                    loading={index < 4 ? "eager" : "lazy"}
                    style={{ objectPosition: item.objectPosition || "center" }}
                    className="object-cover transition-transform duration-500 group-hover:scale-106"
                  />

                  {/* Top Category Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/85 backdrop-blur-md text-charcoal-800 shadow-xs">
                      <Award className="w-3 h-3 text-gold-600" />
                      {getCategoryBadgeLabel(item.category)}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                    <div className="flex items-center justify-between">
                      <p className="font-serif text-sm sm:text-base font-medium line-clamp-2">
                        {title}
                      </p>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ml-2">
                        <ZoomIn className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-charcoal-500 font-serif">
              {language === "ua" ? "У цій категорії поки що немає фотографій." : "Brak zdjęć w tej kategorii."}
            </p>
          </div>
        )}
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
                alt="Selected training photo"
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
