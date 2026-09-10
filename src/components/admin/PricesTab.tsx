"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Flame,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";

interface ServiceItem {
  id: string;
  category: string;
  titlePl: string;
  titleUa: string;
  descriptionPl?: string | null;
  descriptionUa?: string | null;
  pricePln: number;
  durationMin?: number | null;
  isPopular: boolean;
  sortOrder: number;
}

export default function PricesTab() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // New Service Form
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({
    category: "manicure",
    titlePl: "",
    titleUa: "",
    descriptionPl: "",
    descriptionUa: "",
    pricePln: 140,
    durationMin: 90,
    isPopular: false,
  });

  // Edit state
  const [editForm, setEditForm] = useState<Partial<ServiceItem>>({});

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleMove = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === services.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newItems = [...services];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reorderedPayload = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    setServices(reorderedPayload);
    setReordering(true);

    try {
      const res = await fetch("/api/services/reorder", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          items: reorderedPayload.map((item) => ({
            id: item.id,
            sortOrder: item.sortOrder,
          })),
        }),
      });

      if (res.ok) {
        setReorderSuccess(true);
        setTimeout(() => setReorderSuccess(false), 2500);
      } else {
        fetchServices();
      }
    } catch (e) {
      console.error("Reorder failed:", e);
      fetchServices();
    } finally {
      setReordering(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...newForm,
          sortOrder: services.length + 1,
        }),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewForm({
          category: "manicure",
          titlePl: "",
          titleUa: "",
          descriptionPl: "",
          descriptionUa: "",
          pricePln: 140,
          durationMin: 90,
          isPopular: false,
        });
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setEditForm(service);
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingId(null);
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цю послугу з прайсу?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setServices(services.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = [
    { id: "all", label: "Всі послуги" },
    { id: "manicure", label: "Манікюр" },
    { id: "pedicure", label: "Педикюр" },
    { id: "additional", label: "Додатково" },
  ];

  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => {
          if (activeCategory === "manicure") {
            return s.category === "manicure" || s.category === "gel" || s.category === "extension";
          }
          if (activeCategory === "pedicure") {
            return s.category === "pedicure";
          }
          if (activeCategory === "additional") {
            return s.category === "additional" || s.category === "care";
          }
          return s.category === activeCategory;
        });

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-xl font-semibold text-charcoal-900">
              Керування прайс-листом ({services.length} послуг)
            </h3>
            {reorderSuccess && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Порядок збережено!</span>
              </span>
            )}
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Змінюйте порядок кнопками вгору/вниз, додавайте послуги та педикюр
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? "Скасувати" : "Додати послугу"}</span>
        </button>
      </div>

      {/* Add New Service Card */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl p-6 shadow-card border-2 border-gold-400/60 space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-nude-200 pb-3">
            <h4 className="font-serif text-lg font-semibold text-charcoal-900">
              Створення нової послуги
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Категорія *
              </label>
              <select
                value={newForm.category}
                onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-white font-medium"
              >
                <option value="manicure">Манікюр (Manicure)</option>
                <option value="pedicure">Педикюр (Pedicure)</option>
                <option value="additional">Додатково (Dodatkowo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ціна (PLN) *
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
                Тривалість (хвилин)
              </label>
              <input
                type="number"
                value={newForm.durationMin}
                onChange={(e) => setNewForm({ ...newForm, durationMin: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Назва (UA) *
              </label>
              <input
                type="text"
                value={newForm.titleUa}
                onChange={(e) => setNewForm({ ...newForm, titleUa: e.target.value })}
                placeholder="Естетичний гібридний педикюр"
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Tytuł (PL) *
              </label>
              <input
                type="text"
                value={newForm.titlePl}
                onChange={(e) => setNewForm({ ...newForm, titlePl: e.target.value })}
                placeholder="Pedicure estetyczny hybrydowy"
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Опис (UA)
              </label>
              <textarea
                value={newForm.descriptionUa}
                onChange={(e) => setNewForm({ ...newForm, descriptionUa: e.target.value })}
                rows={2}
                placeholder="Короткий опис процедури українською..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Opis (PL)
              </label>
              <textarea
                value={newForm.descriptionPl}
                onChange={(e) => setNewForm({ ...newForm, descriptionPl: e.target.value })}
                rows={2}
                placeholder="Krótki opis zabiegu po polsku..."
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPopular"
              checked={newForm.isPopular}
              onChange={(e) => setNewForm({ ...newForm, isPopular: e.target.checked })}
              className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="isPopular" className="text-xs font-medium text-charcoal-700 cursor-pointer">
              Позначити як &ldquo;Популярна послуга (Bestseller)&rdquo;
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-nude-200">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-nude-300 text-xs text-charcoal-600 hover:bg-nude-50"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Зберегти послугу
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              activeCategory === cat.id
                ? "bg-charcoal-900 text-white shadow-xs"
                : "bg-white hover:bg-nude-100 text-charcoal-600 border border-nude-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services List */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-nude-200 divide-y divide-nude-100">
        {loading ? (
          <div className="p-8 text-center text-charcoal-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-gold-600" />
            <span>Завантаження послуг...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <p className="p-8 text-center text-charcoal-500 text-sm">
            Немає послуг у цій категорії.
          </p>
        ) : (
          filteredServices.map((service, displayIdx) => {
            const actualIndex = services.findIndex((s) => s.id === service.id);
            const isEditing = editingId === service.id;

            return (
              <div key={service.id || `service-${displayIdx}`} className="py-4 first:pt-0 last:pb-0">
                {isEditing ? (
                  <div className="space-y-4 p-4 rounded-xl bg-nude-50 border border-nude-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Категорія
                        </label>
                        <select
                          value={
                            editForm.category === "gel" || editForm.category === "extension"
                              ? "manicure"
                              : editForm.category === "care"
                              ? "additional"
                              : editForm.category || "manicure"
                          }
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs bg-white font-medium"
                        >
                          <option value="manicure">Манікюр</option>
                          <option value="pedicure">Педикюр</option>
                          <option value="additional">Додатково</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Ціна (PLN)
                        </label>
                        <input
                          type="number"
                          value={editForm.pricePln || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, pricePln: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Тривалість (хв)
                        </label>
                        <input
                          type="number"
                          value={editForm.durationMin || 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, durationMin: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Назва UA
                        </label>
                        <input
                          type="text"
                          value={editForm.titleUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, titleUa: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Tytuł PL
                        </label>
                        <input
                          type="text"
                          value={editForm.titlePl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, titlePl: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Опис (UA)
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.descriptionUa || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, descriptionUa: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Opis (PL)
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.descriptionPl || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, descriptionPl: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-pop-${service.id}`}
                        checked={Boolean(editForm.isPopular)}
                        onChange={(e) =>
                          setEditForm({ ...editForm, isPopular: e.target.checked })
                        }
                        className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor={`edit-pop-${service.id}`} className="text-xs text-charcoal-700 cursor-pointer">
                        Популярна послуга (Bestseller)
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-nude-200">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-nude-300 text-xs text-charcoal-600 hover:bg-white"
                      >
                        Скасувати
                      </button>
                      <button
                        onClick={() => handleUpdate(service.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Зберегти</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Reorder controls & Details */}
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                      {/* Order Controls */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5 sm:pt-0">
                        <span className="text-[11px] font-mono font-bold text-charcoal-400 w-6 text-center">
                          #{actualIndex + 1}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMove(actualIndex, "up")}
                            disabled={actualIndex === 0 || reordering}
                            className="p-1 rounded hover:bg-nude-100 disabled:opacity-20 text-charcoal-600 transition-colors"
                            title="Підняти вище"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(actualIndex, "down")}
                            disabled={actualIndex === services.length - 1 || reordering}
                            className="p-1 rounded hover:bg-nude-100 disabled:opacity-20 text-charcoal-600 transition-colors"
                            title="Опустити нижче"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            service.category === "pedicure"
                              ? "bg-purple-100 text-purple-800"
                              : service.category === "manicure" || service.category === "gel" || service.category === "extension"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {service.category === "pedicure"
                              ? "Педикюр"
                              : service.category === "manicure" || service.category === "gel" || service.category === "extension"
                              ? "Манікюр"
                              : "Додатково"}
                          </span>
                          <h4 className="font-serif text-base font-semibold text-charcoal-900">
                            {service.titleUa}{" "}
                            <span className="text-charcoal-400 font-normal">/ {service.titlePl}</span>
                          </h4>
                          {service.isPopular && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-blush-100 text-gold-700 px-1.5 py-0.5 rounded">
                              <Flame className="w-3 h-3 text-pink-600" />
                              <span>Bestseller</span>
                            </span>
                          )}
                        </div>
                        {service.descriptionUa && (
                          <p className="text-xs text-charcoal-500 mt-1 max-w-xl line-clamp-2">
                            {service.descriptionUa}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Duration, Price & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 self-end sm:self-center pl-10 sm:pl-0">
                      {service.durationMin && (
                        <span className="text-xs text-charcoal-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {service.durationMin} хв
                        </span>
                      )}

                      <span className="font-serif text-lg font-bold text-charcoal-900 min-w-[70px] text-right">
                        {service.pricePln} zł
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(service)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:bg-nude-100 transition-colors"
                          title="Редагувати"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
