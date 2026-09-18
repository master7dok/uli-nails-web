"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  GraduationCap,
  Award,
  Crosshair,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Pencil,
  Loader2,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";
import CropPositionPicker from "./CropPositionPicker";

interface TrainingPhotoItem {
  id: string;
  imageUrl: string;
  titlePl?: string | null;
  titleUa?: string | null;
  category: string;
  objectPosition?: string | null;
  featured: boolean;
  sortOrder: number;
}

const TRAINING_CATEGORIES = [
  { value: "process", label: "Процес навчання (Proces szkoleń)" },
  { value: "certificates", label: "Випускниці та дипломи (Kursantki i certyfikaty)" },
  { value: "practice", label: "Практика на моделях (Praktyka na modelkach)" },
  { value: "students", label: "Учениці (Kursantki)" },
  { value: "pedicure", label: "Педикюр (Pedicure)" },
];

export default function TrainingPhotosTab() {
  const [items, setItems] = useState<TrainingPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [titlePl, setTitlePl] = useState("");
  const [titleUa, setTitleUa] = useState("");
  const [category, setCategory] = useState("process");
  const [objectPosition, setObjectPosition] = useState("50% 50%");

  // Edit Modal State (Category, Title UA, Title PL, Crop Position)
  const [editingItem, setEditingItem] = useState<TrainingPhotoItem | null>(null);
  const [editTitleUa, setEditTitleUa] = useState("");
  const [editTitlePl, setEditTitlePl] = useState("");
  const [editCategory, setEditCategory] = useState("process");
  const [editingPosition, setEditingPosition] = useState("50% 50%");
  const [savingEdit, setSavingEdit] = useState(false);

  // Reorder State
  const [reordering, setReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/training-photos");
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setImageUrl(""); // clear text input if file chosen
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalUrl = imageUrl;

      // 1. If local file was selected, upload it
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const upRes = await fetch("/api/upload", {
          method: "POST",
          headers: getAdminHeaders(),
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.error || "Upload failed");
        finalUrl = upData.url;
      }

      if (!finalUrl) {
        alert("Будь ласка, оберіть фото з комп'ютера/телефону або вкажіть посилання");
        setUploading(false);
        return;
      }

      // 2. Save to training-photos with custom objectPosition
      const res = await fetch("/api/training-photos", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          imageUrl: finalUrl,
          titlePl,
          titleUa,
          category,
          objectPosition,
          featured: false,
          sortOrder: items.length + 1,
        }),
      });

      if (res.ok) {
        setImageUrl("");
        setFile(null);
        setPreviewUrl("");
        setTitlePl("");
        setTitleUa("");
        setCategory("process");
        setObjectPosition("50% 50%");
        fetchItems();
      } else {
        const errData = await res.json();
        alert(errData.error || "Помилка збереження фото з навчання");
      }
    } catch (err: any) {
      alert(err.message || "Помилка при завантаженні");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Видалити це фото з галереї навчань?")) return;

    try {
      const res = await fetch(`/api/training-photos/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.error || "Не вдалося видалити фото");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Edit Modal with full photo data
  const openEditModal = (item: TrainingPhotoItem) => {
    setEditingItem(item);
    setEditTitleUa(item.titleUa || "");
    setEditTitlePl(item.titlePl || "");
    setEditCategory(item.category || "process");
    setEditingPosition(item.objectPosition || "50% 50%");
  };

  // Save changes to Category, Title UA, Title PL, and Framing
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/training-photos/${editingItem.id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          titleUa: editTitleUa,
          titlePl: editTitlePl,
          category: editCategory,
          objectPosition: editingPosition,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...item, ...updated } : item))
        );
        setEditingItem(null);
      } else {
        const errData = await res.json();
        alert(errData.error || "Не вдалося зберегти зміни");
      }
    } catch (e: any) {
      alert(e?.message || "Помилка оновлення");
    } finally {
      setSavingEdit(false);
    }
  };

  // Reorder Handler (move item left/prev or right/next in training gallery)
  const handleMove = async (index: number, direction: "prev" | "next") => {
    if (direction === "prev" && index === 0) return;
    if (direction === "next" && index === items.length - 1) return;

    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    const newItems = [...items];

    // Swap items
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sortOrder sequence
    const reorderedPayload = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    setItems(reorderedPayload);
    setReordering(true);

    try {
      const res = await fetch("/api/training-photos/reorder", {
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
        setTimeout(() => setReorderSuccess(false), 2000);
      } else {
        console.error("Reorder request failed");
        fetchItems(); // revert on failure
      }
    } catch (e) {
      console.error("Reorder failed:", e);
      fetchItems();
    } finally {
      setReordering(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "process":
        return "Процес навчання";
      case "certificates":
        return "Випускниці / Дипломи";
      case "practice":
        return "Практика на моделях";
      case "students":
        return "Учениці";
      case "pedicure":
        return "Педикюр";
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-10">
      {/* Upload / Add Photo Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-nude-200">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700">
            <GraduationCap className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-charcoal-900">
            Додати фото з попередніх навчань
          </h3>
        </div>
        <p className="text-xs text-charcoal-500 mb-6">
          Завантажуйте фото процесу занять, постановки руки, практики з ученицями або вручення дипломів
        </p>

        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Big File Drop / Picker Zone & Crop Tool */}
            <div className="md:col-span-6 space-y-4">
              <label className="block text-xs font-semibold text-charcoal-700">
                1. Оберіть фотографію з пристрою
              </label>

              {!previewUrl ? (
                <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-gold-400/80 hover:border-gold-600 rounded-2xl bg-nude-50/70 hover:bg-nude-100/70 cursor-pointer transition-colors text-center aspect-[4/3] overflow-hidden group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-gold-700">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-charcoal-900 text-sm">
                      Натисніть тут, щоб обрати фото
                    </span>
                    <span className="text-[11px] text-charcoal-500">
                      JPG, PNG, WebP з вашого телефону або ПК
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  {/* Interactive Crop / Positioning Tool */}
                  <CropPositionPicker
                    imageUrl={previewUrl}
                    value={objectPosition}
                    onChange={setObjectPosition}
                    aspectRatio="4/3"
                    label="Налаштування кадрування для сайту (4:3)"
                  />

                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gold-700 hover:text-gold-800 font-semibold cursor-pointer underline">
                      <span>Обрати інше фото</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl("");
                        setImageUrl("");
                      }}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Скасувати
                    </button>
                  </div>
                </div>
              )}

              {/* Optional URL input */}
              <div className="pt-1">
                <span className="text-[11px] text-charcoal-500 block mb-1">
                  Або вставте пряме посилання на фото (URL):
                </span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value) {
                      setPreviewUrl(e.target.value);
                      setFile(null);
                    }
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none bg-white text-charcoal-800"
                />
              </div>
            </div>

            {/* Right: Meta Details */}
            <div className="md:col-span-6 space-y-4">
              <label className="block text-xs font-semibold text-charcoal-700">
                2. Опис та категорія
              </label>

              <div>
                <label className="block text-xs text-charcoal-600 mb-1">
                  Категорія фотографії
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none bg-white font-medium cursor-pointer"
                >
                  {TRAINING_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-charcoal-600 mb-1">
                  Підпис / опис (Українська)
                </label>
                <input
                  type="text"
                  value={titleUa}
                  onChange={(e) => setTitleUa(e.target.value)}
                  placeholder="Індивідуальна постановка руки та робота з фрезером"
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-charcoal-600 mb-1">
                  Podpis / opis (Polski)
                </label>
                <input
                  type="text"
                  value={titlePl}
                  onChange={(e) => setTitlePl(e.target.value)}
                  placeholder="Indywidualne ułożenie ręki i praca z frezarką"
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3.5 px-6 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 shadow-soft hover:shadow-glow disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Завантаження фото...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Опублікувати в галерею навчань</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Training Photos Grid with Reordering & Full Editing */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-serif text-lg font-semibold text-charcoal-900">
              Опубліковані фотографії з курсів ({items.length})
            </h3>
            {reorderSuccess && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-fadeIn flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5" /> Порядок збережено
              </span>
            )}
            {reordering && (
              <span className="text-xs text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Оновлення черги...
              </span>
            )}
          </div>
          <button
            onClick={fetchItems}
            className="p-2 rounded-lg text-charcoal-600 hover:bg-nude-100 transition-colors cursor-pointer"
            title="Оновити список"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-charcoal-500 mb-4">
          💡 Використовуйте стрілки <strong>◀ / ▶</strong> на фотографіях для швидкої зміни порядку відображення на сайті. Натисніть <strong>«Редагувати»</strong> для зміни опису, категорії чи кадрування.
        </p>

        {loading ? (
          <p className="text-sm text-charcoal-500">Завантаження галереї...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-nude-200 border border-nude-200 shadow-xs flex flex-col justify-between"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.titleUa || "Training photo"}
                  fill
                  style={{ objectPosition: item.objectPosition || "center" }}
                  className="object-cover"
                />

                {/* Permanent subtle top bar with Order Badge & Reorder Controls */}
                <div className="relative z-10 p-2 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-charcoal-900/60 to-transparent">
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-950/80 text-gold-300 font-mono text-[11px] font-bold shadow-xs">
                    #{index + 1}
                  </span>

                  <div className="flex items-center gap-1 bg-charcoal-950/80 rounded-lg p-0.5 shadow-xs">
                    <button
                      type="button"
                      disabled={index === 0 || reordering}
                      onClick={() => handleMove(index, "prev")}
                      className="p-1 rounded-md text-white hover:bg-gold-600 disabled:opacity-25 transition-colors cursor-pointer"
                      title="Перемістити ліворуч (вище)"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1 || reordering}
                      onClick={() => handleMove(index, "next")}
                      className="p-1 rounded-md text-white hover:bg-gold-600 disabled:opacity-25 transition-colors cursor-pointer"
                      title="Перемістити праворуч (нижче)"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Category Badge & Titles & Action Buttons */}
                <div className="relative z-10 p-2.5 flex flex-col justify-end bg-gradient-to-t from-charcoal-950/90 via-charcoal-900/50 to-transparent text-white space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold bg-gold-600/90 text-white px-2 py-0.5 rounded-full w-fit uppercase tracking-wider shadow-xs line-clamp-1">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>

                  <p className="text-xs line-clamp-1 font-medium text-white/95" title={item.titleUa || item.titlePl || ""}>
                    {item.titleUa || item.titlePl || "Без підпису"}
                  </p>

                  <div className="flex items-center justify-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1 rounded-lg bg-white/25 hover:bg-gold-600 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Редагувати опис, категорію та кадрування"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Редагувати</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white transition-colors shrink-0 cursor-pointer shadow-xs"
                      title="Видалити"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Edit Modal for Published Training Photos */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 border border-nude-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-nude-200 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-gold-700" />
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  Редагувати фото з навчання
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full text-charcoal-500 hover:bg-nude-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields: Category, Title UA, Title PL */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Категорія фотографії
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none bg-white font-medium cursor-pointer"
                >
                  {TRAINING_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Підпис / опис (Українська)
                </label>
                <input
                  type="text"
                  value={editTitleUa}
                  onChange={(e) => setEditTitleUa(e.target.value)}
                  placeholder="Індивідуальна постановка руки та робота з фрезером"
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Podpis / opis (Polski)
                </label>
                <input
                  type="text"
                  value={editTitlePl}
                  onChange={(e) => setEditTitlePl(e.target.value)}
                  placeholder="Indywidualne ułożenie ręki i praca z frezarką"
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Interactive Crop Position Picker */}
              <div className="pt-2 border-t border-nude-100">
                <CropPositionPicker
                  imageUrl={editingItem.imageUrl}
                  value={editingPosition}
                  onChange={setEditingPosition}
                  aspectRatio="4/3"
                  label="Кадрування передпоказу (4:3)"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-200">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2.5 rounded-xl border border-nude-300 text-xs font-semibold text-charcoal-700 hover:bg-nude-100 transition-colors cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-soft disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Збереження...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-gold-300" />
                    <span>Зберегти зміни</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
