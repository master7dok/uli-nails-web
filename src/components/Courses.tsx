"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import CourseModal from "./CourseModal";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Info,
  ChevronDown,
  BookOpen,
  Award,
  Gift,
  Heart,
  CalendarCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

interface SyllabusDay {
  day: string;
  title: string;
  theory: string;
  practice: string;
}

interface CourseItem {
  id: string;
  slug: string;
  titlePl: string;
  titleUa: string;
  subtitlePl?: string | null;
  subtitleUa?: string | null;
  descriptionPl: string;
  descriptionUa: string;
  durationPl: string;
  durationUa: string;
  levelPl: string;
  levelUa: string;
  pricePln: number;
  badgePl?: string | null;
  badgeUa?: string | null;
  bonusPl?: string | null;
  bonusUa?: string | null;
  featuresPl: string;
  featuresUa: string;
  syllabusPl?: string | null;
  syllabusUa?: string | null;
  formUrl?: string | null;
}

interface CoursesProps {
  courses: CourseItem[];
}

export default function Courses({ courses }: CoursesProps) {
  const { language, t, getLocalized } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const toggleAccordion = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const handleOpenModal = (course: CourseItem) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const parseFeatures = (jsonStr: string): string[] => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  const parseSyllabus = (jsonStr?: string | null): SyllabusDay[] => {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  };

  return (
    <section id="courses" className="py-24 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-nude-100 border border-nude-300 mb-4 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {t.courses.badge}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-5">
            {t.courses.title}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed">
            {t.courses.subtitle}
          </p>
        </div>

        {/* 1. PROMO BANNER (Bring a Friend / Приходь з подругою!) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 max-w-4xl mx-auto relative rounded-3xl overflow-hidden shadow-card border-2 border-pink-200/80 bg-gradient-to-r from-[#FDF5F5] via-[#FFF9F6] to-[#FDF5F5] p-6 sm:p-8"
        >
          {/* Subtle decorative heart watermark */}
          <div className="absolute -right-6 -bottom-6 text-pink-100/60 pointer-events-none">
            <Heart className="w-36 h-36 fill-current" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 text-white flex items-center justify-center shrink-0 shadow-md">
              <Gift className="w-7 h-7" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
                  {t.courses.friendPromoTitle}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                  -250 zł
                </span>
              </div>
              <p className="text-sm sm:text-[15px] text-charcoal-700 leading-relaxed">
                {t.courses.friendPromoText}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2. Personalized Curriculum Note */}
        <div className="mb-14 max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-nude-100/80 border border-gold-400/40 shadow-xs flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-800 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-charcoal-700 leading-snug">
            <span className="font-semibold text-charcoal-900 mr-1">
              {language === "pl" ? "Indywidualne dopasowanie programu:" : "Індивідуальна адаптація програми:"}
            </span>
            {t.courses.personalizedNotice}
          </div>
        </div>

        {/* 3. COURSES CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-16">
          {courses.map((course, index) => {
            const badge = getLocalized(course, "badge");
            const title = getLocalized(course, "title");
            const subtitle = getLocalized(course, "subtitle");
            const description = getLocalized(course, "description");
            const duration = getLocalized(course, "duration");
            const level = getLocalized(course, "level");
            const bonus = getLocalized(course, "bonus");
            const features = parseFeatures(
              language === "pl" ? course.featuresPl : course.featuresUa
            );
            const syllabus = parseSyllabus(
              language === "pl" ? course.syllabusPl : course.syllabusUa
            );

            const isExpanded = !!expandedCourses[course.id];
            const isFeatured = index === 0 || index === 3; // VIP Intensyw & Base 0 are highlighted

            return (
              <motion.div
                key={course.id || course.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`relative flex flex-col rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                  isFeatured
                    ? "bg-white border-2 border-gold-500/80 shadow-glow"
                    : "bg-white/90 hover:bg-white border border-nude-200 shadow-soft hover:shadow-card"
                }`}
              >
                {/* Badge */}
                {badge && (
                  <div className="absolute -top-3.5 left-8 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-charcoal-900 text-gold-300 shadow-sm">
                    {badge}
                  </div>
                )}

                {/* Top Info (Duration, Target Level) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mb-4 text-xs font-medium text-charcoal-500">
                  <div className="flex items-center gap-1.5 bg-nude-100 px-3 py-1 rounded-full text-charcoal-800">
                    <Clock className="w-3.5 h-3.5 text-gold-700" />
                    <span>{duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blush-100/80 text-charcoal-800 px-3 py-1 rounded-full font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-gold-700" />
                    <span>{level}</span>
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="font-serif text-2xl sm:text-[26px] font-normal text-charcoal-900 leading-snug mb-2">
                  {title}
                </h3>

                {subtitle && (
                  <p className="text-xs sm:text-sm font-medium text-gold-700 mb-4 leading-relaxed">
                    {subtitle}
                  </p>
                )}

                {/* Short Summary Description */}
                <p className="text-sm text-charcoal-600 leading-relaxed mb-5">
                  {description}
                </p>

                {/* Bonus Ribbon (If present) */}
                {bonus && (
                  <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                    <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-medium">{bonus}</span>
                  </div>
                )}

                {/* Global Standard Guarantee (Includes manual & certificate) */}
                <div className="mb-5 py-2.5 px-3.5 rounded-xl bg-nude-50 border border-nude-200/90 flex items-center gap-2 text-xs text-charcoal-700">
                  <Award className="w-4 h-4 text-gold-600 shrink-0" />
                  <span className="font-semibold text-charcoal-800">
                    {t.courses.globalIncludes}
                  </span>
                </div>

                {/* Key Highlights Checkmarks */}
                <div className="space-y-2 mb-6 flex-1">
                  {features.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-charcoal-700">
                      <CheckCircle className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {/* ACCORDION TRIGGER (View Program / Переглянути програму) */}
                {syllabus.length > 0 && (
                  <div className="mb-6 pt-2 border-t border-nude-100">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(course.id)}
                      className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-nude-100/70 hover:bg-nude-200/70 text-charcoal-900 text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gold-700" />
                        <span>
                          {isExpanded ? t.courses.hideProgram : t.courses.viewProgram}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronDown className="w-4 h-4 text-charcoal-600" />
                      </motion.div>
                    </button>

                    {/* Expandable Day-by-Day Accordion Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                          className="overflow-hidden mt-3 space-y-3"
                        >
                          {syllabus.map((dayItem, dayIdx) => (
                            <div
                              key={dayIdx}
                              className="p-4 rounded-2xl bg-white border border-nude-200/90 shadow-xs space-y-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-charcoal-900 text-gold-300">
                                  {dayItem.day}
                                </span>
                                <h4 className="font-serif font-bold text-sm text-charcoal-900">
                                  {dayItem.title}
                                </h4>
                              </div>

                              {dayItem.theory && (
                                <div className="text-charcoal-700 leading-relaxed pl-1">
                                  <span className="font-semibold text-gold-800">
                                    {t.courses.theoryLabel}:{" "}
                                  </span>
                                  {dayItem.theory}
                                </div>
                              )}

                              {dayItem.practice && (
                                <div className="text-charcoal-700 leading-relaxed pl-1 pt-1 border-t border-nude-100/60">
                                  <span className="font-semibold text-charcoal-900">
                                    {t.courses.practiceLabel}:{" "}
                                  </span>
                                  {dayItem.practice}
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Bottom Bar: Price & CTA */}
                <div className="pt-6 border-t border-nude-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-charcoal-500 font-medium block">
                      {language === "pl" ? "Inwestycja w kurs" : "Вартість курсу"}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-3xl font-bold text-charcoal-900">
                        {course.pricePln}
                      </span>
                      <span className="text-sm font-semibold text-charcoal-600">zł</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(course)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white bg-charcoal-800 hover:bg-gold-600 transition-all duration-300 shadow-soft hover:shadow-glow group"
                  >
                    <span>{t.courses.ctaApply}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 4. BOOKING RULE NOTE */}
        <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-white border border-nude-200 shadow-soft flex items-center justify-center gap-3 text-center sm:text-left">
          <ShieldAlert className="w-5 h-5 text-gold-700 shrink-0 hidden sm:block" />
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <span className="font-semibold text-charcoal-900 block sm:inline mr-1">
              {language === "pl" ? "Zasady rezerwacji:" : "Умови бронювання:"}
            </span>
            {t.courses.bookingRule}
          </p>
        </div>
      </div>

      {/* Embedded Google Form Questionnaire Modal */}
      <CourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        courseTitle={selectedCourse ? getLocalized(selectedCourse, "title") : ""}
        formUrl={selectedCourse?.formUrl || undefined}
      />
    </section>
  );
}
