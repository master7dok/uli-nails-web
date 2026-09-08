"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Send, Menu, X, Sparkles, Globe } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#courses", label: t.nav.courses },
    { href: "#prices", label: t.nav.prices },
    { href: "#portfolio", label: t.nav.portfolio },
    { href: "#reviews", label: t.nav.reviews },
    { href: "#contacts", label: t.nav.contacts },
  ];

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
        <Link href="/" className="group flex flex-col items-start">
          <span className="font-serif text-xl sm:text-2xl tracking-[0.18em] font-semibold uppercase text-charcoal-800 transition-colors group-hover:text-gold-600">
            Uliana Nails
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-charcoal-500 font-medium -mt-0.5">
            Kraków • Gel Expert
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7 text-[13.5px] font-medium tracking-wide text-charcoal-700">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative transition-colors hover:text-gold-600 py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-gold-500 hover:after:w-full after:transition-all after:duration-250"
            >
              {link.label}
            </a>
          ))}
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
            href="https://instagram.com/uli.nails.krk"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram @uli.nails.krk"
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

          {/* Fast Course CTA */}
          <a
            href="#courses"
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
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#EBE4DA] px-6 py-6 shadow-xl animate-fadeIn">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-charcoal-800 hover:text-gold-600 py-1 border-b border-nude-100"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 flex items-center space-x-4">
              <a
                href="https://instagram.com/uli.nails.krk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-charcoal-700 hover:text-pink-600"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@uli.nails.krk</span>
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
            <a
              href="#courses"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-charcoal-800 hover:bg-gold-600 transition-colors shadow-sm"
            >
              {t.hero.primaryCta}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
