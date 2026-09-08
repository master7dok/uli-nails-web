"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations } from "@/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)["ua"];
  getLocalized: (item: any, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ua");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved language or browser preference
    const saved = localStorage.getItem("uli_preferred_lang") as Language;
    if (saved === "ua" || saved === "pl") {
      setLanguageState(saved);
    } else {
      // Default to UA or check navigator
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("pl")) {
        setLanguageState("pl");
      } else {
        setLanguageState("ua");
      }
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("uli_preferred_lang", lang);
    document.documentElement.lang = lang;
  };

  const getLocalized = (item: any, field: string): string => {
    if (!item) return "";
    const suffix = language === "pl" ? "Pl" : "Ua";
    const localizedKey = `${field}${suffix}`;
    if (item[localizedKey] !== undefined && item[localizedKey] !== null) {
      return item[localizedKey];
    }
    // Fallback to alternative
    const fallbackSuffix = language === "pl" ? "Ua" : "Pl";
    return item[`${field}${fallbackSuffix}`] || "";
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
    getLocalized,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
