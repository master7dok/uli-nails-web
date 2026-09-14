"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  CheckCircle2,
  FileDown,
  Upload,
  ExternalLink,
  Gift,
  FileText,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { defaultLeadMagnets, defaultSettings, DefaultLeadMagnet } from "@/lib/defaultData";

interface LeadMagnetItem {
  id: string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: string | null;
  titlePl: string;
  titleUa: string;
  descriptionPl?: string | null;
  descriptionUa?: string | null;
  badgePl?: string | null;
  badgeUa?: string | null;
  buttonTextPl?: string | null;
  buttonTextUa?: string | null;
  coverUrl?: string | null;
  downloadCount?: number;
  sortOrder: number;
  isActive?: boolean;
}

const defaultNewLeadMagnet = {
  fileUrl: "",
  fileName: "",
  fileSize: "",
  titleUa: "",
  titlePl: "",
  descriptionUa: "",
  descriptionPl: "",
  badgeUa: "Безкоштовний PDF",
  badgePl: "Darmowy PDF",
  buttonTextUa: "Завантажити чек-лист",
  buttonTextPl: "Pobierz checklist",
  coverUrl: "",
  sortOrder: 0,
};

export default function ChecklistsTab() {
  const [items, setItems] = useState<LeadMagnetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);
  const [reorderSuccess, setReorderSuccess] = useState(false);

  // Section texts settings
  const [settings, setSettings] = useState<Record<string, string>>({ ...defaultSettings });
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Add item form state
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState(defaultNewLeadMagnet);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Edit item state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LeadMagnetItem>>({});
  const [uploadingEditPdf, setUploadingEditPdf] = useState(false);

  // Unsaved changes tracking
  const initialEditSnapshotRef = useRef<string>("");
  const isDirtyRef = useRef<boolean>(false);
  const historyPushedRef = useRef<boolean>(false);
  const isCleanExitRef = useRef<boolean>(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSavingPending, setIsSavingPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | { type: "browser-back" }
    | { type: "cancel" }
    | { type: "switch-item"; targetItem: LeadMagnetItem }
    | { type: "start-add" }
    | null
  >(null);

  // Load items and settings
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resItems, resSettings] = await Promise.all([
        fetch("/api/lead-magnets"),
        fetch("/api/settings"),
      ]);

      const dataItems = await resItems.json();
      if (Array.isArray(dataItems)) {
        setItems(dataItems);
      }

      const dataSettings = await resSettings.json();
      if (dataSettings && typeof dataSettings === "object") {
        setSettings((prev) => ({ ...prev, ...dataSettings }));
      }
    } catch (e) {
      console.error("Failed to load lead magnets data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Determine dirty state
  const isEditDirty = useMemo(() => {
    if (!editingId) return false;
    return JSON.stringify(editForm) !== initialEditSnapshotRef.current;
  }, [editingId, editForm]);

  const isAddDirty = useMemo(() => {
    if (!isAdding) return false;
    return (
      Boolean(newForm.fileUrl) ||
      Boolean(newForm.titleUa.trim()) ||
      Boolean(newForm.titlePl.trim()) ||
      Boolean(newForm.descriptionUa.trim()) ||
      Boolean(newForm.descriptionPl.trim())
    );
  }, [isAdding, newForm]);

  const isDirty = isEditDirty || isAddDirty;

  useEffect(() => {
    isDirtyRef.current = isDirty;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("admin:unsaved-changes", { detail: { hasUnsaved: isDirty } })
      );
    }
  }, [isDirty]);

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const cleanExitHistory = () => {
    if (historyPushedRef.current && typeof window !== "undefined") {
      isCleanExitRef.current = true;
      historyPushedRef.current = false;
      window.history.back();
    }
  };

  // Popstate intercept
  useEffect(() => {
    const handlePopState = () => {
      if (isCleanExitRef.current) {
        isCleanExitRef.current = false;
        historyPushedRef.current = false;
        return;
      }

      if (editingId || isAdding) {
        if (isDirtyRef.current) {
          if (typeof window !== "undefined") {
            window.history.pushState(
              { adminModal: editingId ? "checklist-edit" : "checklist-add" },
              ""
            );
          }
          setPendingAction({ type: "browser-back" });
          setShowUnsavedModal(true);
        } else {
          historyPushedRef.current = false;
          setEditingId(null);
          setIsAdding(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [editingId, isAdding]);

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setter = isEdit ? setUploadingEditPdf : setUploadingPdf;
    setter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAdminHeaders(),
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Не вдалося завантажити файл.");
      }

      const data = await res.json();
      if (data.url) {
        if (isEdit) {
          setEditForm((prev) => ({
            ...prev,
            fileUrl: data.url,
            fileName: data.fileName || file.name,
            fileSize: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          }));
        } else {
          setNewForm((prev) => ({
            ...prev,
            fileUrl: data.url,
            fileName: data.fileName || file.name,
            fileSize: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          }));
        }
      }
    } catch (err: any) {
      alert("Помилка завантаження PDF: " + (err.message || "Невідома помилка"));
    } finally {
      setter(false);
    }
  };

  // Save section settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Не вдалося зберегти налаштування");

      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 4000);
    } catch (err: any) {
      alert("Помилка: " + (err.message || "Не вдалося зберегти"));
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Item Submit
  const submitCreate = async (): Promise<boolean> => {
    if (!newForm.fileUrl) {
      alert("Будь ласка, завантажте PDF-файл");
      return false;
    }
    if (!newForm.titleUa.trim() || !newForm.titlePl.trim()) {
      alert("Будь ласка, заповніть назву чек-листа українською та польською");
      return false;
    }

    try {
      const res = await fetch("/api/lead-magnets", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newForm),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewForm(defaultNewLeadMagnet);
        cleanExitHistory();
        await fetchData();
        return true;
      } else {
        const err = await res.json();
        alert("Помилка створення: " + (err.error || "Невідома помилка"));
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Помилка мережі при створенні.");
      return false;
    }
  };

  // Edit Item Submit
  const handleUpdate = async (id: string): Promise<boolean> => {
    if (!editForm.titleUa || !editForm.titlePl) {
      alert("Назва матеріалу є обов'язковою.");
      return false;
    }

    try {
      const res = await fetch(`/api/lead-magnets/${id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setEditingId(null);
        cleanExitHistory();
        await fetchData();
        return true;
      } else {
        const err = await res.json();
        alert("Помилка оновлення: " + (err.error || "Невідома помилка"));
        return false;
      }
    } catch (err) {
      console.error(err);
      alert("Помилка оновлення чек-листа.");
      return false;
    }
  };

  // Delete Item
  const handleDelete = async (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цей чек-лист?")) return;

    try {
      const res = await fetch(`/api/lead-magnets/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Не вдалося видалити матеріал.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder Items
  const handleMove = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    setItems(reordered.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
    setReordering(true);
    setReorderSuccess(false);

    try {
      const res = await fetch("/api/lead-magnets/reorder", {
        method: "POST",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ items: payload }),
      });

      if (res.ok) {
        setReorderSuccess(true);
        setTimeout(() => setReorderSuccess(false), 3000);
      } else {
        alert("Помилка збереження порядку.");
        fetchData();
      }
    } catch (err) {
      console.error(err);
      fetchData();
    } finally {
      setReordering(false);
    }
  };

  // Start edit
  const startEdit = (item: LeadMagnetItem) => {
    if (isDirtyRef.current) {
      if (editingId === item.id) return;
      setPendingAction({ type: "switch-item", targetItem: item });
      setShowUnsavedModal(true);
      return;
    }

    const snapshot = JSON.stringify(item);
    initialEditSnapshotRef.current = snapshot;
    setEditingId(item.id);
    setEditForm({ ...item });
    setIsAdding(false);

    if (!historyPushedRef.current && typeof window !== "undefined") {
      window.history.pushState({ adminModal: "checklist-edit", itemId: item.id }, "");
      historyPushedRef.current = true;
    }
  };

  const handleCancelClick = () => {
    if (isDirtyRef.current) {
      setPendingAction({ type: "cancel" });
      setShowUnsavedModal(true);
    } else {
      setEditingId(null);
      setIsAdding(false);
      cleanExitHistory();
    }
  };

  const handleToggleAdd = () => {
    if (isAdding) {
      if (isDirtyRef.current) {
        setPendingAction({ type: "cancel" });
        setShowUnsavedModal(true);
      } else {
        setIsAdding(false);
        cleanExitHistory();
      }
    } else {
      if (isDirtyRef.current && editingId) {
        setPendingAction({ type: "start-add" });
        setShowUnsavedModal(true);
      } else {
        setIsAdding(true);
        setEditingId(null);
        setNewForm(defaultNewLeadMagnet);
        if (!historyPushedRef.current && typeof window !== "undefined") {
          window.history.pushState({ adminModal: "checklist-add" }, "");
          historyPushedRef.current = true;
        }
      }
    }
  };

  const executePendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);

    if (action?.type === "switch-item") {
      const item = action.targetItem;
      initialEditSnapshotRef.current = JSON.stringify(item);
      setEditingId(item.id);
      setEditForm({ ...item });
      setIsAdding(false);
    } else if (action?.type === "start-add") {
      setEditingId(null);
      setIsAdding(true);
      setNewForm(defaultNewLeadMagnet);
    } else {
      setEditingId(null);
      setIsAdding(false);
      cleanExitHistory();
    }
  };

  const handleModalSave = async () => {
    setIsSavingPending(true);
    try {
      let success = false;
      if (editingId) {
        success = await handleUpdate(editingId);
      } else if (isAdding) {
        success = await submitCreate();
      }

      if (success) {
        isDirtyRef.current = false;
        setShowUnsavedModal(false);
        executePendingAction();
      }
    } finally {
      setIsSavingPending(false);
    }
  };

  const handleModalDiscard = () => {
    isDirtyRef.current = false;
    setShowUnsavedModal(false);
    executePendingAction();
  };

  const handleModalCancel = () => {
    setShowUnsavedModal(false);
    setPendingAction(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Section Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-semibold text-charcoal-900">
              Чек-листи & PDF матеріали ({items.length})
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-800">
              Lead Magnets
            </span>
          </div>
          <p className="text-xs text-charcoal-500 mt-1 max-w-2xl">
            Завантажуйте корисні PDF для залучення підписників з реклами Instagram. Відвідувачі зможуть завантажувати їх безпосередньо в 1 клік.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowTextEditor(!showTextEditor)}
            className="px-3.5 py-2 rounded-xl border border-nude-300 hover:border-gold-500 text-charcoal-700 bg-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-gold-600" />
            <span>{showTextEditor ? "Приховати тексти" : "Редагувати тексти секції"}</span>
            {showTextEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleToggleAdd}
            className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? "Скасувати" : "Додати PDF"}</span>
          </button>
        </div>
      </div>

      {/* Accordion: Quick Section Header Texts Editor */}
      {showTextEditor && (
        <form
          onSubmit={handleSaveSettings}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-gold-300/80 space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-nude-100 pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold-600" />
              <h4 className="font-serif text-base font-bold text-charcoal-900">
                Загальні тексти секції «Отримай безкоштовно CHECKLIST» на сайті
              </h4>
            </div>

            {settingsSaved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Збережено!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title UA & PL */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇺🇦 Заголовок секції (UA)
              </label>
              <input
                type="text"
                value={settings.text_checklist_title_ua ?? ""}
                onChange={(e) => setSettings({ ...settings, text_checklist_title_ua: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇵🇱 Заголовок секції (PL)
              </label>
              <input
                type="text"
                value={settings.text_checklist_title_pl ?? ""}
                onChange={(e) => setSettings({ ...settings, text_checklist_title_pl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* Subtitle UA & PL */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇺🇦 Підзаголовок (UA)
              </label>
              <textarea
                rows={2}
                value={settings.text_checklist_subtitle_ua ?? ""}
                onChange={(e) => setSettings({ ...settings, text_checklist_subtitle_ua: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇵🇱 Підзаголовок (PL)
              </label>
              <textarea
                rows={2}
                value={settings.text_checklist_subtitle_pl ?? ""}
                onChange={(e) => setSettings({ ...settings, text_checklist_subtitle_pl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* Badge UA & PL */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇺🇦 Бейдж-лейбл (UA)
              </label>
              <input
                type="text"
                value={settings.text_checklist_badge_ua ?? ""}
                onChange={(e) => setSettings({ ...settings, text_checklist_badge_ua: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇵🇱 Бейдж-лейбл (PL)
              </label>
              <input
                type="text"
                value={settings.text_checklist_badge_pl ?? ""}
                onChange={(e) => setSettings({ ...settings, text_checklist_badge_pl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? "Збереження..." : "Зберегти тексти"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Add New Lead Magnet Form Card */}
      {isAdding && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await submitCreate();
          }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border-2 border-gold-400/80 space-y-6 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-nude-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center">
                <FileDown className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-charcoal-900">
                Додати новий чек-лист / PDF
              </h4>
            </div>

            <button
              type="button"
              onClick={handleCancelClick}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-nude-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. PDF File Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-2">
              Завантажити PDF-файл *
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-nude-300 hover:border-gold-500 bg-nude-50/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                <Upload className={`w-6 h-6 ${uploadingPdf ? "animate-bounce" : ""}`} />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                {newForm.fileUrl ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 justify-center sm:justify-start">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>PDF успішно завантажено!</span>
                    </p>
                    <p className="text-xs text-charcoal-600 font-mono">
                      {newForm.fileName} ({newForm.fileSize})
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-charcoal-800">
                      Виберіть PDF-файл з вашого комп'ютера або телефона
                    </p>
                    <p className="text-[11px] text-charcoal-500">
                      Підтримуються файли .pdf будь-якого розміру
                    </p>
                  </div>
                )}
              </div>

              <label className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors shadow-xs shrink-0">
                <span>{uploadingPdf ? "Завантаження..." : newForm.fileUrl ? "Замінити файл" : "Обрати PDF"}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={uploadingPdf}
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 2. Titles UA & PL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇺🇦 Назва чек-листа (UA) *
              </label>
              <input
                type="text"
                required
                value={newForm.titleUa}
                onChange={(e) => setNewForm({ ...newForm, titleUa: e.target.value })}
                placeholder="напр. Чек-лист: 10 помилок в апаратному манікюрі"
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇵🇱 Назва чек-листа (PL) *
              </label>
              <input
                type="text"
                required
                value={newForm.titlePl}
                onChange={(e) => setNewForm({ ...newForm, titlePl: e.target.value })}
                placeholder="np. Checklist: 10 błędów w manicure sprzętowym"
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Descriptions UA & PL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇺🇦 Короткий опис / вигода (UA)
              </label>
              <textarea
                rows={3}
                value={newForm.descriptionUa}
                onChange={(e) => setNewForm({ ...newForm, descriptionUa: e.target.value })}
                placeholder="Розкрийте, що саме дізнається майстер з цього матеріалу..."
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                🇵🇱 Короткий опис / вигода (PL)
              </label>
              <textarea
                rows={3}
                value={newForm.descriptionPl}
                onChange={(e) => setNewForm({ ...newForm, descriptionPl: e.target.value })}
                placeholder="Czego stylistka dowie się z tego przewodnika..."
                className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Badges & Button texts */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Бейдж UA
              </label>
              <input
                type="text"
                value={newForm.badgeUa}
                onChange={(e) => setNewForm({ ...newForm, badgeUa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Бейдж PL
              </label>
              <input
                type="text"
                value={newForm.badgePl}
                onChange={(e) => setNewForm({ ...newForm, badgePl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Текст кнопки UA
              </label>
              <input
                type="text"
                value={newForm.buttonTextUa}
                onChange={(e) => setNewForm({ ...newForm, buttonTextUa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Текст кнопки PL
              </label>
              <input
                type="text"
                value={newForm.buttonTextPl}
                onChange={(e) => setNewForm({ ...newForm, buttonTextPl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-100">
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2.5 rounded-xl border border-nude-300 text-xs font-semibold text-charcoal-600 hover:bg-nude-50 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Опублікувати чек-лист</span>
            </button>
          </div>
        </form>
      )}

      {/* Published Checklists List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-nude-200 shadow-soft">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gold-600 mb-2" />
            <p className="text-sm text-charcoal-500">Завантаження чек-листів...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-nude-200 shadow-soft space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
              <FileDown className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-charcoal-900">
              Чек-листів ще не додано
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto">
              Додайте свій перший PDF-посібник, щоб користувачі з реклами могли миттєво завантажувати його.
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Додати перший чек-лист</span>
            </button>
          </div>
        ) : (
          items.map((item, idx) => {
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-7 shadow-soft border border-nude-200 hover:border-gold-300 transition-all"
              >
                {isEditing ? (
                  /* Edit Mode */
                  <div className="space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-nude-100 pb-3">
                      <h4 className="font-serif text-base font-bold text-charcoal-900">
                        Редагування чек-листа: {item.titleUa}
                      </h4>
                      <button
                        type="button"
                        onClick={handleCancelClick}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* PDF Replace */}
                    <div className="p-4 rounded-2xl bg-nude-50 border border-nude-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-charcoal-800">
                          Поточний файл: <span className="font-mono text-charcoal-600">{editForm.fileName || "checklist.pdf"}</span>
                        </p>
                        <p className="text-[11px] text-charcoal-500">
                          Розмір: {editForm.fileSize || "—"} • URL: {editForm.fileUrl}
                        </p>
                      </div>

                      <label className="px-3.5 py-1.5 rounded-xl border border-nude-300 bg-white hover:bg-gold-50 text-charcoal-700 text-xs font-semibold cursor-pointer transition-colors shadow-xs shrink-0">
                        <span>{uploadingEditPdf ? "Завантаження..." : "Замінити PDF файл"}</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          disabled={uploadingEditPdf}
                          onChange={(e) => handleFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          🇺🇦 Назва (UA)
                        </label>
                        <input
                          type="text"
                          value={editForm.titleUa || ""}
                          onChange={(e) => setEditForm({ ...editForm, titleUa: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          🇵🇱 Назва (PL)
                        </label>
                        <input
                          type="text"
                          value={editForm.titlePl || ""}
                          onChange={(e) => setEditForm({ ...editForm, titlePl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          🇺🇦 Опис (UA)
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.descriptionUa || ""}
                          onChange={(e) => setEditForm({ ...editForm, descriptionUa: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          🇵🇱 Опис (PL)
                        </label>
                        <textarea
                          rows={2}
                          value={editForm.descriptionPl || ""}
                          onChange={(e) => setEditForm({ ...editForm, descriptionPl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Badges & Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Бейдж UA
                        </label>
                        <input
                          type="text"
                          value={editForm.badgeUa || ""}
                          onChange={(e) => setEditForm({ ...editForm, badgeUa: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Бейдж PL
                        </label>
                        <input
                          type="text"
                          value={editForm.badgePl || ""}
                          onChange={(e) => setEditForm({ ...editForm, badgePl: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Кнопка UA
                        </label>
                        <input
                          type="text"
                          value={editForm.buttonTextUa || ""}
                          onChange={(e) => setEditForm({ ...editForm, buttonTextUa: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Кнопка PL
                        </label>
                        <input
                          type="text"
                          value={editForm.buttonTextPl || ""}
                          onChange={(e) => setEditForm({ ...editForm, buttonTextPl: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-nude-300 text-xs focus:border-gold-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-nude-100">
                      <button
                        type="button"
                        onClick={handleCancelClick}
                        className="px-4 py-2 rounded-xl border border-nude-300 text-xs text-charcoal-600 hover:bg-nude-50 transition-colors"
                      >
                        Скасувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(item.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Зберегти зміни</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      {/* PDF Document Icon */}
                      <div className="w-14 h-16 rounded-2xl bg-charcoal-900 text-white flex flex-col items-center justify-center shrink-0 border border-gold-400/40 shadow-xs">
                        <FileDown className="w-6 h-6 text-gold-400" />
                        <span className="text-[9px] font-bold text-gold-200 mt-0.5">PDF</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-50 text-gold-800 border border-gold-200">
                            {item.badgeUa || "Чек-лист"}
                          </span>
                          {item.fileSize && (
                            <span className="text-[11px] font-mono text-charcoal-400">
                              {item.fileSize}
                            </span>
                          )}
                          {item.downloadCount !== undefined && item.downloadCount > 0 && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              🔥 {item.downloadCount} завантажень
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-base font-bold text-charcoal-900">
                          {item.titleUa}
                        </h4>
                        <p className="text-xs text-charcoal-500 font-serif">
                          PL: {item.titlePl}
                        </p>
                        {item.descriptionUa && (
                          <p className="text-xs text-charcoal-600 line-clamp-2 pt-0.5">
                            {item.descriptionUa}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reorder and Edit Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
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
                          disabled={idx === items.length - 1 || reordering}
                          onClick={() => handleMove(idx, "down")}
                          className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Опустити нижче"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Open Link / View PDF */}
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-charcoal-500 hover:text-gold-700 hover:bg-gold-50 transition-colors"
                          title="Відкрити PDF для перегляду"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="px-3 py-2 rounded-xl bg-nude-100 hover:bg-gold-500 hover:text-white text-charcoal-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Редагувати</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Видалити чек-лист"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        itemName={
          editingId
            ? editForm.titleUa || items.find((i) => i.id === editingId)?.titleUa || "Чек-лист"
            : newForm.titleUa || "Новий чек-лист"
        }
        itemType="чек-лист"
        isSaving={isSavingPending}
        onSave={handleModalSave}
        onDiscard={handleModalDiscard}
        onCancel={handleModalCancel}
      />
    </div>
  );
}
