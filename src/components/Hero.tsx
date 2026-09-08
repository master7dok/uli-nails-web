"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Award, Clock, Users } from "lucide-react";

interface HeroProps {
  settings?: Record<string, string>;
}

const DEFAULT_HERO_PHOTO =
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop";

export default function Hero({ settings }: HeroProps) {
  const { t } = useLanguage();
  const heroPhoto = settings?.hero_photo_url || DEFAULT_HERO_PHOTO;

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden hero-gradient">
      {/* Subtle background ambient circles */}
      <div className="absolute top-20 right-[-5%] w-[450px] h-[450px] rounded-full bg-blush-100/50 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-[-10%] w-[500px] h-[500px] rounded-full bg-nude-200/40 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start w-full"
          >
            {/* Top Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-nude-100 border border-nude-300/80 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
                {t.hero.tagline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="w-full font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[58px] xl:text-[62px] font-normal leading-[1.18] sm:leading-[1.12] text-charcoal-900 tracking-tight mb-6">
              <span className="block">{t.hero.titleLine1}</span>
              <span className="block italic font-normal gold-gradient-text pr-3 sm:pr-4 pb-0.5 tracking-normal">
                {t.hero.titleLine2}
              </span>
              <span className="block">{t.hero.titleLine3}</span>
              <span className="block">{t.hero.titleLine4}</span>
            </h1>

            {/* Subtitle description */}
            <p className="text-base sm:text-lg text-charcoal-600 font-normal leading-relaxed max-w-2xl mb-8">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
              <a
                href="#courses"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold uppercase tracking-wider text-white bg-charcoal-800 hover:bg-gold-600 rounded-full transition-all duration-300 shadow-soft hover:shadow-glow group"
              >
                <span>{t.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#prices"
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-charcoal-800 bg-white/80 hover:bg-white border border-nude-300 rounded-full transition-all duration-200 hover:border-gold-500 shadow-sm"
              >
                {t.hero.secondaryCta}
              </a>
            </div>

            {/* Trust Stats Bar */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 border-t border-nude-200/90 w-full max-w-lg">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-gold-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                    120+
                  </span>
                </div>
                <span className="text-xs text-charcoal-500 font-medium">
                  {t.hero.statsTrained}
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-gold-600 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                    6+
                  </span>
                </div>
                <span className="text-xs text-charcoal-500 font-medium">
                  {t.hero.statsExperience}
                </span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-gold-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                    75
                  </span>
                  <span className="text-xs font-semibold text-charcoal-500">хв</span>
                </div>
                <span className="text-xs text-charcoal-500 font-medium">
                  {t.hero.statsSpeed}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visual Portrait Card with Luxury Touch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md">
              {/* Outer decorative gold frame */}
              <div className="absolute -inset-3 rounded-2xl border border-gold-400/40 transform rotate-1 pointer-events-none" />
              <div className="absolute -inset-1 rounded-2xl border border-nude-300/80 transform -rotate-1 pointer-events-none" />

              {/* Main Photo Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-card bg-nude-100 aspect-[4/5]">
                <Image
                  src={heroPhoto}
                  alt="Uliana Nails - Nail Master & Gel Expert Kraków"
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 400px"
                />

                {/* Gradient vignette on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass-panel text-charcoal-900 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif text-base font-semibold tracking-wide">
                        Uliana • Kraków
                      </p>
                      <p className="text-xs text-charcoal-600 font-medium">
                        Gel Expert & Salon Team Instructor
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-700">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Mini Badge */}
              <div className="absolute -top-4 -right-3 sm:-right-4 py-2 px-3.5 rounded-full bg-white shadow-soft border border-nude-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-800">
                  Certified Master
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
