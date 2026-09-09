"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  GraduationCap,
  Link2,
  RefreshCw,
  Sparkles,
  BookOpen,
  Award,
  Gift,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";

interface CourseItem {
  id: string;
  slug: string;
  titlePl: string;
  titleUa: string;
  subtitlePl?: string | null;
  subtitleUa?: string | null;
  descriptionPl: string;
  descriptionUa: string;
  durationPl: string;
  durationUa: string;
  levelPl: string;
  levelUa: string;
  pricePln: number;
  badgePl?: string | null;
  badgeUa?: string | null;
  bonusPl?: string | null;
  bonusUa?: string | null;
  featuresPl: string;
  featuresUa: string;
  syllabusPl?: string | null;
  syllabusUa?: string | null;
  formUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

const defaultNewCourse = {
  titleUa: "",
  titlePl: "",
  subtitleUa: "",
  subtitlePl: "",
  pricePln: 1500,
  durationUa: "2 дні (16 год)",
  durationPl: "2 dni (16h)",
  levelUa: "Для всіх рівнів",
  levelPl: "Dla każdego",
  badgeUa: "",
  badgePl: "",
  bonusUa: "",
  bonusPl: "",
  descriptionUa: "",
  descriptionPl: "",
  featuresUaText: "",
  featuresPlText: "",
  formUrl: "",
  sortOrder: 0,
};

function stringToLines(val?: string | null): string {
  if (!val) return "";
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(parsed)) return parsed.join("\n");
  } catch {}
  return val;
}

function linesToJson(val?: string | null): string {
  if (!val) return "[]";
  const lines = val
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return JSON.stringify(lines);
}

