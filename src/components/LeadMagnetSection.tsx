"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  Gift,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowDownToLine,
  FileDown,
} from "lucide-react";
import { getSettingText } from "@/lib/settingsHelper";
import { DefaultLeadMagnet } from "@/lib/defaultData";

interface LeadMagnetSectionProps {
  items?: DefaultLeadMagnet[];
  settings?: Record<string, string>;
}

export default function LeadMagnetSection({
  items = [],
  settings = {},
}: LeadMagnetSectionProps) {
  const { language, t, getLocalized } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

  const activeItems = items.filter((item) => item.isActive !== false);

  if (activeItems.length === 0) {
    return null;
  }

  const sectionBadge = getSettingText(
    settings,
    "text_checklist_badge",
    language,
    (t as any).checklist?.badge || (language === "ua" ? "🎁 Подарунок від Уляни" : "🎁 Prezent od Uliany")
  );

  const sectionTitle = getSettingText(
    settings,
    "text_checklist_title",
    language,
    (t as any).checklist?.title || (language === "ua" ? "Отримай безкоштовно CHECKLIST" : "Odbierz darmowy CHECKLIST")
  );

  const sectionSubtitle = getSettingText(
    settings,
    "text_checklist_subtitle",
    language,
    (t as any).checklist?.subtitle ||
      (language === "ua"
        ? "Авторський практичний посібник для nail-майстрів. Завантажуй PDF прямо зараз та впроваджуй перевірені фішки у свою роботу!"
        : "Autorski praktyczny poradnik dla stylistek paznokci. Pobierz darmowy PDF już teraz i wprowadź sprawdzone techniki do swojej pracy!")
  );

  const sectionNote = getSettingText(
    settings,
    "text_checklist_note",
    language,
    (t as any).checklist?.instantNote ||
      (language === "ua"
        ? "⚡ Миттєве завантаження в 1 клік • Безкоштовно для майстрів"
        : "⚡ Błyskawiczne pobieranie w 1 kliknięcie • Za darmo dla stylistek")
  );

  const handleDownload = async (item: DefaultLeadMagnet) => {
    if (!item.id || !item.fileUrl) return;

    setDownloadingId(item.id);

    try {
      // Increment counter asynchronously on backend
      fetch(`/api/lead-magnets/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download" }),
      }).catch(() => {});

      // Trigger actual download / open
      const link = document.createElement("a");
      link.href = item.fileUrl;
      link.download = item.fileName || "checklist.pdf";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadedIds((prev) => ({ ...prev, [item.id!]: true }));
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  return (
    <section id="checklist" className="py-20 sm:py-24 bg-gradient-to-b from-[#FAF8F5] via-[#FFFDF9] to-[#FAF8F5] relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/2 -left-48 -translate-y-1/2 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-gold-900 text-xs font-semibold tracking-wider uppercase mb-4 shadow-xs">
            <Gift className="w-3.5 h-3.5 text-gold-700 animate-pulse" />
            <span>{sectionBadge}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight mb-4">
            {sectionTitle}
          </h2>

          <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </motion.div>

        {/* Lead Magnets Cards Grid */}
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {activeItems.map((item, idx) => {
            const title = getLocalized(item, "title");
            const description = getLocalized(item, "description");
            const badge = getLocalized(item, "badge") || (language === "ua" ? "Безкоштовний PDF" : "Darmowy PDF");
            const buttonText = getLocalized(item, "buttonText") || (language === "ua" ? "Завантажити чек-лист" : "Pobierz checklist");
            const isDownloaded = Boolean(item.id && downloadedIds[item.id]);
            const isDownloading = downloadingId === item.id;

            return (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-3xl bg-white border-2 border-gold-300/70 p-6 sm:p-9 shadow-card hover:shadow-glow transition-all duration-300 overflow-hidden"
              >
                {/* Background Watermark Icon */}
                <div className="absolute -right-8 -bottom-8 text-gold-100/50 pointer-events-none">
                  <FileText className="w-48 h-48" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
                  {/* Left: Document Visual & Details */}
                  <div className="flex items-start gap-4 sm:gap-6 flex-1">
                    {/* Visual Icon Badge */}
                    <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white flex flex-col items-center justify-center shrink-0 shadow-md border border-gold-400/40 relative">
                      <FileDown className="w-7 h-7 sm:w-8 sm:h-8 text-gold-400 mb-1" />
                      <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gold-200 uppercase">
                        PDF
                      </span>
                      {item.fileSize && (
                        <span className="text-[9px] text-charcoal-300 font-mono mt-0.5">
                          {item.fileSize}
                        </span>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {badge && (
                          <span className="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-50 text-gold-800 border border-gold-200">
                            {badge}
                          </span>
                        )}
                        {item.downloadCount && item.downloadCount > 10 ? (
                          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>
                              {language === "ua"
                                ? `Завантажили ${item.downloadCount}+ майстрів`
                                : `Pobrano przez ${item.downloadCount}+ stylistek`}
                            </span>
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 leading-snug">
                        {title}
                      </h3>

                      {description && (
                        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-xl">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Download Action */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 w-full md:w-auto shrink-0">
                    <button
                      type="button"
                      disabled={isDownloading}
                      onClick={() => handleDownload(item)}
                      className={`px-7 py-4 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2.5 shadow-md transition-all duration-300 cursor-pointer ${
                        isDownloaded
                          ? "bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700"
                          : "bg-charcoal-900 hover:bg-gold-600 text-white shadow-charcoal-900/20 hover:shadow-gold-500/30 active:scale-98"
                      }`}
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>
                            {language === "ua" ? "Завантажено знову!" : "Pobrano ponownie!"}
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className={`w-4 h-4 text-gold-400 ${isDownloading ? "animate-bounce" : ""}`} />
                          <span>{buttonText}</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-charcoal-500 text-center md:text-right font-medium flex items-center justify-center md:justify-end gap-1">
                      <Zap className="w-3 h-3 text-gold-600 inline" />
                      <span>{sectionNote}</span>
                    </span>
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
