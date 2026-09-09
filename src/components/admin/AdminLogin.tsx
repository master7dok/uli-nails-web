"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Невірний пароль");
      } else {
        if (data.token) {
          localStorage.setItem("uli_admin_token", data.token);
        }
        onSuccess();
      }
    } catch (err) {
      setError("Помилка з'єднання");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F2EB]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-nude-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-nude-100 border border-gold-300 flex items-center justify-center mx-auto mb-4 text-gold-700">
            <Lock className="w-6 h-6" />
          </div>
          <span className="font-serif text-2xl font-normal text-charcoal-900 block">
            Uliana Nails
          </span>
          <span className="text-xs uppercase tracking-widest text-gold-600 font-semibold block mt-1">
            Панель Керування / Panel Admina
          </span>
          <p className="text-xs text-charcoal-500 mt-2">
            Введіть пароль адміністратора для редагування послуг, курсів та фото
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
              Пароль доступу
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-nude-300 focus:outline-none focus:border-gold-500 text-charcoal-900 text-sm bg-nude-50/50"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Перевірка...</span>
            ) : (
              <>
                <span>Увійти в кабінет</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-nude-100 text-center">
          <span className="text-[11px] text-charcoal-400">
            За замовчуванням: <code className="text-gold-700 font-mono">uliana_admin_secret</code>
          </span>
        </div>
      </div>
    </div>
  );
}
