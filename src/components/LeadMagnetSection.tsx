"use client";

import React, { useState, useMemo } from "react";
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
  Play,
  Clock,
  Eye,
} from "lucide-react";
import { getSettingText } from "@/lib/settingsHelper";
import { DefaultLeadMagnet, DefaultBonusVideo } from "@/lib/defaultData";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import VideoPlayerModal from "@/components/VideoPlayerModal";

interface LeadMagnetSectionProps {
  items?: DefaultLeadMagnet[];
  videos?: DefaultBonusVideo[];
  settings?: Record<string, string>;
}

export default function LeadMagnetSection({
  items = [],
  videos = [],
  settings = {},
}: LeadMagnetSectionProps) {
  const { language, t, getLocalized } = useLanguage();
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});
  const [selectedItemForModal, setSelectedItemForModal] = useState<DefaultLeadMagnet | null>(null);

  // Video playback & modal states
  const [selectedVideoForLead, setSelectedVideoForLead] = useState<DefaultBonusVideo | null>(null);
  const [unlockedVideoIds, setUnlockedVideoIds] = useState<Record<string, boolean>>({});
  const [activePlayingVideo, setActivePlayingVideo] = useState<{
    url: string;
    title: string;
    description?: string | null;
  } | null>(null);

  const activeItems = items.filter((item) => item.isActive !== false);

  // Filter videos that have a valid URL for the currently selected language
  const availableVideos = useMemo(() => {
    if (!videos || !Array.isArray(videos)) return [];
    return videos.filter((video) => {
      if (video.isActive === false) return false;
      const url = language === "pl" ? video.videoUrlPl : video.videoUrlUa;
      return Boolean(url && url.trim().length > 0);
    });
  }, [videos, language]);

  if (activeItems.length === 0 && availableVideos.length === 0) {
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

  const handleWatchVideo = (video: DefaultBonusVideo) => {
    const videoUrl = language === "pl" ? video.videoUrlPl : video.videoUrlUa;
    if (!videoUrl) return;

    if (video.id && unlockedVideoIds[video.id]) {
      setActivePlayingVideo({
        url: videoUrl,
        title: getLocalized(video, "title"),
        description: getLocalized(video, "description"),
      });
      return;
    }

    setSelectedVideoForLead(video);
  };

  const handleDownload = (item: DefaultLeadMagnet) => {
    setSelectedItemForModal(item);
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
        {activeItems.length > 0 && (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {activeItems.map((item, idx) => {
              const title = getLocalized(item, "title");
              const description = getLocalized(item, "description");
              const badge = getLocalized(item, "badge") || (language === "ua" ? "Безкоштовний PDF" : "Darmowy PDF");
              const buttonText = getLocalized(item, "buttonText") || (language === "ua" ? "Завантажити чек-лист" : "Pobierz checklist");
              const isDownloaded = Boolean(item.id && downloadedIds[item.id]);
              const displaySize =
                language === "pl"
                  ? item.fileSizePl || item.fileSize || item.fileSizeUa
                  : item.fileSizeUa || item.fileSize || item.fileSizePl;

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
                        {displaySize && (
                          <span className="text-[9px] text-charcoal-300 font-mono mt-0.5">
                            {displaySize}
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
                              {language === "ua" ? "Завантажити ще раз" : "Pobierz ponownie"}
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDownToLine className="w-4 h-4 text-gold-400" />
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
        )}

        {/* Bonus Videos Subsection - rendered ONLY if availableVideos.length > 0 for this language */}
        {availableVideos.length > 0 && (
          <div className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-[#E8DFC8]/60">
            {/* Video Sub-Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 text-gold-900 text-xs font-semibold tracking-wider uppercase mb-3 shadow-xs">
                <Play className="w-3 h-3 fill-current text-gold-700" />
                <span>
                  {language === "pl" ? "🎬 Bonusowe wideo-lekcje" : "🎬 Безкоштовні відеоуроки"}
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-charcoal-900 tracking-tight mb-3">
                {language === "pl"
                  ? "Oglądaj praktyczne techniki i sekrety pracy"
                  : "Дивіться практичні авторські відеоуроки"}
              </h3>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed max-w-2xl mx-auto">
                {language === "pl"
                  ? "Ekskluzywne materiały wideo z demonstracją technik, rozbiorem błędów i wskazówkami krok po kroku od Uliany."
                  : "Ексклюзивні відеоматеріали з живою демонстрацією, секретами швидкості та покроковим розбором помилок від Уляни."}
              </p>
            </motion.div>

            {/* Video Cards Grid */}
            <div
              className={`grid gap-6 sm:gap-8 ${
                availableVideos.length === 1
                  ? "max-w-xl mx-auto"
                  : "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
              }`}
            >
              {availableVideos.map((video, vIdx) => {
                const title = getLocalized(video, "title");
                const description = getLocalized(video, "description");
                const badge =
                  getLocalized(video, "badge") ||
                  (language === "ua" ? "Безкоштовний відеоурок" : "Darmowa lekcja wideo");
                const buttonText =
                  getLocalized(video, "buttonText") ||
                  (language === "ua" ? "Дивитися відео" : "Oglądaj wideo");
                const isUnlocked = Boolean(video.id && unlockedVideoIds[video.id]);

                return (
                  <motion.div
                    key={video.id || vIdx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: vIdx * 0.1 }}
                    className="group flex flex-col rounded-3xl bg-white border-2 border-gold-300/70 overflow-hidden shadow-card hover:shadow-glow transition-all duration-300"
                  >
                    {/* Video Visual / Cover Banner */}
                    <div
                      onClick={() => handleWatchVideo(video)}
                      className="relative w-full aspect-video bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-800 cursor-pointer overflow-hidden group/thumb"
                    >
                      {video.coverUrl ? (
                        <img
                          src={video.coverUrl}
                          alt={title}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,168,128,0.25)_0%,transparent_70%)]" />
                      )}

                      {/* Contrast gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/75 via-charcoal-950/20 to-charcoal-950/40 group-hover:via-charcoal-950/10 transition-colors z-10" />

                      {/* Play Button Overlay - ALWAYS centered */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold-500/90 text-white flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-500 group-active:scale-95 backdrop-blur-xs">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5 text-white drop-shadow-md" />
                        </div>
                      </div>

                      {/* Top Badges */}
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 pointer-events-none">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-charcoal-900/85 backdrop-blur-md text-gold-300 border border-gold-400/30 shadow-sm">
                          {badge}
                        </span>
                      </div>

                      {video.duration && (
                        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-950/85 backdrop-blur-md text-white text-[11px] font-mono shadow-sm pointer-events-none">
                          <Clock className="w-3 h-3 text-gold-400" />
                          <span>{video.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between gap-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          {video.viewsCount && video.viewsCount > 5 ? (
                            <span className="text-[11px] font-medium text-charcoal-500 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-gold-600" />
                              <span>
                                {language === "ua"
                                  ? `${video.viewsCount}+ переглядів`
                                  : `${video.viewsCount}+ wyświetleń`}
                              </span>
                            </span>
                          ) : null}
                          {isUnlocked && (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{language === "ua" ? "Доступ відкрито" : "Odblokowano"}</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900 leading-snug group-hover:text-gold-700 transition-colors">
                          {title}
                        </h4>

                        {description && (
                          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed line-clamp-3">
                            {description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => handleWatchVideo(video)}
                          className={`w-full py-3.5 px-6 rounded-2xl font-semibold text-xs sm:text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer ${
                            isUnlocked
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                              : "bg-charcoal-900 hover:bg-gold-600 text-white shadow-charcoal-900/20 hover:shadow-gold-500/30 active:scale-98"
                          }`}
                        >
                          <Play className="w-4 h-4 fill-current text-gold-300" />
                          <span>
                            {isUnlocked
                              ? language === "ua"
                                ? "Дивитися ще раз"
                                : "Oglądaj ponownie"
                              : buttonText}
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lead Capture Modal for PDF */}
      <LeadCaptureModal
        isOpen={Boolean(selectedItemForModal)}
        onClose={() => setSelectedItemForModal(null)}
        leadMagnetId={selectedItemForModal?.id}
        checklistTitle={selectedItemForModal ? getLocalized(selectedItemForModal, "title") : ""}
        language={language}
        t={t}
        mode="checklist"
        onSuccess={() => {
          if (selectedItemForModal?.id) {
            setDownloadedIds((prev) => ({ ...prev, [selectedItemForModal.id!]: true }));
          }
        }}
      />

      {/* Lead Capture Modal for Video */}
      <LeadCaptureModal
        isOpen={Boolean(selectedVideoForLead)}
        onClose={() => setSelectedVideoForLead(null)}
        videoId={selectedVideoForLead?.id}
        videoTitle={selectedVideoForLead ? getLocalized(selectedVideoForLead, "title") : ""}
        checklistTitle={selectedVideoForLead ? getLocalized(selectedVideoForLead, "title") : ""}
        language={language}
        t={t}
        mode="video"
        onVideoUnlocked={(resolvedUrl) => {
          if (selectedVideoForLead?.id) {
            setUnlockedVideoIds((prev) => ({ ...prev, [selectedVideoForLead.id!]: true }));
          }
          if (selectedVideoForLead) {
            setActivePlayingVideo({
              url:
                resolvedUrl ||
                (language === "pl" ? selectedVideoForLead.videoUrlPl! : selectedVideoForLead.videoUrlUa!),
              title: getLocalized(selectedVideoForLead, "title"),
              description: getLocalized(selectedVideoForLead, "description"),
            });
          }
        }}
      />

      {/* Video Player Modal */}
      {activePlayingVideo && (
        <VideoPlayerModal
          isOpen={Boolean(activePlayingVideo)}
          onClose={() => setActivePlayingVideo(null)}
          videoUrl={activePlayingVideo.url}
          title={activePlayingVideo.title}
          description={activePlayingVideo.description}
          language={language}
        />
      )}
    </section>
  );
}
