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

function detectLanguageFromLocation(): Language | null {
  if (typeof window === "undefined") return null;

  // 1. Pathname check: /ua, /pl, /ua/..., /pl/...
  const pathname = window.location.pathname.toLowerCase();
  if (pathname === "/ua" || pathname.startsWith("/ua/")) {
    return "ua";
  }
  if (pathname === "/pl" || pathname.startsWith("/pl/")) {
    return "pl";
  }

  // 2. Query param check: ?lang=ua, ?lang=pl
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get("lang")?.toLowerCase();
    if (langParam === "ua" || langParam === "pl") {
      return langParam as Language;
    }
  } catch {}

  return null;
}

function getInitialLanguage(defaultFallback: Language = "ua"): Language {
  // 1. Direct URL check (/ua, /pl, ?lang=ua, ?lang=pl)
  const fromUrl = detectLanguageFromLocation();
  if (fromUrl) {
    try {
      localStorage.setItem("uli_preferred_lang", fromUrl);
    } catch {}
    return fromUrl;
  }

  if (typeof window === "undefined") return defaultFallback;

  // 2. Check saved user preference
  try {
    const saved = localStorage.getItem("uli_preferred_lang") as Language;
    if (saved === "ua" || saved === "pl") {
      return saved;
    }
  } catch {}

  // 3. Check browser navigator language
  if (typeof navigator !== "undefined" && navigator.language) {
    if (navigator.language.toLowerCase().startsWith("pl")) {
      return "pl";
    }
  }

  return defaultFallback;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => getInitialLanguage("ua"));
  const [, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const syncLanguage = () => {
      const detected = detectLanguageFromLocation();
      if (detected) {
        setLanguageState(detected);
        try {
          localStorage.setItem("uli_preferred_lang", detected);
        } catch {}
        document.documentElement.lang = detected;
      } else {
        const saved = localStorage.getItem("uli_preferred_lang") as Language;
        if (saved === "ua" || saved === "pl") {
          setLanguageState(saved);
          document.documentElement.lang = saved;
        }
      }
    };

    syncLanguage();
    window.addEventListener("popstate", syncLanguage);
    return () => window.removeEventListener("popstate", syncLanguage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("uli_preferred_lang", lang);
      } catch {}
      document.documentElement.lang = lang;

      // Seamlessly update browser URL if currently on /, /ua, or /pl
      const pathname = window.location.pathname;
      if (pathname === "/" || pathname === "/ua" || pathname === "/pl") {
        const targetPath = lang === "pl" ? "/pl" : "/ua";
        if (pathname !== targetPath) {
          const newUrl = targetPath + window.location.search + window.location.hash;
          window.history.pushState(null, "", newUrl);
        }
      }
    }
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
