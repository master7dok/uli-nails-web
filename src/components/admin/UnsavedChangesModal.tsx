"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Save, Trash2, ArrowLeft, Loader2 } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  itemName?: string;
  itemType?: string;
  isSaving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  itemName,
  itemType = "курс",
  isSaving = false,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          onCancel();
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-nude-200 max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scaleUp relative overflow-hidden">
        {/* Subtle decorative top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-gold-500 to-rose-400" />

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3
              id="unsaved-modal-title"
              className="font-serif text-lg sm:text-xl font-bold text-charcoal-900 leading-tight"
            >
              У вас є незбережені зміни!
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              Ви редагуєте {itemType}{" "}
              <strong className="text-charcoal-900 font-semibold">
                {itemName ? `«${itemName}»` : ""}
              </strong>
              . Якщо ви вийдете або перейдете назад зараз, усі незбережені дані буде втрачено.
            </p>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
          <span className="font-semibold text-amber-800">Підказка:</span>
          <span>Оберіть, як вчинити із внесеними правками:</span>
        </div>

        {/* Modal Buttons */}
        <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center justify-start gap-2.5 pt-2">
          {/* 1. Save & Exit (Primary) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Збереження...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Зберегти зміни</span>
              </>
            )}
          </button>

          {/* 2. Discard & Exit (Danger) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={onDiscard}
            className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Вийти без збереження</span>
          </button>

          {/* 3. Keep Editing (Cancel/Stay) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="px-4 py-3 rounded-xl bg-nude-100 hover:bg-nude-200 text-charcoal-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Продовжити редагування</span>
          </button>
        </div>
      </div>
    </div>
  );
}
