"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  User,
  GraduationCap,
  DollarSign,
  Camera,
  MessageSquareQuote,
  Layout,
  Globe,
  Info,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";
import { defaultSettings } from "@/lib/defaultData";

type Lang = "ua" | "pl";

export default function SiteTextsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({ ...defaultSettings });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeLang, setActiveLang] = useState<Lang>("ua");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("Failed to load settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || "Помилка збереження налаштувань");
    } finally {
      setSaving(false);
    }
  };

  const getVal = (keyBase: string, isLocalized: boolean = true) => {
    if (!isLocalized) {
      return settings[keyBase] ?? defaultSettings[keyBase] ?? "";
    }
    const fullKey = `${keyBase}_${activeLang}`;
    return settings[fullKey] ?? defaultSettings[fullKey] ?? "";
  };

  const setVal = (keyBase: string, value: string, isLocalized: boolean = true) => {
    if (!isLocalized) {
      handleChange(keyBase, value);
    } else {
      handleChange(`${keyBase}_${activeLang}`, value);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-card border border-nude-200 text-center flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-gold-600" />
        <p className="text-sm font-medium text-charcoal-600">Завантаження текстів сайту...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Header & Floating Action Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sticky top-20 z-30 backdrop-blur-md bg-white/95">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-2xl font-bold text-charcoal-900">
              Редагування тексту сайту
            </h3>
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Збережено!</span>
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Керуйте всіма заголовками, описами, статистикою та акціями на сайті
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Language Selector Pill */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-nude-100 border border-nude-300">
            <button
              type="button"
              onClick={() => setActiveLang("ua")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeLang === "ua"
                  ? "bg-white text-charcoal-900 shadow-xs"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <span>🇺🇦</span>
              <span>Українська</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("pl")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeLang === "pl"
                  ? "bg-white text-charcoal-900 shadow-xs"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              <span>🇵🇱</span>
              <span>Polski</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-gold-300" />
            )}
            <span>{saving ? "Збереження..." : "Зберегти всі зміни"}</span>
          </button>
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <a href="#sec-hero" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          1. Головний екран (Hero)
        </a>
        <a href="#sec-about" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          2. Про Уляну (About)
        </a>
        <a href="#sec-courses" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          3. Курси & Акції
        </a>
        <a href="#sec-prices" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          4. Прайс-лист
        </a>
        <a href="#sec-portfolio" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          5. Портфоліо
        </a>
        <a href="#sec-testimonials" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          6. Відгуки
        </a>
        <a href="#sec-footer" className="px-3.5 py-1.5 rounded-xl bg-white border border-nude-200 text-charcoal-700 hover:border-gold-500 hover:text-gold-700 whitespace-nowrap shadow-2xs font-medium">
          7. Підвал (Footer)
        </a>
      </div>

      {/* 1. HERO SECTION */}
      <div id="sec-hero" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-6 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gold-50 border border-gold-300 text-gold-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              1. Головний екран (Hero)
            </h4>
            <p className="text-xs text-charcoal-500">
              Головний банер зверху сторінки, 4 рядки великого заголовку та 3 показники статистики
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок — Рядок 1 ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_hero_titleLine1")}
              onChange={(e) => setVal("text_hero_titleLine1", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-nude-50/50"
              placeholder="Архітектура гелю,"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок — Рядок 2 (Золотий курсив)
            </label>
            <input
              type="text"
              value={getVal("text_hero_titleLine2")}
              onChange={(e) => setVal("text_hero_titleLine2", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-gold-50/40 text-gold-900 font-medium"
              placeholder="чистий манікюр"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок — Рядок 3 ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_hero_titleLine3")}
              onChange={(e) => setVal("text_hero_titleLine3", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-nude-50/50"
              placeholder="та професійне"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок — Рядок 4 ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_hero_titleLine4")}
              onChange={(e) => setVal("text_hero_titleLine4", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-nude-50/50"
              placeholder="наставництво"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Підзаголовок / Текст-опис під заголовком ({activeLang.toUpperCase()})
          </label>
          <textarea
            rows={2}
            value={getVal("text_hero_subtitle")}
            onChange={(e) => setVal("text_hero_subtitle", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none leading-relaxed"
            placeholder="Авторські офлайн-курси з нуля та підвищення кваліфікації..."
          />
        </div>

        {/* Hero Stats */}
        <div className="pt-3 border-t border-nude-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
            Статистика в Hero (3 показники)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-2xl bg-nude-50 border border-nude-200 space-y-2">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 1 (Учениці)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getVal("text_hero_stat1_value", false)}
                  onChange={(e) => setVal("text_hero_stat1_value", e.target.value, false)}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs font-bold text-charcoal-900 bg-white"
                  placeholder="120+"
                />
                <input
                  type="text"
                  value={getVal("text_hero_stat1_label")}
                  onChange={(e) => setVal("text_hero_stat1_label", e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs text-charcoal-800 bg-white"
                  placeholder="учениць"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-nude-50 border border-nude-200 space-y-2">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 2 (Досвід)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getVal("text_hero_stat2_value", false)}
                  onChange={(e) => setVal("text_hero_stat2_value", e.target.value, false)}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs font-bold text-charcoal-900 bg-white"
                  placeholder="6+"
                />
                <input
                  type="text"
                  value={getVal("text_hero_stat2_label")}
                  onChange={(e) => setVal("text_hero_stat2_label", e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs text-charcoal-800 bg-white"
                  placeholder="років досвіду"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-nude-50 border border-nude-200 space-y-2">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 3 (Швидкість)</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getVal("text_hero_stat3_value", false)}
                  onChange={(e) => setVal("text_hero_stat3_value", e.target.value, false)}
                  className="w-16 px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs font-bold text-charcoal-900 bg-white"
                  placeholder="75"
                />
                <input
                  type="text"
                  value={getVal("text_hero_stat3_unit")}
                  onChange={(e) => setVal("text_hero_stat3_unit", e.target.value)}
                  className="w-14 px-2 py-1.5 rounded-lg border border-nude-300 text-xs text-charcoal-800 bg-white text-center"
                  placeholder="хв"
                />
                <input
                  type="text"
                  value={getVal("text_hero_stat3_label")}
                  onChange={(e) => setVal("text_hero_stat3_label", e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs text-charcoal-800 bg-white"
                  placeholder="середня швидкість"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ABOUT SECTION */}
      <div id="sec-about" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-6 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              2. Секція &quot;Про мене&quot; (About)
            </h4>
            <p className="text-xs text-charcoal-500">
              Заголовок, 3 абзаци історії/методики, 4 ключові переваги та 4 блоки статистики
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Головний заголовок секції ({activeLang.toUpperCase()})
          </label>
          <input
            type="text"
            value={getVal("text_about_title")}
            onChange={(e) => setVal("text_about_title", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none font-medium"
            placeholder="Привіт, я Уляна"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-charcoal-700">
            3 Текстові абзаци біографії та підходу ({activeLang.toUpperCase()})
          </label>
          <div>
            <span className="text-[11px] text-charcoal-500 block mb-1">Абзац 1: Професійний підхід та безпека</span>
            <textarea
              rows={2}
              value={getVal("text_about_p1")}
              onChange={(e) => setVal("text_about_p1", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none leading-relaxed"
            />
          </div>
          <div>
            <span className="text-[11px] text-charcoal-500 block mb-1">Абзац 2: Складні нігті та швидкість</span>
            <textarea
              rows={2}
              value={getVal("text_about_p2")}
              onChange={(e) => setVal("text_about_p2", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none leading-relaxed"
            />
          </div>
          <div>
            <span className="text-[11px] text-charcoal-500 block mb-1">Абзац 3: Офлайн-курси та навчання команд</span>
            <textarea
              rows={2}
              value={getVal("text_about_p3")}
              onChange={(e) => setVal("text_about_p3", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* 4 Features */}
        <div className="pt-3 border-t border-nude-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
            4 Ключові переваги (пункти з галочками)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-charcoal-500 block mb-1">Пункт 1</span>
              <input
                type="text"
                value={getVal("text_about_feature1")}
                onChange={(e) => setVal("text_about_feature1", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] text-charcoal-500 block mb-1">Пункт 2</span>
              <input
                type="text"
                value={getVal("text_about_feature2")}
                onChange={(e) => setVal("text_about_feature2", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] text-charcoal-500 block mb-1">Пункт 3</span>
              <input
                type="text"
                value={getVal("text_about_feature3")}
                onChange={(e) => setVal("text_about_feature3", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] text-charcoal-500 block mb-1">Пункт 4</span>
              <input
                type="text"
                value={getVal("text_about_feature4")}
                onChange={(e) => setVal("text_about_feature4", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4 About Stats */}
        <div className="pt-3 border-t border-nude-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-3">
            Статистика в секції About (4 показники)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-nude-50 border border-nude-200 space-y-1.5">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 1</span>
              <input
                type="text"
                value={getVal("text_about_stat1_value", false)}
                onChange={(e) => setVal("text_about_stat1_value", e.target.value, false)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-xs font-bold bg-white"
                placeholder="6+"
              />
              <input
                type="text"
                value={getVal("text_about_stat1_label")}
                onChange={(e) => setVal("text_about_stat1_label", e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-[11px] bg-white"
                placeholder="Років у nail-індустрії"
              />
            </div>

            <div className="p-3 rounded-2xl bg-nude-50 border border-nude-200 space-y-1.5">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 2</span>
              <input
                type="text"
                value={getVal("text_about_stat2_value", false)}
                onChange={(e) => setVal("text_about_stat2_value", e.target.value, false)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-xs font-bold bg-white"
                placeholder="120+"
              />
              <input
                type="text"
                value={getVal("text_about_stat2_label")}
                onChange={(e) => setVal("text_about_stat2_label", e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-[11px] bg-white"
                placeholder="Випускниць та майстрів салонів"
              />
            </div>

            <div className="p-3 rounded-2xl bg-nude-50 border border-nude-200 space-y-1.5">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 3</span>
              <input
                type="text"
                value={getVal("text_about_stat3_value", false)}
                onChange={(e) => setVal("text_about_stat3_value", e.target.value, false)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-xs font-bold bg-white"
                placeholder="850+"
              />
              <input
                type="text"
                value={getVal("text_about_stat3_label")}
                onChange={(e) => setVal("text_about_stat3_label", e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-[11px] bg-white"
                placeholder="Задоволених постійних клієнтів"
              />
            </div>

            <div className="p-3 rounded-2xl bg-nude-50 border border-nude-200 space-y-1.5">
              <span className="text-[11px] font-semibold text-charcoal-500 block">Показник 4</span>
              <input
                type="text"
                value={getVal("text_about_stat4_value", false)}
                onChange={(e) => setVal("text_about_stat4_value", e.target.value, false)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-xs font-bold bg-white"
                placeholder="28+"
              />
              <input
                type="text"
                value={getVal("text_about_stat4_label")}
                onChange={(e) => setVal("text_about_stat4_label", e.target.value)}
                className="w-full px-2 py-1 rounded-lg border border-nude-300 text-[11px] bg-white"
                placeholder="Днів гарантії носіння"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. COURSES SECTION */}
      <div id="sec-courses" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-6 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              3. Секція &quot;Курси та Менторинг&quot;
            </h4>
            <p className="text-xs text-charcoal-500">
              Заголовок секції, акційний банер з подругою та інформаційні плашки
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок секції курсів ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_courses_title")}
              onChange={(e) => setVal("text_courses_title", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Програми навчання та менторингу"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Підзаголовок секції курсів ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_courses_subtitle")}
              onChange={(e) => setVal("text_courses_subtitle", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Від впевненого старту з нуля до філігранного володіння..."
            />
          </div>
        </div>

        {/* Promo banner with friend */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50/70 to-rose-50/70 border border-pink-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Банер знижки &quot;Приходь з подругою!&quot;
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                Заголовок банера
              </label>
              <input
                type="text"
                value={getVal("text_courses_promo_title")}
                onChange={(e) => setVal("text_courses_promo_title", e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-pink-300 text-xs bg-white"
                placeholder="Приходь з подругою! 🤍"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
                Бейдж знижки
              </label>
              <input
                type="text"
                value={getVal("text_courses_promo_badge")}
                onChange={(e) => setVal("text_courses_promo_badge", e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-pink-300 text-xs font-bold text-rose-800 bg-white"
                placeholder="-250 zł"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">
              Опис акції
            </label>
            <textarea
              rows={2}
              value={getVal("text_courses_promo_text")}
              onChange={(e) => setVal("text_courses_promo_text", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-pink-300 text-xs bg-white leading-relaxed"
              placeholder="Навчатися вдвох ефективніше та веселіше..."
            />
          </div>
        </div>

        {/* Curriculum Notice & Booking Rule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-nude-50 border border-nude-200 space-y-2">
            <label className="block text-xs font-bold text-charcoal-900">
              Плашка: Індивідуальна адаптація
            </label>
            <input
              type="text"
              value={getVal("text_courses_personalized_title")}
              onChange={(e) => setVal("text_courses_personalized_title", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs font-semibold bg-white mb-1"
              placeholder="Індивідуальна адаптація програми:"
            />
            <textarea
              rows={3}
              value={getVal("text_courses_personalized_text")}
              onChange={(e) => setVal("text_courses_personalized_text", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs bg-white leading-relaxed"
            />
          </div>

          <div className="p-4 rounded-2xl bg-nude-50 border border-nude-200 space-y-2">
            <label className="block text-xs font-bold text-charcoal-900">
              Плашка: Умови бронювання
            </label>
            <input
              type="text"
              value={getVal("text_courses_booking_title")}
              onChange={(e) => setVal("text_courses_booking_title", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs font-semibold bg-white mb-1"
              placeholder="Умови бронювання:"
            />
            <textarea
              rows={3}
              value={getVal("text_courses_booking_text")}
              onChange={(e) => setVal("text_courses_booking_text", e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs bg-white leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 4. PRICE LIST SECTION */}
      <div id="sec-prices" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-4 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              4. Секція &quot;Прайс-лист&quot;
            </h4>
            <p className="text-xs text-charcoal-500">
              Заголовок та підзаголовок над списком категорій та цін
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок секції ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_prices_title")}
              onChange={(e) => setVal("text_prices_title", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none font-medium"
              placeholder="Естетичні послуги"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Підзаголовок секції ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_prices_subtitle")}
              onChange={(e) => setVal("text_prices_subtitle", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Преміальні матеріали, одноразові розхідники та повна безпека."
            />
          </div>
        </div>
      </div>

      {/* 5. PORTFOLIO SECTION */}
      <div id="sec-portfolio" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-4 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              5. Секція &quot;Портфоліо / Галерея&quot;
            </h4>
            <p className="text-xs text-charcoal-500">
              Бейдж, заголовок та підзаголовок фотогалереї
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Бейдж секції
            </label>
            <input
              type="text"
              value={getVal("text_portfolio_badge")}
              onChange={(e) => setVal("text_portfolio_badge", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Галерея робіт"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_portfolio_title")}
              onChange={(e) => setVal("text_portfolio_title", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none font-medium"
              placeholder="Фірмова естетика"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Підзаголовок ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_portfolio_subtitle")}
              onChange={(e) => setVal("text_portfolio_subtitle", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Тонкі міцні торці, чистий зріз та бездоганний блік..."
            />
          </div>
        </div>
      </div>

      {/* 6. TESTIMONIALS SECTION */}
      <div id="sec-testimonials" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-4 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <MessageSquareQuote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              6. Секція &quot;Відгуки та результати&quot;
            </h4>
            <p className="text-xs text-charcoal-500">
              Заголовки секції з картками відгуків клієнтів та учениць
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Бейдж секції
            </label>
            <input
              type="text"
              value={getVal("text_testimonials_badge")}
              onChange={(e) => setVal("text_testimonials_badge", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Відгуки та результати"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Заголовок ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_testimonials_title")}
              onChange={(e) => setVal("text_testimonials_title", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none font-medium"
              placeholder="Що кажуть учениці та клієнти"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
              Підзаголовок ({activeLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={getVal("text_testimonials_subtitle")}
              onChange={(e) => setVal("text_testimonials_subtitle", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              placeholder="Реальні історії майстрів, які змінили свій підхід..."
            />
          </div>
        </div>
      </div>

      {/* 7. FOOTER SECTION */}
      <div id="sec-footer" className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-4 scroll-mt-36">
        <div className="flex items-center gap-3 border-b border-nude-200 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-charcoal-100 text-charcoal-800 flex items-center justify-center">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              7. Підвал сайту (Footer)
            </h4>
            <p className="text-xs text-charcoal-500">
              Текстовий опис простору та авторського наставництва у підвалі
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
            Опис бренду та місії ({activeLang.toUpperCase()})
          </label>
          <textarea
            rows={2}
            value={getVal("text_footer_about_brand")}
            onChange={(e) => setVal("text_footer_about_brand", e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none leading-relaxed"
            placeholder="Професійний простір краси нігтів та авторського наставництва..."
          />
        </div>
      </div>

      {/* Bottom Save Button Bar */}
      <div className="flex items-center justify-between p-6 bg-white rounded-3xl shadow-card border border-nude-200">
        <span className="text-xs text-charcoal-500">
          Усі зміни зберігаються миттєво в базі даних після натискання &quot;Зберегти&quot;.
        </span>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-gold-300" />
          )}
          <span>{saving ? "Збереження..." : "Зберегти всі зміни"}</span>
        </button>
      </div>
    </form>
  );
}

