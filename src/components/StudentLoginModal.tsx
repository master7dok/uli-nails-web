"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { X, Lock, User, Sparkles, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

interface StudentLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function StudentLoginModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentLoginModalProps) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("student:logged-in", { detail: data.student }));
        }
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/student");
        }
      } else {
        setError(
          data.error ||
            (language === "ua"
              ? "Невірний логін або пароль. Спробуйте ще раз."
              : "Nieprawidłowy login lub hasło. Spróbuj ponownie.")
        );
      }
    } catch {
      setError(
        language === "ua"
          ? "Помилка зв'язку з сервером. Спробуйте пізніше."
          : "Błąd połączenia z serwerem. Spróbuj później."
      );
    } finally {
      setLoading(false);
    }
  };

  const strings = (t as any).studentLogin || {
    title: language === "ua" ? "Вхід для учениць" : "Logowanie dla kursantek",
    subtitle:
      language === "ua"
        ? "Введіть логін та пароль, надані Уляною після придбання онлайн-курсу:"
        : "Wprowadź login i hasło przekazane przez Ulianę po zakupie kursu:",
    usernameLabel: language === "ua" ? "Логін (ім'я користувача)" : "Login (nazwa użytkownika)",
    usernamePlaceholder: language === "ua" ? "Ваш логін" : "Twój login",
    passwordLabel: language === "ua" ? "Пароль" : "Hasło",
    passwordPlaceholder: language === "ua" ? "Введіть пароль" : "Wprowadź hasło",
    submitBtn: language === "ua" ? "Увійти в кабінет" : "Zaloguj się do strefy",
    loggingIn: language === "ua" ? "Перевірка даних..." : "Weryfikacja danych...",
    noAccountHelp:
      language === "ua"
        ? "Ще не маєте доступу? Зв'яжіться з Уляною для придбання онлайн-курсу."
        : "Nie masz jeszcze dostępu? Skontaktuj się z Ulianą w sprawie zakupu kursu.",
    close: language === "ua" ? "Закрити" : "Zamknij",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-nude-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={strings.close}
          className="absolute top-5 right-5 p-2 rounded-full bg-nude-100/70 hover:bg-nude-200 text-charcoal-500 hover:text-charcoal-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 mb-3 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-1.5">
            {strings.title}
          </h3>
          <p className="text-xs text-charcoal-500 leading-relaxed">
            {strings.subtitle}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              {strings.usernameLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={strings.usernamePlaceholder}
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-nude-300 text-sm focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-all font-mono"
              />
              <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              {strings.passwordLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={strings.passwordPlaceholder}
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-nude-300 text-sm focus:border-gold-600 focus:outline-none focus:ring-1 focus:ring-gold-600/30 transition-all font-mono"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-soft hover:shadow-glow flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{strings.loggingIn}</span>
              </>
            ) : (
              <>
                <span>{strings.submitBtn}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer info note */}
        <div className="mt-6 pt-5 border-t border-nude-100 text-center">
          <p className="text-[11px] text-charcoal-500 leading-relaxed flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
            <span>{strings.noAccountHelp}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
