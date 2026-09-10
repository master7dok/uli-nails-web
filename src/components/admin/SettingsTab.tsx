"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Save,
  Check,
  Link as LinkIcon,
  Send,
  MapPin,
  Upload,
  Camera,
  Sparkles,
  Info,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import { getAdminHeaders } from "@/lib/adminClient";

export default function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({
    google_form_url: "",
    instagram_primary: "@uli.nails.krk",
    instagram_secondary: "@uli.nail.krk",
    telegram_handle: "uliana_p_u",
    location: "Kraków, Polska",
    hero_photo_url:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop",
    about_main_photo_url:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop",
    about_secondary_photo_url:
      "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    setSuccessKey(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // 1. Upload file
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAdminHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const uploadedUrl = data.url;

      // 2. Update local state
      const newSettings = { ...settings, [key]: uploadedUrl };
      setSettings(newSettings);

      // 3. Immediately auto-save to database
      await fetch("/api/settings", {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newSettings),
      });

      setSuccessKey(key);
      setTimeout(() => setSuccessKey(null), 4000);
    } catch (err: any) {
      alert(err.message || "Помилка при завантаженні фото");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const photoSections = [
    {
      key: "hero_photo_url",
      title: "Головне фото профілю (Hero Section)",
      subtitle: "Фото Уляни у першому блоці сайту замість початкового фото",
      aspect: "aspect-[4/5]",
      recommendation: "Вертикальне фото майстра високої якості",
    },
    {
      key: "about_main_photo_url",
      title: "Основне фото блоку 'Про майстра' (#about)",
      subtitle: "Головне фото в блоці біографії та експертизи",
      aspect: "aspect-[3/4]",
      recommendation: "Фото за роботою або портрет",
    },
    {
      key: "about_secondary_photo_url",
      title: "Додаткове фото деталей (#about)",
      subtitle: "Маленьке фото крупного плану манікюру поруч з основним",
      aspect: "aspect-square",
      recommendation: "Крупний план ідеального гелю / кутикули",
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* 1. PHOTO MANAGEMENT CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-nude-200 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-nude-100">
          <div className="w-10 h-10 rounded-2xl bg-gold-500/15 flex items-center justify-center text-gold-700 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-charcoal-900">
              Фото Профілю та Секції &ldquo;Про майстра&rdquo;
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Натисніть кнопку під фото, щоб обрати будь-яке фото з телефону або комп&apos;ютера. Воно збережеться автоматично!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {photoSections.map((item) => {
            const currentUrl = settings[item.key] || "";
            const isUploading = uploadingKey === item.key;
            const isSuccess = successKey === item.key;

            return (
              <div
                key={item.key}
                className="flex flex-col p-4 rounded-2xl bg-nude-50/70 border-2 border-nude-200 hover:border-gold-400/60 transition-colors justify-between space-y-3"
              >
                <div>
                  <h4 className="font-serif font-semibold text-sm text-charcoal-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-charcoal-500 mt-1 mb-3">
                    {item.subtitle}
                  </p>

                  {/* Image Preview Container */}
                  <div
                    className={`relative w-full ${item.aspect} rounded-xl overflow-hidden bg-nude-200 border border-nude-300 shadow-xs mb-3`}
                  >
                    {currentUrl ? (
                      <Image
                        src={currentUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">
                        Немає фото
                      </div>
                    )}

                    {isUploading && (
                      <div className="absolute inset-0 bg-charcoal-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-semibold gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Завантаження...</span>
                      </div>
                    )}

                    {isSuccess && (
                      <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-1 text-center p-2 animate-fadeIn">
                        <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                        <span>Збережено на сайті!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* PROMINENT FILE UPLOAD BUTTON */}
                  <label className="w-full cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-soft hover:shadow-glow text-center">
                    <Upload className="w-4 h-4 text-gold-300 shrink-0" />
                    <span>Обрати фото з пристрою</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(item.key, file);
                      }}
                    />
                  </label>

                  {/* Collapsed/Optional URL fallback */}
                  <div className="pt-1">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400 block mb-1">
                      Або прямий лінк (за бажанням):
                    </span>
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, [item.key]: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs focus:border-gold-500 focus:outline-none bg-white text-charcoal-800"
                    />
                  </div>

                  <span className="text-[10px] text-charcoal-400 block text-center">
                    {item.recommendation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. GENERAL SETTINGS & CONTACTS CARD */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-nude-200 space-y-5">
        <h3 className="font-serif text-xl font-semibold text-charcoal-900">
          Загальні налаштування та контакти
        </h3>
        <p className="text-xs text-charcoal-500">
          Керуйте анкетою запису на курси та контактами для запису клієнтів
        </p>

        {/* Google Form Link */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-gold-700" />
            <span>Посилання на Google Form (Анкета для курсів)</span>
          </label>
          <input
            type="text"
            value={settings.google_form_url || ""}
            onChange={(e) =>
              setSettings({ ...settings, google_form_url: e.target.value })
            }
            placeholder="https://docs.google.com/forms/..."
            className="w-full px-4 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
          />
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Це посилання відкривається в модальному вікні при натисканні кнопки &ldquo;Подати заявку на курс&rdquo;.
          </span>
        </div>

        {/* Instagram Primary */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
            <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
            <span>Польський профіль Instagram (PL версія сайту)</span>
          </label>
          <input
            type="text"
            value={settings.instagram_primary || ""}
            onChange={(e) =>
              setSettings({ ...settings, instagram_primary: e.target.value })
            }
            placeholder="@uli.nails.krk"
            className="w-full px-4 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
          />
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Використовується для посилань, коли відвідувач переглядає сайт польською мовою (PL).
          </span>
        </div>

        {/* Instagram Secondary */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
            <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
            <span>Український профіль Instagram (UA версія сайту)</span>
          </label>
          <input
            type="text"
            value={settings.instagram_secondary || ""}
            onChange={(e) =>
              setSettings({ ...settings, instagram_secondary: e.target.value })
            }
            placeholder="@uli.nail.krk"
            className="w-full px-4 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
          />
          <span className="text-[11px] text-charcoal-400 mt-1 block">
            Використовується для посилань, коли відвідувач переглядає сайт українською мовою (UA).
          </span>
        </div>

        {/* Telegram */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-sky-600" />
            <span>Telegram нікнейм (без @)</span>
          </label>
          <input
            type="text"
            value={settings.telegram_handle || ""}
            onChange={(e) =>
              setSettings({ ...settings, telegram_handle: e.target.value })
            }
            placeholder="uliana_p_u"
            className="w-full px-4 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold-700" />
            <span>Місто / Локація</span>
          </label>
          <input
            type="text"
            value={settings.location || ""}
            onChange={(e) =>
              setSettings({ ...settings, location: e.target.value })
            }
            placeholder="Kraków, Polska"
            className="w-full px-4 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 border-t border-nude-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal-500 text-center sm:text-left">
            Всі зміни фото та контактів набувають чинності відразу після збереження.
          </p>

          <button
            type="submit"
            className="px-7 py-3.5 rounded-full bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-soft hover:shadow-glow shrink-0"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Збережено!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Зберегти налаштування</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
