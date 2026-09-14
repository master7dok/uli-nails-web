"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, CheckCircle2, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadMagnetId?: string;
  checklistTitle: string;
  language: "ua" | "pl";
  t: any;
  onSuccess?: () => void;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  leadMagnetId,
  checklistTitle,
  language,
  t,
  onSuccess,
}: LeadCaptureModalProps) {
  const modalTexts = t?.leadModal || {
    badge: language === "pl" ? "Darmowy materiał" : "Безкоштовний матеріал",
    title: language === "pl" ? "Pobierz checklist" : "Отримати чек-лист",
    subtitle:
      language === "pl"
        ? "Wypełnij krótki formularz, aby natychmiast pobrać PDF na swoje urządzenie:"
        : "Заповніть контакти, щоб миттєво завантажити PDF-посібник:",
    instagramLabel: language === "pl" ? "Twój Instagram" : "Ваш Instagram",
    instagramPlaceholder: "@nik_instagram",
    emailLabel: language === "pl" ? "Email do kontaktu" : "Email для зворотного зв'язку",
    emailPlaceholder: "example@gmail.com",
    experienceLabel: language === "pl" ? "Ile lat w zawodzie?" : "Скільки років у професії?",
    expOptions:
      language === "pl"
        ? ["Początkująca / planuję zacząć", "Do 1 roku", "1–3 lata", "Powyżej 3 lat"]
        : ["Початківець / планую почати", "До 1 року", "1–3 роки", "Понад 3 роки"],
    submitBtn: language === "pl" ? "Pobierz darmowy PDF" : "Завантажити чек-лист PDF",
    downloading: language === "pl" ? "Przygotowujemy plik..." : "Готуємо ваш файл...",
    successTitle: language === "pl" ? "Dziękujemy! Plik gotowy 🎉" : "Дякуємо! Файл готовий 🎉",
    successText:
      language === "pl"
        ? "Pobieranie pliku PDF rozpoczęło się automatycznie."
        : "Завантаження PDF розпочалося автоматично.",
    privacyNote:
      language === "pl"
        ? "🔒 Zero spamu. Tylko przydatne materiały i autorskie wskazówki od Uliany."
        : "🔒 Без спаму. Тільки корисні матеріали та авторські фішки від Уляни.",
    fieldRequired: language === "pl" ? "Proszę wypełnić to pole" : "Будь ласка, заповніть це поле",
    invalidEmail: language === "pl" ? "Wpisz poprawny adres e-mail" : "Введіть коректну електронну пошту",
  };

  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState(modalTexts.expOptions[1] || "До 1 року");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setInstagram("");
    setEmail("");
    setExperience(modalTexts.expOptions[1] || "До 1 року");
    setError(null);
    setIsSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIg = instagram.trim();
    const cleanMail = email.trim();

    if (!cleanIg) {
      setError(modalTexts.fieldRequired);
      return;
    }

    if (!cleanMail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanMail)) {
      setError(modalTexts.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      const formattedIg = cleanIg.startsWith("@") ? cleanIg : `@${cleanIg}`;

      const res = await fetch("/api/lead-magnets/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadMagnetId,
          checklistTitle,
          instagram: formattedIg,
          email: cleanMail,
          experience,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();

      // Trigger actual download of the language-specific PDF
      const downloadUrl = data.downloadUrl || "/uploads/checklist-nail-expert.pdf";
      const fileName = data.fileName || (language === "pl" ? "Checklist_Nail_Expert_PL.pdf" : "Checklist_Nail_Expert_UA.pdf");

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close modal smoothly after brief celebration
      setTimeout(() => {
        handleClose();
      }, 2400);
    } catch (err: any) {
      setError(err?.message || "Помилка при збереженні. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-charcoal-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8DFC8]/60 p-6 sm:p-8 z-10 overflow-hidden"
        >
          {/* Subtle Decorative Gold Ambient */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-gold-400/15 via-gold-200/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={loading}
            aria-label="Закрити"
            className="absolute top-5 right-5 p-2 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-[#EFE9DF] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            /* Success View */
            <div className="py-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner"
              >
                <CheckCircle2 className="w-9 h-9" />
              </motion.div>
              <h3 className="font-serif text-2xl font-semibold text-charcoal-900 mb-2">
                {modalTexts.successTitle}
              </h3>
              <p className="text-charcoal-600 text-sm max-w-sm mx-auto mb-6">
                {modalTexts.successText}
              </p>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-gold-700 bg-gold-50 px-4 py-2 rounded-full border border-gold-200">
                <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
                <span>{language === "pl" ? "Pobieranie rozpoczęte" : "Файл відкрито на завантаження"}</span>
              </div>
            </div>
          ) : (
            /* Form View */
            <div>
              {/* Header Badge & Title */}
              <div className="mb-6">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gold-100/80 text-gold-800 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>{modalTexts.badge}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-900 leading-tight">
                  {modalTexts.title}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 mt-1.5">
                  {modalTexts.subtitle}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Instagram Handle */}
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    {modalTexts.instagramLabel} <span className="text-gold-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder={modalTexts.instagramPlaceholder}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDD5C7] rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    {modalTexts.instagramHint}
                  </p>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                    {modalTexts.emailLabel} <span className="text-gold-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={modalTexts.emailPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C7] rounded-xl text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all shadow-sm"
                  />
                </div>

                {/* Experience in Nails */}
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                    {modalTexts.experienceLabel} <span className="text-gold-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {modalTexts.expOptions.map((opt: string) => {
                      const isSelected = experience === opt;
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setExperience(opt)}
                          className={`px-3 py-2 text-xs rounded-xl font-medium text-left transition-all border ${
                            isSelected
                              ? "bg-charcoal-900 text-white border-charcoal-900 shadow-sm"
                              : "bg-white text-charcoal-700 border-[#DDD5C7] hover:border-gold-400 hover:bg-[#FDFBF7]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy reassurance */}
                <p className="text-[11px] text-charcoal-500 pt-1">
                  {modalTexts.privacyNote}
                </p>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>{modalTexts.downloading}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                        <span>{modalTexts.submitBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
