"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Upload,
  ExternalLink,
  Play,
  Clock,
  Eye,
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";
import { DefaultBonusVideo, defaultBonusVideos } from "@/lib/defaultData";

interface VideosManagerProps {
  onCountChange?: (count: number) => void;
}

const defaultNewVideo = {
  titleUa: "",
  titlePl: "",
  descriptionUa: "",
  descriptionPl: "",
  badgeUa: "Безкоштовний відеоурок",
  badgePl: "Darmowa lekcja wideo",
  buttonTextUa: "Дивитися відео",
  buttonTextPl: "Oglądaj wideo",
  videoUrlUa: "",
  videoUrlPl: "",
  coverUrl: "",
  duration: "15 хв",
  sortOrder: 0,
  isActive: true,
};

export default function VideosManager({ onCountChange }: VideosManagerProps) {
  const [videos, setVideos] = useState<DefaultBonusVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState(defaultNewVideo);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DefaultBonusVideo>>({});

  // Uploading states
  const [uploadingUa, setUploadingUa] = useState(false);
  const [uploadingPl, setUploadingPl] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Video source modes: "url" | "file"
  const [videoModeUa, setVideoModeUa] = useState<"url" | "file">("url");
  const [videoModePl, setVideoModePl] = useState<"url" | "file">("url");

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bonus-videos", {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setVideos(data);
          if (onCountChange) onCountChange(data.length);
        }
      }
    } catch (err) {
      console.error("Failed to load bonus videos:", err);
      setVideos(defaultBonusVideos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Upload handler for files (MP4 or images)
  const handleFileUpload = async (
    file: File,
    type: "videoUa" | "videoPl" | "cover",
    isEdit = false
  ) => {
    if (!file) return;

    if (type === "videoUa") setUploadingUa(true);
    if (type === "videoPl") setUploadingPl(true);
    if (type === "cover") setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAdminHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      if (isEdit) {
        if (type === "videoUa") setEditForm((prev) => ({ ...prev, videoUrlUa: data.url }));
        if (type === "videoPl") setEditForm((prev) => ({ ...prev, videoUrlPl: data.url }));
        if (type === "cover") setEditForm((prev) => ({ ...prev, coverUrl: data.url }));
      } else {
        if (type === "videoUa") setNewForm((prev) => ({ ...prev, videoUrlUa: data.url }));
        if (type === "videoPl") setNewForm((prev) => ({ ...prev, videoUrlPl: data.url }));
        if (type === "cover") setNewForm((prev) => ({ ...prev, coverUrl: data.url }));
      }
    } catch (err: any) {
      alert("Помилка завантаження файлу: " + (err.message || "Невідома помилка"));
    } finally {
      if (type === "videoUa") setUploadingUa(false);
      if (type === "videoPl") setUploadingPl(false);
      if (type === "cover") setUploadingCover(false);
    }
  };

  // Create Video
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.titleUa || !newForm.titlePl) {
      alert("Будь ласка, введіть назву відео для UA та PL");
      return;
    }

    if (!newForm.videoUrlUa && !newForm.videoUrlPl) {
      alert("Вкажіть посилання або файл відео хоча б для однієї мови");
      return;
    }

    try {
      const res = await fetch("/api/bonus-videos", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create video");

      setVideos((prev) => [data, ...prev]);
      if (onCountChange) onCountChange(videos.length + 1);
      setIsAdding(false);
      setNewForm(defaultNewVideo);
    } catch (err: any) {
      alert("Помилка: " + (err.message || "Не вдалося додати відео"));
    }
  };

  // Update Video
  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/bonus-videos/${id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update video");

      setVideos((prev) => prev.map((v) => (v.id === id ? data : v)));
      setEditingId(null);
      setEditForm({});
    } catch (err: any) {
      alert("Помилка оновлення: " + (err.message || "Не вдалося оновити відео"));
    }
  };

  // Delete Video
  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей відеоурок?")) return;

    try {
      const res = await fetch(`/api/bonus-videos/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      if (res.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        if (onCountChange) onCountChange(videos.length - 1);
      } else {
        alert("Не вдалося видалити відео.");
      }
    } catch (err) {
      console.error(err);
      alert("Помилка при видаленні.");
    }
  };

  // Toggle active
  const handleToggleActive = async (item: DefaultBonusVideo) => {
    if (!item.id) return;
    const nextState = !item.isActive;
    try {
      const res = await fetch(`/api/bonus-videos/${item.id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ isActive: nextState }),
      });
      if (res.ok) {
        setVideos((prev) =>
          prev.map((v) => (v.id === item.id ? { ...v, isActive: nextState } : v))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder videos
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === videos.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...videos];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id!,
      sortOrder: idx + 1,
    }));

    setVideos(reordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
    setReordering(true);
    setReorderSuccess(false);

    try {
      const res = await fetch("/api/bonus-videos/reorder", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ items: payload }),
      });

      if (res.ok) {
        setReorderSuccess(true);
        setTimeout(() => setReorderSuccess(false), 3000);
      } else {
        alert("Помилка збереження порядку.");
        fetchVideos();
      }
    } catch (err) {
      console.error(err);
      fetchVideos();
    } finally {
      setReordering(false);
    }
  };

  const startEdit = (video: DefaultBonusVideo) => {
    setEditingId(video.id || null);
    setEditForm({ ...video });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-nude-200 shadow-soft">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              Відеоуроки & Безкоштовні подарунки ({videos.length})
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-800">
              Відео-бонуси
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1 max-w-2xl">
            Користувачі заповнюють форму (Instagram, Email, досвід) перед переглядом, після чого дивляться відео прямо на сайті.
            Якщо для польської мови (PL) відео не додане, воно буде <span className="font-semibold text-charcoal-800">повністю невидимим</span> для польських користувачів.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
            }}
            className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? "Скасувати" : "+ Додати відеоурок"}</span>
          </button>

          <button
            type="button"
            onClick={fetchVideos}
            disabled={loading}
            className="p-2.5 rounded-xl border border-nude-300 text-charcoal-600 hover:text-charcoal-900 hover:bg-nude-50 transition-colors"
            title="Оновити список"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {reorderSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Порядок відеоуроків успішно збережено!</span>
        </div>
      )}

      {/* Add New Video Form Card */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gold-400 shadow-xl space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-nude-200 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gold-100 text-gold-800">
                <Film className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-serif text-lg font-bold text-charcoal-900">
                  Додати новий відеоурок
                </h4>
                <p className="text-xs text-charcoal-500">
                  Вкажіть назву, опис та посилання або файл відео для UA та PL
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-nude-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title UA */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Назва відео (UA) <span className="text-gold-600">*</span>
              </label>
              <input
                type="text"
                required
                value={newForm.titleUa}
                onChange={(e) => setNewForm({ ...newForm, titleUa: e.target.value })}
                placeholder="напр. Майстер-клас: Тонкі та міцні торці без сколів"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C7] rounded-xl text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>

            {/* Title PL */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Tytuł wideo (PL) <span className="text-gold-600">*</span>
              </label>
              <input
                type="text"
                required
                value={newForm.titlePl}
                onChange={(e) => setNewForm({ ...newForm, titlePl: e.target.value })}
                placeholder="np. Masterclass: Cienkie i trwałe krawędzie bez odprysków"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DDD5C7] rounded-xl text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Description UA */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Опис відео (UA)
              </label>
              <textarea
                rows={2}
                value={newForm.descriptionUa}
                onChange={(e) => setNewForm({ ...newForm, descriptionUa: e.target.value })}
                placeholder="Коротко про що відео: які помилки розбираються, які техніки демонструються..."
                className="w-full px-3.5 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>

            {/* Description PL */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Opis wideo (PL)
              </label>
              <textarea
                rows={2}
                value={newForm.descriptionPl}
                onChange={(e) => setNewForm({ ...newForm, descriptionPl: e.target.value })}
                placeholder="Krótki opis lekcji wideo po polsku..."
                className="w-full px-3.5 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>
          </div>

          {/* Video Sources UA & PL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-5 rounded-2xl bg-nude-50/70 border border-nude-200">
            {/* UA Video Source */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                  <span>🇺🇦 Відео для української версії</span>
                  <span className="text-gold-600">*</span>
                </span>
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-nude-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setVideoModeUa("url")}
                    className={`px-2 py-0.5 rounded-md font-medium ${videoModeUa === "url" ? "bg-charcoal-900 text-white" : "text-charcoal-600"}`}
                  >
                    Посилання
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoModeUa("file")}
                    className={`px-2 py-0.5 rounded-md font-medium ${videoModeUa === "file" ? "bg-charcoal-900 text-white" : "text-charcoal-600"}`}
                  >
                    Завантажити файл
                  </button>
                </div>
              </div>

              {videoModeUa === "url" ? (
                <div>
                  <input
                    type="text"
                    value={newForm.videoUrlUa}
                    onChange={(e) => setNewForm({ ...newForm, videoUrlUa: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... або Vimeo / MP4"
                    className="w-full px-3.5 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs font-mono text-charcoal-900"
                  />
                  <p className="text-[10px] text-charcoal-500 mt-1">
                    Підтримуються посилання з YouTube (включаючи unlisted), Vimeo або прямий MP4.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-gold-300 hover:border-gold-500 text-charcoal-800 text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-gold-600" />
                    <span>{uploadingUa ? "Завантажуємо..." : "Вибрати MP4 файл"}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "videoUa", false);
                      }}
                    />
                  </label>
                  {newForm.videoUrlUa && (
                    <span className="text-xs text-emerald-700 font-medium truncate">
                      ✅ {newForm.videoUrlUa}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* PL Video Source */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                  <span>🇵🇱 Wideo dla polskiej wersji (PL)</span>
                </span>
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-nude-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setVideoModePl("url")}
                    className={`px-2 py-0.5 rounded-md font-medium ${videoModePl === "url" ? "bg-charcoal-900 text-white" : "text-charcoal-600"}`}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoModePl("file")}
                    className={`px-2 py-0.5 rounded-md font-medium ${videoModePl === "file" ? "bg-charcoal-900 text-white" : "text-charcoal-600"}`}
                  >
                    Plik MP4
                  </button>
                </div>
              </div>

              {videoModePl === "url" ? (
                <div>
                  <input
                    type="text"
                    value={newForm.videoUrlPl}
                    onChange={(e) => setNewForm({ ...newForm, videoUrlPl: e.target.value })}
                    placeholder="Link do wideo PL (lub zostaw puste)"
                    className="w-full px-3.5 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs font-mono text-charcoal-900"
                  />
                  <p className="text-[10px] text-amber-700 font-medium mt-1">
                    ℹ️ Якщо залишити порожнім — це відео буде повністю приховане для польських користувачів.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-gold-300 hover:border-gold-500 text-charcoal-800 text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-gold-600" />
                    <span>{uploadingPl ? "Ładowanie..." : "Wybierz plik MP4"}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "videoPl", false);
                      }}
                    />
                  </label>
                  {newForm.videoUrlPl && (
                    <span className="text-xs text-emerald-700 font-medium truncate">
                      ✅ {newForm.videoUrlPl}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cover image block */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-nude-300 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-gold-600" />
                  <span>Обкладинка-прев'ю відео</span>
                  <span className="text-[10px] font-normal text-charcoal-500 normal-case">(необов'язково)</span>
                </label>
                <p className="text-[11px] text-charcoal-500 mt-0.5">
                  Відображається як постер відео на сайті до моменту запуску.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold-50 border border-gold-200 text-gold-800 text-[11px] font-semibold shrink-0">
                <span>📐 Формат: 16:9 (1280×720 або 1920×1080 px)</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-5">
              {/* Live Preview Box */}
              <div className="relative w-full md:w-56 aspect-video rounded-2xl bg-charcoal-900 border-2 border-gold-300/60 overflow-hidden shrink-0 shadow-sm flex items-center justify-center group/preview">
                {newForm.coverUrl ? (
                  <>
                    <img
                      src={newForm.coverUrl}
                      alt="Прев'ю обкладинки"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 fill-current translate-x-0.5 text-white" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewForm({ ...newForm, coverUrl: "" })}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-sm"
                      title="Видалити обкладинку"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center text-charcoal-400">
                    <Film className="w-8 h-8 text-gold-400/60 mx-auto mb-1" />
                    <span className="text-[10px] text-charcoal-400 block">
                      Без фото (темний градієнт)
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Controls & URL input */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white border border-gold-400 hover:border-gold-600 hover:bg-gold-50/50 text-charcoal-900 text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-4 h-4 text-gold-600" />
                    <span>
                      {uploadingCover
                        ? "Завантаження фото..."
                        : newForm.coverUrl
                        ? "Замінити фото обкладинки"
                        : "Завантажити фото з пристрою"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "cover", false);
                      }}
                    />
                  </label>

                  {newForm.coverUrl && (
                    <button
                      type="button"
                      onClick={() => setNewForm({ ...newForm, coverUrl: "" })}
                      className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Прибрати фото</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider mb-1">
                    Або вкажіть прямий URL / шлях до фото
                  </label>
                  <input
                    type="text"
                    value={newForm.coverUrl}
                    onChange={(e) => setNewForm({ ...newForm, coverUrl: e.target.value })}
                    placeholder="/uploads/cover.jpg або https://..."
                    className="w-full px-3.5 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs font-mono text-charcoal-900"
                  />
                </div>

                <p className="text-[11px] text-charcoal-500 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-nude-200">
                  ℹ️ <span className="font-semibold text-charcoal-700">Порада:</span> найкраще підходять чіткі горизонтальні фото з пропорцією <span className="font-semibold text-charcoal-800">16:9</span> (1280×720 або 1920×1080 px, JPG/PNG/WebP). Фото автоматично адаптується під блок без чорних рамок з боків.
                </p>
              </div>
            </div>
          </div>

          {/* Duration & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Тривалість (напр. 15 хв)
              </label>
              <input
                type="text"
                value={newForm.duration}
                onChange={(e) => setNewForm({ ...newForm, duration: e.target.value })}
                placeholder="15 хв"
                className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Бейдж відео
              </label>
              <input
                type="text"
                value={newForm.badgeUa}
                onChange={(e) => setNewForm({ ...newForm, badgeUa: e.target.value })}
                placeholder="Безкоштовний відеоурок"
                className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs text-charcoal-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-200">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-nude-100 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold uppercase tracking-wider shadow-md transition-colors"
            >
              Зберегти відеоурок
            </button>
          </div>
        </form>
      )}

      {/* Videos List */}
      <div className="space-y-4">
        {videos.length === 0 && !loading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-nude-200 shadow-soft">
            <Film className="w-12 h-12 mx-auto text-gold-400 mb-3 opacity-80" />
            <h4 className="font-serif text-lg font-bold text-charcoal-900 mb-1">
              Відеоуроки ще не додані
            </h4>
            <p className="text-xs text-charcoal-500 max-w-md mx-auto mb-4">
              Додайте відео-подарунок (майстер-клас, фішки швидкості або розбір помилок), щоб залучати підписників та збирати контакти майстрів.
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Додати перший відеоурок</span>
            </button>
          </div>
        ) : (
          videos.map((video, idx) => {
            const isEditingThis = editingId === video.id;

            if (isEditingThis) {
              return (
                <div
                  key={video.id || idx}
                  className="bg-white p-6 rounded-3xl border-2 border-gold-400 shadow-xl space-y-5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-nude-200 pb-3">
                    <h5 className="font-serif text-base font-bold text-charcoal-900">
                      Редагування відеоуроку
                    </h5>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                        Назва UA
                      </label>
                      <input
                        type="text"
                        value={editForm.titleUa || ""}
                        onChange={(e) => setEditForm({ ...editForm, titleUa: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                        Tytuł PL
                      </label>
                      <input
                        type="text"
                        value={editForm.titlePl || ""}
                        onChange={(e) => setEditForm({ ...editForm, titlePl: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                        Опис UA
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.descriptionUa || ""}
                        onChange={(e) => setEditForm({ ...editForm, descriptionUa: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                        Opis PL
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.descriptionPl || ""}
                        onChange={(e) => setEditForm({ ...editForm, descriptionPl: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-nude-50 border border-nude-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                        🇺🇦 Відео URL або файл (UA)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editForm.videoUrlUa || ""}
                          onChange={(e) => setEditForm({ ...editForm, videoUrlUa: e.target.value })}
                          placeholder="YouTube / Vimeo / MP4"
                          className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-xl text-xs font-mono"
                        />
                        <label className="cursor-pointer p-1.5 rounded-xl border border-nude-300 bg-white hover:bg-nude-100 text-charcoal-700 text-xs shrink-0" title="Завантажити файл">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "videoUa", true);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-1">
                        🇵🇱 Wideo URL або файл (PL)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editForm.videoUrlPl || ""}
                          onChange={(e) => setEditForm({ ...editForm, videoUrlPl: e.target.value })}
                          placeholder="YouTube / Vimeo / MP4 (порожньо = приховано)"
                          className="flex-1 px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-xl text-xs font-mono"
                        />
                        <label className="cursor-pointer p-1.5 rounded-xl border border-nude-300 bg-white hover:bg-nude-100 text-charcoal-700 text-xs shrink-0" title="Завантажити файл">
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "videoPl", true);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cover image edit block */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-nude-300 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="text-xs font-bold text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-gold-600" />
                          <span>Обкладинка-прев'ю відео</span>
                        </label>
                        <p className="text-[11px] text-charcoal-500 mt-0.5">
                          Зміна або видалення постеру для цього відеоуроку.
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold-50 border border-gold-200 text-gold-800 text-[11px] font-semibold shrink-0">
                        <span>📐 Формат: 16:9 (1280×720 або 1920×1080 px)</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-5">
                      {/* Live Preview Box */}
                      <div className="relative w-full md:w-56 aspect-video rounded-2xl bg-charcoal-900 border-2 border-gold-300/60 overflow-hidden shrink-0 shadow-sm flex items-center justify-center group/preview">
                        {editForm.coverUrl ? (
                          <>
                            <img
                              src={editForm.coverUrl}
                              alt="Прев'ю обкладинки"
                              className="absolute inset-0 w-full h-full object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-md">
                                <Play className="w-4 h-4 fill-current translate-x-0.5 text-white" />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditForm((prev) => ({ ...prev, coverUrl: "" }))}
                              className="absolute top-2 right-2 p-1 rounded-lg bg-rose-600/90 text-white hover:bg-rose-700 transition-colors shadow-sm"
                              title="Видалити обкладинку"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="p-3 text-center text-charcoal-400">
                            <Film className="w-8 h-8 text-gold-400/60 mx-auto mb-1" />
                            <span className="text-[10px] text-charcoal-400 block">
                              Без фото (темний градієнт)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Upload Controls & URL input */}
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white border border-gold-400 hover:border-gold-600 hover:bg-gold-50/50 text-charcoal-900 text-xs font-semibold inline-flex items-center gap-2 shadow-xs transition-colors">
                            <Upload className="w-4 h-4 text-gold-600" />
                            <span>
                              {uploadingCover
                                ? "Завантаження фото..."
                                : editForm.coverUrl
                                ? "Замінити фото обкладинки"
                                : "Завантажити фото з пристрою"}
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file, "cover", true);
                              }}
                            />
                          </label>

                          {editForm.coverUrl && (
                            <button
                              type="button"
                              onClick={() => setEditForm((prev) => ({ ...prev, coverUrl: "" }))}
                              className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Прибрати фото</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-charcoal-600 uppercase tracking-wider mb-1">
                            URL або шлях до фото
                          </label>
                          <input
                            type="text"
                            value={editForm.coverUrl || ""}
                            onChange={(e) => setEditForm({ ...editForm, coverUrl: e.target.value })}
                            placeholder="/uploads/cover.jpg або https://..."
                            className="w-full px-3.5 py-2 bg-white border border-[#DDD5C7] rounded-xl text-xs font-mono text-charcoal-900"
                          />
                        </div>

                        <p className="text-[11px] text-charcoal-500 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-nude-200">
                          ℹ️ <span className="font-semibold text-charcoal-700">Порада:</span> найкраще підходять горизонтальні фото <span className="font-semibold text-charcoal-800">16:9</span> (1280×720 або 1920×1080 px, JPG/PNG/WebP). Фото автоматично масштабується на весь блок без чорних смуг.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                        Тривалість (напр. 15 хв)
                      </label>
                      <input
                        type="text"
                        value={editForm.duration || ""}
                        onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                        placeholder="15 хв"
                        className="w-full px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                        Переглядів
                      </label>
                      <input
                        type="number"
                        value={editForm.viewsCount || 0}
                        onChange={(e) => setEditForm({ ...editForm, viewsCount: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 bg-white border border-[#DDD5C7] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-200">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-nude-100"
                    >
                      Скасувати
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(video.id!)}
                      className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold uppercase tracking-wider shadow-md"
                    >
                      Зберегти зміни
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={video.id || idx}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-nude-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-gold-300 transition-all"
              >
                {/* Left: Thumbnail and details */}
                <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
                  <div className="relative w-28 sm:w-32 aspect-video rounded-2xl bg-charcoal-900 text-white shrink-0 overflow-hidden border border-gold-400/30">
                    {video.coverUrl ? (
                      <img
                        src={video.coverUrl}
                        alt={video.titleUa}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="w-7 h-7 text-gold-400 opacity-60" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <Play className="w-5 h-5 fill-current text-white/90" />
                    </div>
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-50 text-gold-800 border border-gold-200">
                        {video.badgeUa || "Відео"}
                      </span>
                      {video.duration && (
                        <span className="text-[11px] font-mono text-charcoal-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gold-600" />
                          <span>{video.duration}</span>
                        </span>
                      )}
                      {video.viewsCount !== undefined && video.viewsCount > 0 && (
                        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>{video.viewsCount} переглядів</span>
                        </span>
                      )}
                      {!video.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-charcoal-100 text-charcoal-600">
                          Приховано
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-base font-bold text-charcoal-900 truncate">
                      {video.titleUa}
                    </h4>
                    <p className="text-xs text-charcoal-500 font-serif truncate">
                      PL: {video.titlePl}
                    </p>

                    {/* Language video availability badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {video.videoUrlUa ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span>🇺🇦 UA: Доступно</span>
                          <Check className="w-3 h-3 text-emerald-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-charcoal-50 text-charcoal-400 border border-charcoal-200">
                          <span>🇺🇦 UA: Не завантажено</span>
                        </span>
                      )}

                      {video.videoUrlPl ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span>🇵🇱 PL: Dostępne</span>
                          <Check className="w-3 h-3 text-emerald-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium" title="Користувачі з польської версії не бачать це відео">
                          <span>🇵🇱 PL: Приховано для PL (немає відео)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1 border border-nude-200 rounded-xl p-1 bg-nude-50/50">
                    <button
                      type="button"
                      disabled={idx === 0 || reordering}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Підняти вище"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === videos.length - 1 || reordering}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Опустити нижче"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Active Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(video)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${video.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"}`}
                    title={video.isActive ? "Натисніть, щоб приховати" : "Натисніть, щоб опублікувати"}
                  >
                    {video.isActive ? "Активне" : "Приховане"}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => startEdit(video)}
                    className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-nude-100 transition-colors"
                    title="Редагувати"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(video.id!)}
                    className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
