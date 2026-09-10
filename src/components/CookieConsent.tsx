"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "uli_cookie_consent";

export default function CookieConsent() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small delay for smooth appearance
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is blocked
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {}
    setVisible(false);
  };

  const handleNecessary = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "necessary");
    } catch {}
    setVisible(false);
  };

  if (!mounted) return null;

  const isPl = language === "pl";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-2xl bg-[#1D1918]/95 backdrop-blur-md text-[#EFE8E1] border border-[#3E3531] shadow-2xl"
          role="dialog"
          aria-live="polite"
          aria-label={isPl ? "Zgoda na pliki cookies" : "Згода на файли cookie"}
        >
          <div className="flex items-start gap-3.5 mb-3.5">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs leading-relaxed text-[#C7BDB5]">
              <p className="font-semibold text-white text-sm mb-1">
                {isPl ? "Prywatność i Pliki Cookies" : "Приватність та Файли Cookie"}
              </p>
              {isPl ? (
                <>
                  Używamy niezbędnych plików cookies oraz pamięci lokalnej (LocalStorage), aby zapamiętać Twój wybór języka oraz zapewnić prawidłowe działanie serwisu. Szczegóły znajdziesz w{" "}
                  <Link
                    href="/privacy"
                    className="text-gold-400 underline hover:text-gold-300 transition-colors"
                  >
                    Polityce Prywatności
                  </Link>
                  .
                </>
              ) : (
                <>
                  Ми використовуємо необхідні файли cookie та локальну пам&apos;ять (LocalStorage) для збереження вибору мови та безпечної роботи сайту. Детальніше в{" "}
                  <Link
                    href="/privacy"
                    className="text-gold-400 underline hover:text-gold-300 transition-colors"
                  >
                    Політиці конфіденційності
                  </Link>
                  .
                </>
              )}
            </div>
            <button
              onClick={handleNecessary}
              aria-label={isPl ? "Zamknij" : "Закрити"}
              className="text-[#8E837B] hover:text-white transition-colors p-1 -mr-1 -mt-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#332C29]">
            <button
              onClick={handleNecessary}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#B8AEA5] hover:text-white hover:bg-[#2A2421] transition-colors"
            >
              {isPl ? "Tylko niezbędne" : "Лише необхідні"}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-charcoal-900 bg-gold-400 hover:bg-gold-300 transition-colors shadow-sm"
            >
              {isPl ? "Akceptuję" : "Погоджуюсь"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
