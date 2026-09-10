"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Sparkles, Check, Gem, Award } from "lucide-react";
import { getSettingText } from "@/lib/settingsHelper";

interface AboutProps {
  settings?: Record<string, string>;
}

const DEFAULT_ABOUT_MAIN =
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop";
const DEFAULT_ABOUT_SECONDARY =
  "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop";

export default function About({ settings }: AboutProps) {
  const { language, t } = useLanguage();
  const mainPhoto = settings?.about_main_photo_url || DEFAULT_ABOUT_MAIN;
  const secondaryPhoto = settings?.about_secondary_photo_url || DEFAULT_ABOUT_SECONDARY;

  const title = getSettingText(settings, "text_about_title", language, t.about.title);
  const p1 = getSettingText(settings, "text_about_p1", language, t.about.p1);
  const p2 = getSettingText(settings, "text_about_p2", language, t.about.p2);
  const p3 = getSettingText(settings, "text_about_p3", language, t.about.p3);

  const features = [
    getSettingText(settings, "text_about_feature1", language, t.about.features[0]),
    getSettingText(settings, "text_about_feature2", language, t.about.features[1]),
    getSettingText(settings, "text_about_feature3", language, t.about.features[2]),
    getSettingText(settings, "text_about_feature4", language, t.about.features[3]),
  ];

  const stats = [
    {
      value: settings?.text_about_stat1_value || "6+",
      label: getSettingText(
        settings,
        "text_about_stat1_label",
        language,
        t.about.stats[0]?.label || "Років у nail-індустрії"
      ),
    },
    {
      value: settings?.text_about_stat2_value || "120+",
      label: getSettingText(
        settings,
        "text_about_stat2_label",
        language,
        t.about.stats[1]?.label || "Випускниць та майстрів салонів"
      ),
    },
    {
      value: settings?.text_about_stat3_value || "850+",
      label: getSettingText(
        settings,
        "text_about_stat3_label",
        language,
        t.about.stats[2]?.label || "Задоволених постійних клієнтів"
      ),
    },
    {
      value: settings?.text_about_stat4_value || "28+",
      label: getSettingText(
        settings,
        "text_about_stat4_label",
        language,
        t.about.stats[3]?.label || "Днів гарантії носіння"
      ),
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#F5F2EB]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual Collage */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-card aspect-[3/4] bg-nude-200">
                <Image
                  src={mainPhoto}
                  alt="Uliana working on gel manicure"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 450px"
                />
              </div>

              {/* Floating aesthetic mini-image */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-44 h-44 rounded-xl overflow-hidden shadow-card border-4 border-[#FAF8F5] hidden sm:block">
                <Image
                  src={secondaryPhoto}
                  alt="Gel architecture close-up"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Gold decorative stamp */}
              <div className="absolute -top-6 -left-4 w-24 h-24 rounded-full border border-gold-400/50 flex items-center justify-center p-2 bg-[#FAF8F5]/90 backdrop-blur-sm shadow-soft">
                <div className="w-full h-full rounded-full border border-dashed border-gold-500/60 flex flex-col items-center justify-center text-center">
                  <Gem className="w-4 h-4 text-gold-600 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal-700">
                    Master
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Bio & Core Advantages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col"
          >
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-100 border border-blush-200 mb-4 w-fit">
              <Award className="w-3.5 h-3.5 text-gold-700" />
              <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
                {t.about.badge}
              </span>
            </div>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-6">
              {title}
            </h2>

            {/* Paragraphs */}
            <div className="space-y-4 text-charcoal-600 text-base sm:text-[16.5px] leading-relaxed mb-8">
              <p>{p1}</p>
              <p>{p2}</p>
              <p>{p3}</p>
            </div>

            {/* 4 Core Pillars Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-nude-200/80 shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-gold-500/15 flex items-center justify-center text-gold-700 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-sm font-medium text-charcoal-800 leading-snug">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Dynamic Counter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-nude-200 shadow-soft">
              {stats.map((st, i) => (
                <div key={i} className="flex flex-col text-center sm:text-left">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                    {st.value}
                  </span>
                  <span className="text-xs text-charcoal-500 font-medium mt-0.5">
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
