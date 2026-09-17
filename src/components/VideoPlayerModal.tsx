"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Sparkles } from "lucide-react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  language: "ua" | "pl";
}

function getEmbedInfo(url: string): { type: "youtube" | "vimeo" | "native"; src: string } {
  if (!url) return { type: "native", src: "" };
  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      src: "https://www.youtube-nocookie.com/embed/" + ytMatch[1] + "?autoplay=1&rel=0&modestbranding=1",
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      src: "https://player.vimeo.com/video/" + vimeoMatch[1] + "?autoplay=1",
    };
  }

  return { type: "native", src: trimmed };
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  title,
  description,
  coverUrl,
  language,
}: VideoPlayerModalProps) {
  const [embed, setEmbed] = useState<{ type: "youtube" | "vimeo" | "native"; src: string }>({
    type: "native",
    src: "",
  });

  useEffect(() => {
    if (isOpen && videoUrl) {
      setEmbed(getEmbedInfo(videoUrl));
    }
  }, [isOpen, videoUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal-950/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-[#181514] rounded-3xl shadow-2xl border border-gold-400/25 z-10 overflow-hidden text-[#FAF8F5]"
        >
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-charcoal-800 bg-[#1F1C1B]">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gold-500/20 text-gold-300">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-medium text-white tracking-wide line-clamp-1">
                  {title}
                </h3>
                <span className="text-[11px] text-gold-300 uppercase tracking-widest font-mono">
                  {language === "pl" ? "Ekskluzywne wideo" : "Ексклюзивний відеоурок"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close video"
              className="p-2 rounded-full text-charcoal-300 hover:text-white hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full bg-black aspect-video flex items-center justify-center">
            {embed.type === "youtube" || embed.type === "vimeo" ? (
              <iframe
                src={embed.src}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : embed.src ? (
              <video
                src={embed.src}
                poster={coverUrl || undefined}
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                className="w-full h-full object-contain"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="p-8 text-center text-charcoal-400">
                <p>{language === "pl" ? "Wideo niedostępne" : "Відео тимчасово недоступне"}</p>
              </div>
            )}
          </div>

          {description && (
            <div className="p-5 sm:p-6 bg-[#1A1716] border-t border-charcoal-800/80">
              <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed max-w-3xl">
                {description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-gold-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === "pl"
                    ? "Wskazówka: Zastosuj te techniki podczas kolejnej stylizacji salonowej!"
                    : "Порада: Спробуйте повторити цю техніку вже на наступній клієнтці!"}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
