"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Video,
  PlayCircle,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  Send,
  Clock,
  Layers,
} from "lucide-react";
import StudentLoginModal from "./StudentLoginModal";
import { getTelegramLink } from "@/lib/settingsHelper";

export interface OnlineCourseItem {
  id: string;
  slug: string;
  titleUa: string;
  titlePl: string;
  subtitleUa?: string | null;
  subtitlePl?: string | null;
  descriptionUa: string;
  descriptionPl: string;
  pricePln: number;
  priceMaxPln?: number | null;
  coverUrl?: string | null;
  badgeUa?: string | null;
  badgePl?: string | null;
  durationUa?: string | null;
  durationPl?: string | null;
  sortOrder: number;
  isActive: boolean;
  materials?: {
    id: string;
    type: string;
    titleUa: string;
    titlePl: string;
  }[];
  _count?: {
    materials: number;
  };
}

interface OnlineCoursesSectionProps {
  courses: OnlineCourseItem[];
  settings?: Record<string, string>;
  visible?: boolean;
}

export default function OnlineCoursesSection({
  courses,
  settings,
  visible = true,
}: OnlineCoursesSectionProps) {
  const { language, t, getLocalized } = useLanguage();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // If hidden via admin switch, render nothing
  if (!visible || courses.length === 0) {
    return null;
  }

  const telegram = getTelegramLink(settings);

  const loc = (t as any).onlineCourses || {
    badge: language === "ua" ? "Дистанційне навчання" : "Nauka zdalna",
    title: language === "ua" ? "Онлайн-курси та майстер-класи" : "Kursy online i Masterclass",
    subtitle:
      language === "ua"
        ? "Опановуйте авторські техніки Уляни з будь-якої точки світу у власному темпі."
        : "Ucz się autorskich technik Uliany z dowolnego miejsca na świecie we własnym tempie.",
    badgeOnline: language === "ua" ? "Онлайн" : "Online",
    materialsLabel: language === "ua" ? "матеріалів" : "materiałów",
    priceLabel: language === "ua" ? "Вартість" : "Inwestycja",
    ctaBuy: language === "ua" ? "Придбати курс" : "Kup dostęp do kursu",
    ctaAccess: language === "ua" ? "Увійти до курсу" : "Zaloguj się",
    alreadyPurchased: language === "ua" ? "Вже придбали?" : "Masz już dostęp?",
  };

  return (
    <section id="online-courses" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-100 border border-gold-300 mb-4 shadow-xs">
            <Video className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {loc.badge}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {loc.title}
          </h2>

          <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed">
            {loc.subtitle}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:text-gold-900 underline underline-offset-4 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loc.alreadyPurchased} {loc.ctaAccess}</span>
            </button>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => {
            const title = getLocalized(course, "title");
            const subtitle = getLocalized(course, "subtitle");
            const description = getLocalized(course, "description");
            const duration = getLocalized(course, "duration") || (language === "ua" ? "30 днів доступу" : "30 dni dostępu");
            const badge = getLocalized(course, "badge") || loc.badgeOnline;
            const materialsCount = course.materials?.length ?? course._count?.materials ?? 0;

            const hasRange = Boolean(
              course.priceMaxPln &&
                course.priceMaxPln > 0 &&
                course.priceMaxPln !== course.pricePln
            );
            const minPrice = hasRange ? Math.min(course.pricePln, course.priceMaxPln!) : course.pricePln;
            const maxPrice = hasRange ? Math.max(course.pricePln, course.priceMaxPln!) : null;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#FAF8F5] rounded-3xl overflow-hidden border border-nude-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Cover */}
                  <div className="relative aspect-video w-full bg-nude-200 overflow-hidden">
                    {course.coverUrl ? (
                      <Image
                        src={course.coverUrl}
                        alt={title || "Online Course"}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nude-100 to-nude-200">
                        <PlayCircle className="w-16 h-16 text-gold-600/70" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-charcoal-900 shadow-xs">
                        {badge}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-charcoal-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold-700" />
                        {duration}
                      </span>
                      {materialsCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-gold-700" />
                            {materialsCount} {loc.materialsLabel}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 leading-snug">
                      {title}
                    </h3>

                    {subtitle && (
                      <p className="text-xs font-semibold text-gold-700">
                        {subtitle}
                      </p>
                    )}

                    <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar: Price & Action */}
                <div className="p-6 sm:p-7 pt-4 border-t border-nude-200/80 bg-white/50 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wider text-charcoal-500 font-medium">
                      {loc.priceLabel}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-2xl font-bold text-charcoal-900">
                        {hasRange ? `${minPrice} – ${maxPrice}` : minPrice}
                      </span>
                      <span className="text-sm font-semibold text-charcoal-600">zł</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-2xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold text-center uppercase tracking-wider transition-all shadow-sm hover:shadow-soft flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>{loc.ctaBuy}</span>
                    </a>

                    <button
                      onClick={() => setLoginModalOpen(true)}
                      className="py-3 px-3 rounded-2xl bg-nude-100 hover:bg-gold-500 hover:text-white text-charcoal-800 text-xs font-semibold text-center uppercase tracking-wider transition-all border border-nude-300 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>{loc.ctaAccess}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </section>
  );
}
