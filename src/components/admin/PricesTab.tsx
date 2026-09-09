"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Clock, Flame, RefreshCw } from "lucide-react";
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
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newForm),
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

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-semibold text-charcoal-900">
            Керування прайс-листом ({services.length} послуг)
          </h3>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Зміни відразу відображаються на головній сторінці для клієнток
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? "Скасувати" : "Додати послугу"}</span>
        </button>
      </div>

      {/* Add New Service Card */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl p-6 shadow-card border-2 border-gold-400/60 space-y-4 animate-fadeIn"
        >
          <h4 className="font-serif text-lg font-semibold text-charcoal-900">
            Створення нової послуги
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Категорія
              </label>
              <select
                value={newForm.category}
                onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none bg-white"
              >
                <option value="manicure">Манікюр (Manicure)</option>
                <option value="gel">Гель / Укріплення (Żel)</option>
                <option value="extension">Нарощування (Przedłużanie)</option>
                <option value="care">Догляд / Додатково (Pielęgnacja)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ціна (PLN)
              </label>
              <input
                type="number"
                value={newForm.pricePln}
                onChange={(e) => setNewForm({ ...newForm, pricePln: Number(e.target.value) })}
                required
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
                Назва (UA)
              </label>
              <input
                type="text"
                value={newForm.titleUa}
                onChange={(e) => setNewForm({ ...newForm, titleUa: e.target.value })}
                placeholder="Манікюр гібридний"
                required
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Tytuł (PL)
              </label>
              <input
                type="text"
                value={newForm.titlePl}
                onChange={(e) => setNewForm({ ...newForm, titlePl: e.target.value })}
                placeholder="Manicure hybrydowy"
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPopular"
              checked={newForm.isPopular}
              onChange={(e) => setNewForm({ ...newForm, isPopular: e.target.checked })}
              className="rounded text-gold-600 focus:ring-gold-500"
            />
            <label htmlFor="isPopular" className="text-xs font-medium text-charcoal-700">
              Позначити як &ldquo;Популярна послуга (Bestseller)&rdquo;
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Зберегти послугу
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-nude-200 divide-y divide-nude-100">
        {loading ? (
          <p className="text-sm text-charcoal-500">Завантаження...</p>
        ) : (
          services.map((service) => {
            const isEditing = editingId === service.id;

            return (
              <div key={service.id} className="py-4 first:pt-0 last:pb-0">
                {isEditing ? (
                  <div className="space-y-4 p-4 rounded-xl bg-nude-50 border border-nude-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
                          Категорія
                        </label>
                        <select
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm({ ...editForm, category: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs bg-white"
                        >
                          <option value="manicure">Манікюр</option>
                          <option value="gel">Гель</option>
                          <option value="extension">Нарощування</option>
                          <option value="care">Догляд / Додатково</option>
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

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg border border-nude-300 text-xs text-charcoal-600 hover:bg-white"
                      >
                        Скасувати
                      </button>
                      <button
                        onClick={() => handleUpdate(service.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Зберегти</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-nude-100 text-charcoal-600 uppercase font-mono font-medium">
                          {service.category}
                        </span>
                        <h4 className="font-serif text-base font-semibold text-charcoal-900">
                          {service.titleUa} <span className="text-charcoal-400 font-normal">/ {service.titlePl}</span>
                        </h4>
                        {service.isPopular && (
                          <Flame className="w-3.5 h-3.5 text-pink-600" />
                        )}
                      </div>
                      {service.descriptionUa && (
                        <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
                          {service.descriptionUa}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      {service.durationMin && (
                        <span className="text-xs text-charcoal-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {service.durationMin} хв
                        </span>
                      )}

                      <span className="font-serif text-lg font-bold text-charcoal-900">
                        {service.pricePln} zł
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(service)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:bg-nude-100"
                          title="Редагувати"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
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
