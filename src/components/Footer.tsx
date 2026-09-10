"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Send, MapPin, Phone, Lock, Heart } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { getSettingText } from "@/lib/settingsHelper";

interface FooterProps {
  settings?: Record<string, string>;
}

export default function Footer({ settings }: FooterProps) {
  const { language, t } = useLanguage();

  return (
    <footer id="contacts" className="bg-[#1F1C1B] text-[#E8DFD8] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#35302E]">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col">
            <span className="font-serif text-2xl tracking-[0.18em] font-semibold uppercase text-white mb-2">
              Uliana Nails
            </span>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-400 font-medium mb-4">
              Kraków • Gel Expert & Mentor
            </span>
            <p className="text-sm text-[#A89F99] leading-relaxed max-w-sm mb-6">
              {getSettingText(settings, "text_footer_about_brand", language, t.footer.aboutBrand)}
            </p>

            {/* Social Badges */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/uli.nails.krk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#2E2826] hover:bg-pink-900/60 border border-[#443D3A] flex items-center justify-center text-[#E8DFD8] hover:text-white transition-colors"
                title="Instagram @uli.nails.krk"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              <a
                href="https://instagram.com/uli.nail.krk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#2E2826] hover:bg-pink-900/60 border border-[#443D3A] flex items-center justify-center text-[#E8DFD8] hover:text-white transition-colors"
                title="Instagram @uli.nail.krk"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              <a
                href="https://t.me/uliana_p_u"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#2E2826] hover:bg-sky-900/60 border border-[#443D3A] flex items-center justify-center text-[#E8DFD8] hover:text-white transition-colors"
                title="Telegram @uliana_p_u"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A89F99]">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#courses" className="hover:text-white transition-colors">
                  {t.nav.courses}
                </a>
              </li>
              <li>
                <a href="#prices" className="hover:text-white transition-colors">
                  {t.nav.prices}
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors">
                  {t.nav.portfolio}
                </a>
              </li>
              <li>
                <a href="#reviews" className="hover:text-white transition-colors">
                  {t.nav.reviews}
                </a>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-4">
              {t.footer.contacts}
            </h4>
            <div className="space-y-3 text-sm text-[#A89F99]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                <span>{t.footer.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <InstagramIcon className="w-4 h-4 text-gold-500 shrink-0" />
                <span>@uli.nails.krk / @uli.nail.krk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Telegram: @uliana_p_u</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#877E78]">
          <p>© {new Date().getFullYear()} Uliana Nails. {t.footer.rights}</p>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[#877E78] hover:text-gold-400 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>{t.footer.adminLogin}</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
