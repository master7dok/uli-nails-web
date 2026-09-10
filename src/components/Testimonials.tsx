"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Star, MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { getSettingText } from "@/lib/settingsHelper";

interface TestimonialItem {
  id: string;
  name: string;
  rolePl: string;
  roleUa: string;
  textPl: string;
  textUa: string;
  rating: number;
}

interface TestimonialsProps {
  items: TestimonialItem[];
  settings?: Record<string, string>;
}

export default function Testimonials({ items, settings }: TestimonialsProps) {
  const { language, t, getLocalized } = useLanguage();

  return (
    <section id="reviews" className="py-24 bg-[#F5F2EB]/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-100 border border-blush-200 mb-4 shadow-xs">
            <MessageSquareQuote className="w-3.5 h-3.5 text-gold-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-charcoal-700">
              {getSettingText(settings, "text_testimonials_badge", language, t.testimonials.badge)}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {getSettingText(settings, "text_testimonials_title", language, t.testimonials.title)}
          </h2>
          <p className="text-base text-charcoal-600 leading-relaxed">
            {getSettingText(settings, "text_testimonials_subtitle", language, t.testimonials.subtitle)}
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const role = getLocalized(item, "role");
            const text = getLocalized(item, "text");

            return (
              <motion.div
                key={item.id || `testimonial-${index}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col justify-between rounded-3xl p-8 bg-white border border-nude-200/90 shadow-soft hover:shadow-card transition-all"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm sm:text-[14.5px] text-charcoal-700 leading-relaxed italic mb-6">
                    &ldquo;{text}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-5 border-t border-nude-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nude-100 border border-gold-300 flex items-center justify-center font-serif font-bold text-charcoal-800 text-sm">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-semibold text-charcoal-900">
                        {item.name}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-xs text-charcoal-500">{role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
