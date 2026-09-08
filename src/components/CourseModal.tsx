"use client";

import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X, ExternalLink, Sparkles } from "lucide-react";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  formUrl?: string;
}

const DEFAULT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdk9UJoxIHIZtMvzwyGVjLawvwQ9MqqspUCmedYQyR4xv-h_g/viewform?usp=header";

export default function CourseModal({
  isOpen,
  onClose,
  courseTitle,
  formUrl = DEFAULT_FORM_URL,
}: CourseModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-nude-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-nude-200 bg-white/70 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.courses.modalTitle}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-900">
              {courseTitle || t.courses.title}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
              {t.courses.modalDesc}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-nude-100 hover:bg-nude-200 flex items-center justify-center text-charcoal-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content: Google Form iframe */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-white/40">
          <iframe
            src={formUrl}
            width="100%"
            height="550"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="rounded-xl border border-nude-200 w-full"
            title="Course Application Google Form"
          >
            Loading questionnaire...
          </iframe>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-nude-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-charcoal-500 text-center sm:text-left">
            {t.courses.personalizedNotice}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={formUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-nude-100 hover:bg-nude-200 text-charcoal-800 font-medium transition-colors"
            >
              <span>{t.courses.openInNewTab}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-900 text-white font-medium transition-colors"
            >
              {t.courses.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
