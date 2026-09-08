"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Star,
  MessageSquareQuote,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  rolePl: string;
  roleUa: string;
  textPl: string;
  textUa: string;
  rating: number;
  sortOrder: number;
}

export default function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  // New review form
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    rolePl: "Absolwentka kursu",
    roleUa: "Випускниця курсу",
    textPl: "",
    textUa: "",
    rating: 5,
    sortOrder: 1,
  });

  // Edit review state
  const [editForm, setEditForm] = useState<Partial<TestimonialItem>>({});

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      setTestimonials(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Reorder functionality
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === testimonials.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...testimonials];

    // Swap items
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update sortOrder values based on their new index
    const reorderedPayload = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    // Instant local UI update
    setTestimonials(reorderedPayload);
    setReordering(true);

    try {
      const res = await fetch("/api/testimonials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: reorderedPayload.map((item) => ({
            id: item.id,
            sortOrder: item.sortOrder,
          })),
        }),
      });

      if (res.ok) {
        setReorderSuccess(true);
        setTimeout(() => setReorderSuccess(false), 2000);
      }
    } catch (e) {
      console.error("Reorder failed:", e);
      fetchTestimonials(); // Revert on error
    } finally {
      setReordering(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newForm,
          sortOrder: testimonials.length + 1,
        }),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewForm({
          name: "",
          rolePl: "Absolwentka kursu",
          roleUa: "Випускниця курсу",
          textPl: "",
          textUa: "",
          rating: 5,
          sortOrder: 1,
        });
        fetchTestimonials();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingId(null);
        fetchTestimonials();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цей відгук?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials(testimonials.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-semibold text-charcoal-900">
              Керування відгуками ({testimonials.length})
            </h3>
            {reorderSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Порядок оновлено!</span>
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Використовуйте стрілочки <span className="font-semibold text-charcoal-700">↑ Вгору</span> та <span className="font-semibold text-charcoal-700">↓ Вниз</span> для зміни порядку відображення відгуків на сайті.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? "Скасувати" : "Додати відгук"}</span>
        </button>
      </div>

      {/* Add New Testimonial Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border-2 border-gold-400/60 space-y-4 animate-fadeIn"
        >
          <h4 className="font-serif text-lg font-semibold text-charcoal-900">
            Створення нового відгуку
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ім&apos;я автора
              </label>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="Олена Мельник"
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Статус / Роль (UA)
              </label>
              <input
                type="text"
                value={newForm.roleUa}
                onChange={(e) => setNewForm({ ...newForm, roleUa: e.target.value })}
                placeholder="Випускниця курсу 'Level Up'"
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Rola / Status (PL)
              </label>
              <input
                type="text"
                value={newForm.rolePl}
                onChange={(e) => setNewForm({ ...newForm, rolePl: e.target.value })}
                placeholder="Absolwentka szkolenia"
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Оцінка (Зірки 1 - 5)
            </label>
            <select
              value={newForm.rating}
              onChange={(e) => setNewForm({ ...newForm, rating: Number(e.target.value) })}
              className="w-40 px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-white font-medium"
            >
              <option value="5">⭐⭐⭐⭐⭐ (5 зірок)</option>
              <option value="4">⭐⭐⭐⭐ (4 зірки)</option>
              <option value="3">⭐⭐⭐ (3 зірки)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Текст відгуку (UA)
              </label>
              <textarea
                rows={4}
                value={newForm.textUa}
                onChange={(e) => setNewForm({ ...newForm, textUa: e.target.value })}
                placeholder="Напишіть відгук українською мовою..."
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Treść opinii (PL)
              </label>
              <textarea
                rows={4}
                value={newForm.textPl}
                onChange={(e) => setNewForm({ ...newForm, textPl: e.target.value })}
                placeholder="Napisz treść opinii po polsku..."
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft"
            >
              Зберегти відгук
            </button>
          </div>
        </form>
      )}

      {/* Testimonials List with Reorder buttons */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-charcoal-500">Завантаження відгуків...</p>
        ) : (
          testimonials.map((item, index) => {
            const isEditing = editingId === item.id;
            const isFirst = index === 0;
            const isLast = index === testimonials.length - 1;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-nude-200 transition-all hover:border-gold-400/50"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Ім&apos;я
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Роль UA
                        </label>
                        <input
                          type="text"
                          value={editForm.roleUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, roleUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Rola PL
                        </label>
                        <input
                          type="text"
                          value={editForm.rolePl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, rolePl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Порядковий номер (#)
                        </label>
                        <input
                          type="number"
                          value={editForm.sortOrder || index + 1}
                          onChange={(e) =>
                            setEditForm({ ...editForm, sortOrder: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Оцінка (Зірки)
                      </label>
                      <select
                        value={editForm.rating || 5}
                        onChange={(e) =>
                          setEditForm({ ...editForm, rating: Number(e.target.value) })
                        }
                        className="w-40 px-3 py-2 rounded-xl border border-nude-300 text-sm bg-white"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                        <option value="4">⭐⭐⭐⭐ (4)</option>
                        <option value="3">⭐⭐⭐ (3)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Текст відгуку (UA)
                        </label>
                        <textarea
                          rows={4}
                          value={editForm.textUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, textUa: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Treść opinii (PL)
                        </label>
                        <textarea
                          rows={4}
                          value={editForm.textPl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, textPl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-xl border border-nude-300 text-xs text-charcoal-600 hover:bg-nude-50"
                      >
                        Скасувати
                      </button>
                      <button
                        onClick={() => handleUpdate(item.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Зберегти відгук</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 mb-3 border-b border-nude-100">
                      <div className="flex items-start gap-3">
                        {/* Order Sequence Badge */}
                        <div className="w-9 h-9 rounded-2xl bg-charcoal-900 text-gold-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-serif text-lg font-semibold text-charcoal-900">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: item.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-charcoal-500 font-medium">
                            UA: {item.roleUa} | PL: {item.rolePl}
                          </p>
                        </div>
                      </div>

                      {/* Action & Reorder Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Up / Down Order Buttons */}
                        <div className="flex items-center bg-nude-100 p-1 rounded-xl border border-nude-200">
                          <button
                            type="button"
                            disabled={isFirst || reordering}
                            onClick={() => handleMove(index, "up")}
                            className="p-1.5 rounded-lg text-charcoal-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Перемістити вище (вгору)"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isLast || reordering}
                            onClick={() => handleMove(index, "down")}
                            className="p-1.5 rounded-lg text-charcoal-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Перемістити нижче (вниз)"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => startEdit(item)}
                          className="px-3 py-2 rounded-xl bg-nude-100 hover:bg-gold-500 hover:text-white text-charcoal-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Редагувати</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-700 leading-relaxed pt-1">
                      <div className="p-3 rounded-2xl bg-nude-50/70 border border-nude-200">
                        <span className="font-bold text-charcoal-900 block mb-1">
                          Українська версія (UA):
                        </span>
                        <p className="italic">&ldquo;{item.textUa}&rdquo;</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-nude-50/70 border border-nude-200">
                        <span className="font-bold text-charcoal-900 block mb-1">
                          Wersja polska (PL):
                        </span>
                        <p className="italic">&ldquo;{item.textPl}&rdquo;</p>
                      </div>
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
