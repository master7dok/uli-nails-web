"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Send, Menu, X, Sparkles, Globe, Lock, User } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { getInstagramLink } from "@/lib/settingsHelper";
import StudentLoginModal from "./StudentLoginModal";

interface HeaderProps {
  settings?: Record<string, string>;
}

export default function Header({ settings }: HeaderProps = {}) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);

  useEffect(() => {
    // Check if student is logged in
    fetch("/api/student/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsStudentLoggedIn(true);
        }
      })
      .catch(() => {});

    const handleLoginEvent = () => setIsStudentLoggedIn(true);
    window.addEventListener("student:logged-in", handleLoginEvent);
    return () => window.removeEventListener("student:logged-in", handleLoginEvent);
  }, []);

  const instagram = getInstagramLink(language, settings);
  const showOnlineCourses = settings?.show_online_courses === "true";

  const navLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#courses", label: t.nav.courses },
    ...(showOnlineCourses
      ? [
          {
            href: "#online-courses",
            label: (t.nav as any).onlineCourses || (language === "ua" ? "Онлайн-курси" : "Kursy online"),
          },
        ]
      : []),
    { href: "#checklist", label: t.nav.checklist || (language === "ua" ? "Корисне" : "Przydatne") },
    { href: "#training", label: (t.nav as any).training || (language === "ua" ? "Фото з курсів" : "Zdjęcia ze szkoleń") },
    { href: "#prices", label: t.nav.prices },
    { href: "#portfolio", label: t.nav.portfolio },
    { href: "#reviews", label: t.nav.reviews },
    { href: "#contacts", label: t.nav.contacts },
  ];

  const sectionIds = [
    "about",
    "courses",
    ...(showOnlineCourses ? ["online-courses"] : []),
    "checklist",
    "training",
    "prices",
    "portfolio",
    "reviews",
    "contacts",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Check if user has scrolled near bottom of page (activate contacts footer)
      const isBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 120;

      if (isBottom) {
        setActiveSection("contacts");
        return;
      }

      // Check section positions relative to viewport with header offset
      const offset = 140;
      let currentSection = "";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset && rect.bottom > offset) {
            currentSection = id;
            break;
          }
        }
      }

      // Fallback if between sections
      if (!currentSection && window.scrollY > 150) {
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= offset) {
              currentSection = id;
            }
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Check hash on mount & hash change
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hashId = window.location.hash.replace("#", "");
        if (sectionIds.includes(hashId)) {
          setActiveSection(hashId);
        }
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", checkHash);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FAF8F5]/90 backdrop-blur-md shadow-soft border-b border-[#EBE4DA]/70 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          onClick={() => setActiveSection("")}
          className="group flex flex-col items-start"
        >
          <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] font-semibold uppercase text-charcoal-800 transition-colors group-hover:text-gold-600">
            Uliana Nails
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-charcoal-500 font-medium -mt-0.5">
            Kraków • Gel Expert
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7 text-[13.5px] tracking-wide">
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveSection(sectionId)}
                className={`relative py-1 transition-all duration-200 ${
                  isActive
                    ? "text-gold-600 font-semibold after:w-full after:bg-gold-500"
                    : "text-charcoal-700 hover:text-gold-600 after:w-0 hover:after:w-full after:bg-gold-500/70 font-medium"
                } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:transition-all after:duration-250`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Actions (Language Switcher + Socials + CTA) */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#EFE9DF]/70 p-1 rounded-full border border-[#E4D9CA]">
            <button
              onClick={() => setLanguage("ua")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                language === "ua"
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-800"
              }`}
            >
              UA
            </button>
            <button
              onClick={() => setLanguage("pl")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                language === "pl"
                  ? "bg-white text-charcoal-900 shadow-sm"
                  : "text-charcoal-500 hover:text-charcoal-800"
              }`}
            >
              PL
            </button>
          </div>

          {/* Social Icons */}
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`Instagram ${instagram.handle}`}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#EFE9DF]/60 text-charcoal-700 hover:text-pink-600 hover:bg-blush-100 transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />
          </a>

          <a
            href="https://t.me/uliana_p_u"
            target="_blank"
            rel="noopener noreferrer"
            title="Telegram @uliana_p_u"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#EFE9DF]/60 text-charcoal-700 hover:text-sky-600 hover:bg-sky-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </a>

          {/* Student Area Button */}
          {isStudentLoggedIn ? (
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gold-400 bg-gold-50/90 text-gold-900 hover:bg-gold-100 transition-colors shadow-xs"
              title={language === "ua" ? "Кабінет учня" : "Strefa studenta"}
            >
              <User className="w-3.5 h-3.5 text-gold-600" />
              <span>{language === "ua" ? "Кабінет" : "Konto"}</span>
            </Link>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#E4D9CA] bg-white/90 hover:bg-[#EFE9DF]/80 text-charcoal-700 hover:text-charcoal-900 transition-colors shadow-xs"
              title={language === "ua" ? "Вхід для учнів курсів" : "Logowanie dla studentów"}
            >
              <Lock className="w-3.5 h-3.5 text-gold-600" />
              <span>{language === "ua" ? "Вхід" : "Zaloguj"}</span>
            </button>
          )}

          {/* Fast Course CTA */}
          <a
            href="#courses"
            onClick={() => setActiveSection("courses")}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-charcoal-800 hover:bg-gold-600 rounded-full transition-all shadow-sm hover:shadow-soft"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-300" />
            <span>{t.hero.primaryCta}</span>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-lg text-charcoal-800 hover:bg-[#EFE9DF] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#EBE4DA] px-5 py-5 shadow-xl animate-fadeIn">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const sectionId = link.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setActiveSection(sectionId);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                    isActive
                      ? "bg-gold-50/90 text-gold-800 font-semibold border-l-4 border-gold-500 pl-4 shadow-xs"
                      : "text-charcoal-800 hover:text-gold-600 hover:bg-[#F5F2EB]/50 font-medium"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-gold-500 shadow-sm" />
                  )}
                </a>
              );
            })}
            <div className="pt-3 border-t border-nude-200/80 flex items-center space-x-4">
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-pink-600"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>{instagram.handle}</span>
              </a>
              <a
                href="https://t.me/uliana_p_u"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-sky-600"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>
            </div>

            {/* Student Login / Cabinet in Mobile Drawer */}
            {isStudentLoggedIn ? (
              <Link
                href="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-gold-900 bg-gold-100/90 hover:bg-gold-200 border border-gold-300 transition-colors"
              >
                <User className="w-4 h-4 text-gold-700" />
                <span>{language === "ua" ? "Кабінет учня" : "Strefa studenta"}</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginModalOpen(true);
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-charcoal-800 bg-white border border-[#E4D9CA] hover:bg-[#EFE9DF] transition-colors"
              >
                <Lock className="w-4 h-4 text-gold-600" />
                <span>{language === "ua" ? "Вхід для учнів" : "Zaloguj się (Kursy)"}</span>
              </button>
            )}

            <a
              href="#courses"
              onClick={() => {
                setActiveSection("courses");
                setMobileMenuOpen(false);
              }}
              className="mt-2 w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-charcoal-800 hover:bg-gold-600 transition-colors shadow-sm"
            >
              {t.hero.primaryCta}
            </a>
          </nav>
        </div>
      )}

      {/* Student Login Modal */}
      <StudentLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </header>
  );
}
