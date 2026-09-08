"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Clock, GraduationCap, Link2 } from "lucide-react";

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
}

export default function CoursesTab() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CourseItem>>({});

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const startEdit = (course: CourseItem) => {
    setEditingId(course.id);
    setEditForm(course);
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingId(null);
        fetchCourses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-serif text-xl font-semibold text-charcoal-900">
          Керування офлайн-курсами ({courses.length} програм)
        </h3>
        <p className="text-xs text-charcoal-500 mt-0.5">
          Редагуйте програми, ціни та опис навичок (чистота, швидкість, трапеції, гель)
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-sm text-charcoal-500">Завантаження курсів...</p>
        ) : (
          courses.map((course) => {
            const isEditing = editingId === course.id;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-6 shadow-soft border border-nude-200"
              >
                {isEditing ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Ціна курсу (PLN)
                        </label>
                        <input
                          type="number"
                          value={editForm.pricePln || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, pricePln: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>
                    </div>

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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-serif"
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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-serif"
                        />
                      </div>
                    </div>

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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>
                    </div>

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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
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
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Окрема Google Form URL (за бажанням, або залиште пустим для загальної)
                      </label>
                      <input
                        type="url"
                        value={editForm.formUrl || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, formUrl: e.target.value })
                        }
                        placeholder="https://docs.google.com/forms/..."
                        className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl border border-nude-300 text-xs text-charcoal-600 hover:bg-nude-50"
                      >
                        Скасувати
                      </button>
                      <button
                        onClick={() => handleUpdate(course.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Зберегти зміни</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-nude-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
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
                        <p className="text-xs text-charcoal-500 font-serif">
                          PL: {course.titlePl}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xs uppercase text-charcoal-400 font-medium block">
                            Вартість
                          </span>
                          <span className="font-serif text-2xl font-bold text-charcoal-900">
                            {course.pricePln} zł
                          </span>
                        </div>

                        <button
                          onClick={() => startEdit(course)}
                          className="px-3.5 py-2 rounded-xl bg-nude-100 hover:bg-gold-500 hover:text-white text-charcoal-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Редагувати</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 text-xs text-charcoal-600 leading-relaxed">
                      <p className="line-clamp-2">{course.descriptionUa}</p>
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