export default function CoursesTab() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Add course state
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState(defaultNewCourse);

  // Edit course state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        titleUa: newForm.titleUa,
        titlePl: newForm.titlePl,
        subtitleUa: newForm.subtitleUa || null,
        subtitlePl: newForm.subtitlePl || null,
        pricePln: Number(newForm.pricePln) || 0,
        durationUa: newForm.durationUa,
        durationPl: newForm.durationPl,
        levelUa: newForm.levelUa,
        levelPl: newForm.levelPl,
        badgeUa: newForm.badgeUa || null,
        badgePl: newForm.badgePl || null,
        bonusUa: newForm.bonusUa || null,
        bonusPl: newForm.bonusPl || null,
        descriptionUa: newForm.descriptionUa,
        descriptionPl: newForm.descriptionPl,
        featuresUa: linesToJson(newForm.featuresUaText),
        featuresPl: linesToJson(newForm.featuresPlText),
        formUrl: newForm.formUrl || null,
        sortOrder: Number(newForm.sortOrder) || 0,
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewForm(defaultNewCourse);
        fetchCourses();
      } else {
        const err = await res.json();
        alert("Помилка створення курсу: " + (err.error || "Невідома помилка"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (course: CourseItem) => {
    setEditingId(course.id);
    setEditForm({
      ...course,
      featuresUaText: stringToLines(course.featuresUa),
      featuresPlText: stringToLines(course.featuresPl),
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      const payload = {
        ...editForm,
        pricePln: Number(editForm.pricePln) || 0,
        sortOrder: Number(editForm.sortOrder) || 0,
        featuresUa: linesToJson(editForm.featuresUaText),
        featuresPl: linesToJson(editForm.featuresPlText),
      };

      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingId(null);
        fetchCourses();
      } else {
        const err = await res.json();
        alert("Помилка оновлення: " + (err.error || "Невідома помилка"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей курс?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Не вдалося видалити курс.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedDefaults = async () => {
    if (
      courses.length > 0 &&
      !confirm("У списку вже є курси. Бажаєте відновити/оновити 5 базових курсів?")
    ) {
      return;
    }

    setSeeding(true);
    try {
      const res = await fetch("/api/courses/seed", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
      });
      if (res.ok) {
        await fetchCourses();
      } else {
        alert("Помилка завантаження курсів за замовчуванням.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-charcoal-900">
            Керування офлайн-курсами ({courses.length} програм)
          </h3>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Створюйте нові програми, змінюйте ціни, модулі, тривалість та навички
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) setEditingId(null);
          }}
          className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? "Скасувати" : "Додати курс"}</span>
        </button>
      </div>

      {/* Add New Course Form Card */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border-2 border-gold-400/60 space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-nude-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center text-gold-700">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-charcoal-900">
                Створення нового курсу з нуля
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-nude-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 1: Key Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ціна курсу (PLN) *
              </label>
              <input
                type="number"
                value={newForm.pricePln}
                onChange={(e) => setNewForm({ ...newForm, pricePln: Number(e.target.value) })}
                required
                min={0}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Тривалість UA *
              </label>
              <input
                type="text"
                value={newForm.durationUa}
                onChange={(e) => setNewForm({ ...newForm, durationUa: e.target.value })}
                required
                placeholder="2 дні (16 год)"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Тривалість PL *
              </label>
              <input
                type="text"
                value={newForm.durationPl}
                onChange={(e) => setNewForm({ ...newForm, durationPl: e.target.value })}
                required
                placeholder="2 dni (16h)"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Порядок сортування
              </label>
              <input
                type="number"
                value={newForm.sortOrder}
                onChange={(e) => setNewForm({ ...newForm, sortOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Levels & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Рівень складності (UA)
              </label>
              <input
                type="text"
                value={newForm.levelUa}
                onChange={(e) => setNewForm({ ...newForm, levelUa: e.target.value })}
                placeholder="Для майстрів з досвідом"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Poziom trudności (PL)
              </label>
              <input
                type="text"
                value={newForm.levelPl}
                onChange={(e) => setNewForm({ ...newForm, levelPl: e.target.value })}
                placeholder="Dla doświadczonych"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Бейдж / Мітка (UA)
              </label>
              <input
                type="text"
                value={newForm.badgeUa}
                onChange={(e) => setNewForm({ ...newForm, badgeUa: e.target.value })}
                placeholder="VIP-Інтенсив, Хіт..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Badge / Etykieta (PL)
              </label>
              <input
                type="text"
                value={newForm.badgePl}
                onChange={(e) => setNewForm({ ...newForm, badgePl: e.target.value })}
                placeholder="VIP Master, Bestseller..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Назва курсу (UA) *
              </label>
              <input
                type="text"
                value={newForm.titleUa}
                onChange={(e) => setNewForm({ ...newForm, titleUa: e.target.value })}
                required
                placeholder="напр. Швидкісне моделювання на верхні форми"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-serif focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Tytuł kursu (PL) *
              </label>
              <input
                type="text"
                value={newForm.titlePl}
                onChange={(e) => setNewForm({ ...newForm, titlePl: e.target.value })}
                required
                placeholder="np. Szybkie Przedłużanie na Górne Formy"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-serif focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Subtitles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Підзаголовок / Фокус програми (UA)
              </label>
              <input
                type="text"
                value={newForm.subtitleUa}
                onChange={(e) => setNewForm({ ...newForm, subtitleUa: e.target.value })}
                placeholder="Техніка 'Ready to wear' до 2 годин"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Podtytuł / Cel programu (PL)
              </label>
              <input
                type="text"
                value={newForm.subtitlePl}
                onChange={(e) => setNewForm({ ...newForm, subtitlePl: e.target.value })}
                placeholder="Technika 'Ready to wear' w czasie poniżej 2h"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 5: Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Опис програми (UA) *
              </label>
              <textarea
                rows={3}
                value={newForm.descriptionUa}
                onChange={(e) => setNewForm({ ...newForm, descriptionUa: e.target.value })}
                required
                placeholder="Короткий огляд для кого цей курс і який результат отримає майстер..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Opis programu (PL) *
              </label>
              <textarea
                rows={3}
                value={newForm.descriptionPl}
                onChange={(e) => setNewForm({ ...newForm, descriptionPl: e.target.value })}
                required
                placeholder="Krótki opis korzyści i celów szkolenia..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: Key Features (one per line) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ключові тези / навички курсу (UA) — кожна теза з нового рядка
              </label>
              <textarea
                rows={4}
                value={newForm.featuresUaText}
                onChange={(e) => setNewForm({ ...newForm, featuresUaText: e.target.value })}
                placeholder="Корекція форми без пилу&#10;Ідеальний апекс твердим гелем&#10;Практика на 3 моделях"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-mono focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Kluczowe umiejętności / punkty (PL) — każdy punkt w nowej linii
              </label>
              <textarea
                rows={4}
                value={newForm.featuresPlText}
                onChange={(e) => setNewForm({ ...newForm, featuresPlText: e.target.value })}
                placeholder="Korekta bez powierzchniowego piłowania&#10;Idealny apeks żelem&#10;Praktyka na 3 modelkach"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-mono focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 7: Bonuses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Подарунок / Бонус до курсу (UA)
              </label>
              <input
                type="text"
                value={newForm.bonusUa}
                onChange={(e) => setNewForm({ ...newForm, bonusUa: e.target.value })}
                placeholder="В подарунок набір професійних форм..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Prezent / Bonus do kursu (PL)
              </label>
              <input
                type="text"
                value={newForm.bonusPl}
                onChange={(e) => setNewForm({ ...newForm, bonusPl: e.target.value })}
                placeholder="W prezencie zestaw form..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 8: Google Form URL */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Окреме посилання на Google Form (за бажанням, або залиште порожнім для загальної форми)
            </label>
            <input
              type="url"
              value={newForm.formUrl}
              onChange={(e) => setNewForm({ ...newForm, formUrl: e.target.value })}
              placeholder="https://docs.google.com/forms/..."
              className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-nude-200">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-5 py-2.5 rounded-xl border border-nude-300 text-xs font-semibold text-charcoal-600 hover:bg-nude-50 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Створити курс</span>
            </button>
          </div>
        </form>
      )}

      {/* Courses List or Empty State */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-nude-200 shadow-soft">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-600 mb-2" />
            <p className="text-sm text-charcoal-500">Завантаження програм курсів...</p>
          </div>
        ) : courses.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-10 text-center border border-nude-200 shadow-soft animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-50 flex items-center justify-center text-gold-600 mb-4 shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-xl font-semibold text-charcoal-900 mb-2">
              Список курсів порожній
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto mb-6 leading-relaxed">
              Наразі не додано жодного курсу. Ви можете створити новий курс з нуля або завантажити 5 стандартних авторських програм Уляни.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsAdding(true)}
                className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Створити перший курс</span>
              </button>
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="px-5 py-2.5 rounded-xl border border-nude-300 hover:border-gold-500 hover:text-gold-700 bg-white text-charcoal-700 text-xs font-semibold transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
                <span>{seeding ? "Завантаження..." : "Завантажити 5 стандартних курсів"}</span>
              </button>
            </div>
          </div>
        ) : (
          courses.map((course) => {
            const isEditing = editingId === course.id;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-6 sm:p-7 shadow-soft border border-nude-200 hover:border-nude-300 transition-colors"
              >
                {isEditing ? (
                  /* Edit Mode Form */
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-nude-100 pb-3">
                      <h4 className="font-serif text-base font-semibold text-charcoal-900">
                        Редагування курсу: {course.titleUa}
                      </h4>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Ціна курсу (PLN) *
                        </label>
                        <input
                          type="number"
                          value={editForm.pricePln || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, pricePln: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Тривалість UA
                        </label>
                        <input
                          type="text"
                          value={editForm.durationUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, durationUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Тривалість PL
                        </label>
                        <input
                          type="text"
                          value={editForm.durationPl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, durationPl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Порядок сортування
                        </label>
                        <input
                          type="number"
                          value={editForm.sortOrder || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sortOrder: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 2: Levels & Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Рівень (UA)
                        </label>
                        <input
                          type="text"
                          value={editForm.levelUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, levelUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Poziom (PL)
                        </label>
                        <input
                          type="text"
                          value={editForm.levelPl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, levelPl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Бейдж UA
                        </label>
                        <input
                          type="text"
                          value={editForm.badgeUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, badgeUa: e.target.value })
                          }
                          placeholder="Топ вибір, Speed Pro..."
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Badge PL
                        </label>
                        <input
                          type="text"
                          value={editForm.badgePl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, badgePl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 3: Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Назва курсу (UA)
                        </label>
                        <input
                          type="text"
                          value={editForm.titleUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, titleUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-serif focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Tytuł kursu (PL)
                        </label>
                        <input
                          type="text"
                          value={editForm.titlePl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, titlePl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-serif focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 4: Subtitles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Підзаголовок програми (UA)
                        </label>
                        <input
                          type="text"
                          value={editForm.subtitleUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, subtitleUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Podtytuł programu (PL)
                        </label>
                        <input
                          type="text"
                          value={editForm.subtitlePl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, subtitlePl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 5: Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Опис програми (UA)
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.descriptionUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, descriptionUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Opis programu (PL)
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.descriptionPl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, descriptionPl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 6: Key Features (one per line) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Ключові тези / навички курсу (UA) — кожна з нового рядка
                        </label>
                        <textarea
                          rows={4}
                          value={editForm.featuresUaText || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, featuresUaText: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-mono focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Kluczowe punkty / cechy (PL) — każda w nowej linii
                        </label>
                        <textarea
                          rows={4}
                          value={editForm.featuresPlText || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, featuresPlText: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-mono focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 7: Bonuses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Подарунок / Бонус до курсу (UA)
                        </label>
                        <input
                          type="text"
                          value={editForm.bonusUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bonusUa: e.target.value })
                          }
                          placeholder="В подарунок набір форм..."
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Prezent / Bonus do kursu (PL)
                        </label>
                        <input
                          type="text"
                          value={editForm.bonusPl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, bonusPl: e.target.value })
                          }
                          placeholder="W prezencie zestaw form..."
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Row 8: Google Form URL */}
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Окрема Google Form URL (за бажанням)
                      </label>
                      <input
                        type="url"
                        value={editForm.formUrl || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, formUrl: e.target.value })
                        }
                        placeholder="https://docs.google.com/forms/..."
                        className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-nude-100">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl border border-nude-300 text-xs text-charcoal-600 hover:bg-nude-50 transition-colors"
                      >
                        Скасувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(course.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Зберегти зміни</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode Card */
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-nude-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {course.badgeUa && (
                            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800">
                              {course.badgeUa}
                            </span>
                          )}
                          <span className="text-xs text-charcoal-500 font-medium">
                            {course.durationUa} • {course.levelUa}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl font-semibold text-charcoal-900">
                          {course.titleUa}
                        </h4>
                        <p className="text-xs text-charcoal-500 font-serif mt-0.5">
                          PL: {course.titlePl}
                        </p>
                        {course.subtitleUa && (
                          <p className="text-xs text-gold-700 font-medium mt-1">
                            {course.subtitleUa}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-xs uppercase text-charcoal-400 font-medium block">
                            Вартість
                          </span>
                          <span className="font-serif text-2xl font-bold text-charcoal-900">
                            {course.pricePln} zł
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(course)}
                            className="px-3.5 py-2 rounded-xl bg-nude-100 hover:bg-gold-500 hover:text-white text-charcoal-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Редагувати</span>
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Видалити курс"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-xs text-charcoal-600 leading-relaxed space-y-2">
                      <p className="line-clamp-2">{course.descriptionUa}</p>
                      {course.bonusUa && (
                        <p className="text-emerald-700 font-medium flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-emerald-600 inline" />
                          <span>Бонус: {course.bonusUa}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
