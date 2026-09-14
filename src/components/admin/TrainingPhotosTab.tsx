"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, RefreshCw, GraduationCap, Award, Crosshair, X, Check } from "lucide-react";
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

  // Edit Position Modal State
  const [editingItem, setEditingItem] = useState<TrainingPhotoItem | null>(null);
  const [editingPosition, setEditingPosition] = useState("50% 50%");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/training-photos");
      const data = await res.json();
      setItems(data);
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
        }),
      });

      if (res.ok) {
        setImageUrl("");
        setFile(null);
        setPreviewUrl("");
        setTitlePl("");
        setTitleUa("");
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
        setItems(items.filter((item) => item.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.error || "Не вдалося видалити фото");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePosition = async () => {
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/training-photos/${editingItem.id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          objectPosition: editingPosition,
        }),
      });

      if (res.ok) {
        setItems(
          items.map((item) =>
            item.id === editingItem.id
              ? { ...item, objectPosition: editingPosition }
              : item
          )
        );
        setEditingItem(null);
      } else {
        const errData = await res.json();
        alert(errData.error || "Не вдалося оновити кадрування");
      }
    } catch (e: any) {
      alert(e?.message || "Помилка оновлення");
    } finally {
      setSavingEdit(false);
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
                      className="text-xs text-red-600 hover:underline"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none bg-white font-medium"
                >
                  <option value="process">Процес навчання (Proces szkoleń)</option>
                  <option value="certificates">Випускниці та дипломи (Kursantki i certyfikaty)</option>
                  <option value="practice">Практика на моделях (Praktyka na modelkach)</option>
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
                    <span>Завантаження фото...</span>
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

      {/* Existing Training Photos Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-charcoal-900">
            Опубліковані фотографії з курсів ({items.length})
          </h3>
          <button
            onClick={fetchItems}
            className="p-2 rounded-lg text-charcoal-600 hover:bg-nude-100 transition-colors cursor-pointer"
            title="Оновити список"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-charcoal-500">Завантаження галереї...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-nude-200 border border-nude-200 shadow-xs"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.titleUa || "Training photo"}
                  fill
                  style={{ objectPosition: item.objectPosition || "center" }}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-charcoal-900/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-white">
                  <div className="text-[10px] font-bold bg-charcoal-800/90 px-2 py-0.5 rounded w-fit uppercase">
                    {getCategoryLabel(item.category)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs line-clamp-1">
                      {item.titleUa || item.titlePl || "Без підпису"}
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(item);
                          setEditingPosition(item.objectPosition || "50% 50%");
                        }}
                        className="p-1.5 px-2.5 rounded-lg bg-white/20 hover:bg-gold-600 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Змінити кадрування"
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>Фокус</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shrink-0 cursor-pointer"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Framing Modal for Published Photos */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 border border-nude-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-nude-200 pb-3">
              <div className="flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-gold-700" />
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  Змінити кадрування передпоказу
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full text-charcoal-500 hover:bg-nude-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CropPositionPicker
              imageUrl={editingItem.imageUrl}
              value={editingPosition}
              onChange={setEditingPosition}
              aspectRatio="4/3"
              label="Позиціонування кадру (4:3)"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
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
                onClick={handleSavePosition}
                className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-soft disabled:opacity-50 cursor-pointer"
              >
                {savingEdit ? (
                  <span>Збереження...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-gold-300" />
                    <span>Зберегти новий фокус</span>
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
