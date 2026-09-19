"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Copy,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";
import UnsavedChangesModal from "./UnsavedChangesModal";

export interface SyllabusDay {
  day: string;
  title: string;
  theory: string;
  practice: string;
}

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
  priceMaxPln?: number | null;
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
  priceMaxPln: null as number | null,
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
  syllabusUaList: [] as SyllabusDay[],
  syllabusPlList: [] as SyllabusDay[],
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

export function parseSyllabus(val?: string | null): SyllabusDay[] {
  if (!val) return [];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => ({
        day: item?.day || `День ${idx + 1}`,
        title: item?.title || "",
        theory: item?.theory || "",
        practice: item?.practice || "",
      }));
    }
  } catch {}
  return [];
}

export function syllabusToJson(days?: SyllabusDay[] | null): string {
  if (!days || !Array.isArray(days) || days.length === 0) return "[]";
  const cleaned = days
    .filter((d) => d && (d.day || d.title || d.theory || d.practice))
    .map((d) => ({
      day: (d.day || "").trim(),
      title: (d.title || "").trim(),
      theory: (d.theory || "").trim(),
      practice: (d.practice || "").trim(),
    }));
  return JSON.stringify(cleaned);
}

function serializeCourseForm(form: any): string {
  if (!form) return "";
  return JSON.stringify({
    titleUa: (form.titleUa || "").trim(),
    titlePl: (form.titlePl || "").trim(),
    subtitleUa: (form.subtitleUa || "").trim(),
    subtitlePl: (form.subtitlePl || "").trim(),
    pricePln: Number(form.pricePln) || 0,
    priceMaxPln: form.priceMaxPln !== undefined && form.priceMaxPln !== null && form.priceMaxPln !== "" ? Number(form.priceMaxPln) : null,
    durationUa: (form.durationUa || "").trim(),
    durationPl: (form.durationPl || "").trim(),
    levelUa: (form.levelUa || "").trim(),
    levelPl: (form.levelPl || "").trim(),
    badgeUa: (form.badgeUa || "").trim(),
    badgePl: (form.badgePl || "").trim(),
    bonusUa: (form.bonusUa || "").trim(),
    bonusPl: (form.bonusPl || "").trim(),
    descriptionUa: (form.descriptionUa || "").trim(),
    descriptionPl: (form.descriptionPl || "").trim(),
    featuresUaText: (form.featuresUaText || "").trim(),
    featuresPlText: (form.featuresPlText || "").trim(),
    syllabusUaList: (form.syllabusUaList || []).map((d: any) => ({
      day: (d?.day || "").trim(),
      title: (d?.title || "").trim(),
      theory: (d?.theory || "").trim(),
      practice: (d?.practice || "").trim(),
    })),
    syllabusPlList: (form.syllabusPlList || []).map((d: any) => ({
      day: (d?.day || "").trim(),
      title: (d?.title || "").trim(),
      theory: (d?.theory || "").trim(),
      practice: (d?.practice || "").trim(),
    })),
    formUrl: (form.formUrl || "").trim(),
    sortOrder: Number(form.sortOrder) || 0,
  });
}

function isNewCourseFormDirty(form: typeof defaultNewCourse): boolean {
  if (!form) return false;
  return (
    form.titleUa.trim() !== "" ||
    form.titlePl.trim() !== "" ||
    (form.subtitleUa || "").trim() !== "" ||
    (form.subtitlePl || "").trim() !== "" ||
    form.descriptionUa.trim() !== "" ||
    form.descriptionPl.trim() !== "" ||
    form.featuresUaText.trim() !== "" ||
    form.featuresPlText.trim() !== "" ||
    (form.syllabusUaList && form.syllabusUaList.length > 0) ||
    (form.syllabusPlList && form.syllabusPlList.length > 0) ||
    (form.formUrl || "").trim() !== "" ||
    Number(form.pricePln) !== 1500 ||
    Boolean(form.priceMaxPln && Number(form.priceMaxPln) > 0)
  );
}

interface SyllabusEditorProps {
  daysUa: SyllabusDay[];
  daysPl: SyllabusDay[];
  onChangeUa: (days: SyllabusDay[]) => void;
  onChangePl: (days: SyllabusDay[]) => void;
}

function SyllabusEditor({
  daysUa,
  daysPl,
  onChangeUa,
  onChangePl,
}: SyllabusEditorProps) {
  const [activeLang, setActiveLang] = useState<"ua" | "pl">("ua");

  const currentDays = activeLang === "ua" ? daysUa : daysPl;
  const otherDays = activeLang === "ua" ? daysPl : daysUa;

  const updateCurrentDays = (newDays: SyllabusDay[]) => {
    if (activeLang === "ua") {
      onChangeUa(newDays);
    } else {
      onChangePl(newDays);
    }
  };

  const handleAddDay = () => {
    const nextNum = currentDays.length + 1;
    const newDay: SyllabusDay = {
      day: activeLang === "pl" ? `Dzień ${nextNum}` : `День ${nextNum}`,
      title: "",
      theory: "",
      practice: "",
    };
    updateCurrentDays([...currentDays, newDay]);
  };

  const handleFieldChange = (idx: number, field: keyof SyllabusDay, value: string) => {
    const updated = currentDays.map((d, i) => (i === idx ? { ...d, [field]: value } : d));
    updateCurrentDays(updated);
  };

  const handleRemoveDay = (idx: number) => {
    const updated = currentDays.filter((_, i) => i !== idx);
    updateCurrentDays(updated);
  };

  const handleMoveDay = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentDays.length) return;
    const copy = [...currentDays];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    updateCurrentDays(copy);
  };

  const handleCopyFromOther = () => {
    if (otherDays.length === 0) {
      alert(
        activeLang === "ua"
          ? "Польська версія ще не має створених днів для копіювання."
          : "Українська версія ще не має створених днів для копіювання."
      );
      return;
    }
    if (
      currentDays.length > 0 &&
      !confirm(
        activeLang === "ua"
          ? "Замінити поточні дні структурою з польської версії? Поточні дані будуть перезаписані."
          : "Замінити поточні дні структурою з української версії? Поточні дані будуть перезаписані."
      )
    ) {
      return;
    }
    const copied: SyllabusDay[] = otherDays.map((d, idx) => ({
      day: activeLang === "pl" ? `Dzień ${idx + 1}` : `День ${idx + 1}`,
      title: d.title,
      theory: d.theory,
      practice: d.practice,
    }));
    updateCurrentDays(copied);
  };

  return (
    <div className="rounded-2xl border-2 border-gold-400/40 bg-nude-50/50 p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-nude-200">
        <div>
          <div className="flex items-center gap-2 text-charcoal-900 font-serif font-bold text-base">
            <BookOpen className="w-5 h-5 text-gold-700" />
            <span>Програма курсу по днях / модулях</span>
          </div>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Текст для спадаючого меню «Переглянути програму курсу» (Теорія та Практика для кожного дня)
          </p>
        </div>

        {/* Language Tabs & Copy Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-white p-1 border border-nude-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveLang("ua")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLang === "ua"
                  ? "bg-charcoal-900 text-white shadow-xs"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              🇺🇦 UA ({daysUa.length} дн.)
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("pl")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLang === "pl"
                  ? "bg-charcoal-900 text-white shadow-xs"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
            >
              🇵🇱 PL ({daysPl.length} dni)
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyFromOther}
            className="px-3 py-1.5 rounded-xl border border-nude-300 hover:border-gold-500 bg-white hover:bg-gold-50 text-charcoal-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-xs"
            title="Скопіювати структуру з іншої мови"
          >
            <Copy className="w-3.5 h-3.5 text-gold-700" />
            <span>{activeLang === "ua" ? "Скопіювати з PL" : "Skopiuj z UA"}</span>
          </button>
        </div>
      </div>

      {/* Days List */}
      {currentDays.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-nude-300 bg-white/70">
          <BookOpen className="w-8 h-8 text-gold-500 mx-auto mb-2 opacity-60" />
          <h5 className="font-serif text-sm font-semibold text-charcoal-900 mb-1">
            Програма для {activeLang === "ua" ? "української" : "польської"} версії ще не створена
          </h5>
          <p className="text-xs text-charcoal-500 max-w-md mx-auto mb-4">
            Додайте дні з теорією та практикою, щоб на сторінці курсу зʼявилася інтерактивна кнопка «Переглянути програму курсу».
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleAddDay}
              className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Додати 1-й день програми</span>
            </button>
            {otherDays.length > 0 && (
              <button
                type="button"
                onClick={handleCopyFromOther}
                className="px-4 py-2 rounded-xl border border-nude-300 hover:border-gold-500 bg-white text-charcoal-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-gold-700" />
                <span>Скопіювати структуру ({otherDays.length} дн.)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDays.map((dayItem, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-xl bg-white border border-nude-200 shadow-xs space-y-3.5 hover:border-gold-300 transition-colors"
            >
              {/* Day Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-nude-100">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-full bg-gold-100 text-gold-800 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="w-28 sm:w-32 shrink-0">
                    <input
                      type="text"
                      value={dayItem.day}
                      onChange={(e) => handleFieldChange(idx, "day", e.target.value)}
                      placeholder={activeLang === "pl" ? "Dzień 1" : "День 1"}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-nude-300 text-xs font-bold uppercase tracking-wider bg-nude-50/50 focus:bg-white focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={dayItem.title}
                      onChange={(e) => handleFieldChange(idx, "title", e.target.value)}
                      placeholder={
                        activeLang === "pl"
                          ? "np. Anatomia i bezpieczny manicure sprzętowy"
                          : "напр. Анатомія та безпечний апаратний манікюр"
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-nude-300 text-xs font-serif font-bold text-charcoal-900 focus:border-gold-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Day Reorder & Remove Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveDay(idx, "up")}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-nude-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Підняти вище"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === currentDays.length - 1}
                    onClick={() => handleMoveDay(idx, "down")}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-nude-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Опустити нижче"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDay(idx)}
                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                    title="Видалити цей день"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Body: Theory & Practice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-gold-800 uppercase tracking-wider mb-1">
                    📚 Теоретична частина ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={dayItem.theory}
                    onChange={(e) => handleFieldChange(idx, "theory", e.target.value)}
                    placeholder={
                      activeLang === "pl"
                        ? "Przyczyny powstawania zapowietrzeń, czysty manicure bez zacięć, fizyka i chemia żeli..."
                        : "Будова нігтя, причини відшарувань, безпечна техніка підготовки, хімія гелів..."
                    }
                    className="w-full p-2.5 rounded-xl border border-nude-200 text-xs leading-relaxed focus:border-gold-500 focus:outline-none bg-[#FAFAF8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-800 uppercase tracking-wider mb-1">
                    💅 Практична частина ({activeLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={3}
                    value={dayItem.practice}
                    onChange={(e) => handleFieldChange(idx, "practice", e.target.value)}
                    placeholder={
                      activeLang === "pl"
                        ? "Praktyka na modelce: pełna korekta architektury, malowanie kolorem pod skórki..."
                        : "Відпрацювання на моделі: корекція архітектури, створення бездоганного бліку..."
                    }
                    className="w-full p-2.5 rounded-xl border border-nude-200 text-xs leading-relaxed focus:border-gold-500 focus:outline-none bg-[#FAFAF8]"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Day Button */}
          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={handleAddDay}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gold-50 border border-nude-300 hover:border-gold-500 text-charcoal-800 text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-gold-600" />
              <span>
                {activeLang === "pl"
                  ? `+ Dodaj Dzień ${currentDays.length + 1} do programu`
                  : `+ Додати День ${currentDays.length + 1} до програми`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
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

  // Snapshots and unsaved changes tracking
  const initialEditSnapshotRef = useRef<string>("");
  const isDirtyRef = useRef<boolean>(false);
  const historyPushedRef = useRef<boolean>(false);
  const isCleanExitRef = useRef<boolean>(false);

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [isSavingPending, setIsSavingPending] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | { type: "browser-back" }
    | { type: "cancel" }
    | { type: "switch-course"; targetCourse: CourseItem }
    | { type: "start-add" }
    | null
  >(null);

  // Accordion preview states
  const [expandedSyllabus, setExpandedSyllabus] = useState<Record<string, boolean>>({});
  const [previewLang, setPreviewLang] = useState<Record<string, "ua" | "pl">>({});

  // Determine dirty state
  const isEditDirty = useMemo(() => {
    if (!editingId) return false;
    return serializeCourseForm(editForm) !== initialEditSnapshotRef.current;
  }, [editingId, editForm]);

  const isAddDirty = useMemo(() => {
    if (!isAdding) return false;
    return isNewCourseFormDirty(newForm);
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

  // Handle beforeunload (page refresh or tab close)
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

  // Intercept browser Back / Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (isCleanExitRef.current) {
        isCleanExitRef.current = false;
        historyPushedRef.current = false;
        return;
      }

      if (editingId || isAdding) {
        if (isDirtyRef.current) {
          // Re-push history entry so URL remains on /admin and future Back clicks can be caught
          if (typeof window !== "undefined") {
            window.history.pushState(
              { adminModal: editingId ? "course-edit" : "course-add" },
              ""
            );
          }
          setPendingAction({ type: "browser-back" });
          setShowUnsavedModal(true);
        } else {
          // Not dirty, quietly cancel edit mode
          historyPushedRef.current = false;
          setEditingId(null);
          setIsAdding(false);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [editingId, isAdding]);

  const toggleSyllabus = (courseId: string) => {
    setExpandedSyllabus((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

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

  const submitCreate = async (): Promise<boolean> => {
    if (!newForm.titleUa.trim() || !newForm.titlePl.trim()) {
      alert("Будь ласка, заповніть назву курсу (UA та PL)");
      return false;
    }

    try {
      const payload = {
        titleUa: newForm.titleUa,
        titlePl: newForm.titlePl,
        subtitleUa: newForm.subtitleUa || null,
        subtitlePl: newForm.subtitlePl || null,
        pricePln: Number(newForm.pricePln) || 0,
        priceMaxPln: newForm.priceMaxPln ? Number(newForm.priceMaxPln) : null,
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
        syllabusUa: syllabusToJson(newForm.syllabusUaList),
        syllabusPl: syllabusToJson(newForm.syllabusPlList),
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
        cleanExitHistory();
        await fetchCourses();
        return true;
      } else {
        const err = await res.json();
        alert("Помилка створення курсу: " + (err.error || "Невідома помилка"));
        return false;
      }
    } catch (e) {
      console.error(e);
      alert("Не вдалося створити курс.");
      return false;
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCreate();
  };

  const startEdit = (course: CourseItem) => {
    if (isDirtyRef.current) {
      if (editingId === course.id) return;
      setPendingAction({ type: "switch-course", targetCourse: course });
      setShowUnsavedModal(true);
      return;
    }

    const editState = {
      ...course,
      priceMaxPln: course.priceMaxPln ?? null,
      featuresUaText: stringToLines(course.featuresUa),
      featuresPlText: stringToLines(course.featuresPl),
      syllabusUaList: parseSyllabus(course.syllabusUa),
      syllabusPlList: parseSyllabus(course.syllabusPl),
    };

    initialEditSnapshotRef.current = serializeCourseForm(editState);
    setEditingId(course.id);
    setEditForm(editState);
    setIsAdding(false);

    if (!historyPushedRef.current && typeof window !== "undefined") {
      window.history.pushState({ adminModal: "course-edit", courseId: course.id }, "");
      historyPushedRef.current = true;
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
        setNewForm(defaultNewCourse);
        if (!historyPushedRef.current && typeof window !== "undefined") {
          window.history.pushState({ adminModal: "course-add" }, "");
          historyPushedRef.current = true;
        }
      }
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

  const handleUpdate = async (id: string): Promise<boolean> => {
    try {
      const payload = {
        ...editForm,
        pricePln: Number(editForm.pricePln) || 0,
        priceMaxPln: editForm.priceMaxPln !== undefined && editForm.priceMaxPln !== null && editForm.priceMaxPln !== "" ? Number(editForm.priceMaxPln) : null,
        sortOrder: Number(editForm.sortOrder) || 0,
        featuresUa: linesToJson(editForm.featuresUaText),
        featuresPl: linesToJson(editForm.featuresPlText),
        syllabusUa: syllabusToJson(editForm.syllabusUaList),
        syllabusPl: syllabusToJson(editForm.syllabusPlList),
      };

      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingId(null);
        cleanExitHistory();
        await fetchCourses();
        return true;
      } else {
        const err = await res.json();
        alert("Помилка оновлення: " + (err.error || "Невідома помилка"));
        return false;
      }
    } catch (e) {
      console.error(e);
      alert("Не вдалося оновити курс.");
      return false;
    }
  };

  const executePendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);

    if (action?.type === "switch-course") {
      const course = action.targetCourse;
      const editState = {
        ...course,
        featuresUaText: stringToLines(course.featuresUa),
        featuresPlText: stringToLines(course.featuresPl),
        syllabusUaList: parseSyllabus(course.syllabusUa),
        syllabusPlList: parseSyllabus(course.syllabusPl),
      };
      initialEditSnapshotRef.current = serializeCourseForm(editState);
      setEditingId(course.id);
      setEditForm(editState);
      setIsAdding(false);
    } else if (action?.type === "start-add") {
      setEditingId(null);
      setIsAdding(true);
      setNewForm(defaultNewCourse);
    } else {
      // browser-back or cancel
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
          onClick={handleToggleAdd}
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
              onClick={handleCancelClick}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-nude-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Row 1: Key Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Ціна від (PLN) *
              </label>
              <input
                type="number"
                value={newForm.pricePln}
                onChange={(e) => setNewForm({ ...newForm, pricePln: Number(e.target.value) })}
                required
                min={0}
                placeholder="1500"
                className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1 flex items-center justify-between">
                <span>Ціна до (PLN)</span>
                <span className="text-[10px] text-charcoal-400 font-normal">(діапазон)</span>
              </label>
              <input
                type="number"
                value={newForm.priceMaxPln ?? ""}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    priceMaxPln: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
                min={0}
                placeholder="Напр. 2500"
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

            {newForm.priceMaxPln && Number(newForm.priceMaxPln) > 0 && Number(newForm.priceMaxPln) !== Number(newForm.pricePln) ? (
              <div className="col-span-full bg-gold-50/70 border border-gold-200/80 rounded-xl px-3.5 py-2 text-xs text-charcoal-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                <span>
                  Діапазон вартості курсу:{" "}
                  <strong className="font-semibold text-charcoal-900">
                    {Math.min(Number(newForm.pricePln), Number(newForm.priceMaxPln))} – {Math.max(Number(newForm.pricePln), Number(newForm.priceMaxPln))} zł
                  </strong>
                </span>
              </div>
            ) : null}
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

          {/* Row 9: Course Syllabus / Program Details */}
          <SyllabusEditor
            daysUa={newForm.syllabusUaList}
            daysPl={newForm.syllabusPlList}
            onChangeUa={(days) => setNewForm({ ...newForm, syllabusUaList: days })}
            onChangePl={(days) => setNewForm({ ...newForm, syllabusPlList: days })}
          />

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-nude-200">
            <button
              type="button"
              onClick={handleCancelClick}
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
                        onClick={handleCancelClick}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Ціна від (PLN) *
                        </label>
                        <input
                          type="number"
                          value={editForm.pricePln ?? 0}
                          onChange={(e) =>
                            setEditForm({ ...editForm, pricePln: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1 flex items-center justify-between">
                          <span>Ціна до (PLN)</span>
                          <span className="text-[10px] text-charcoal-400 font-normal">(діапазон)</span>
                        </label>
                        <input
                          type="number"
                          value={editForm.priceMaxPln ?? ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              priceMaxPln: e.target.value === "" ? null : Number(e.target.value),
                            })
                          }
                          min={0}
                          placeholder="Напр. 2500"
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

                      {editForm.priceMaxPln && Number(editForm.priceMaxPln) > 0 && Number(editForm.priceMaxPln) !== Number(editForm.pricePln) ? (
                        <div className="col-span-full bg-gold-50/70 border border-gold-200/80 rounded-xl px-3.5 py-2 text-xs text-charcoal-700 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          <span>
                            Діапазон вартості курсу:{" "}
                            <strong className="font-semibold text-charcoal-900">
                              {Math.min(Number(editForm.pricePln || 0), Number(editForm.priceMaxPln))} – {Math.max(Number(editForm.pricePln || 0), Number(editForm.priceMaxPln))} zł
                            </strong>
                          </span>
                        </div>
                      ) : null}
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

                    {/* Course Syllabus / Program Details */}
                    <SyllabusEditor
                      daysUa={editForm.syllabusUaList || []}
                      daysPl={editForm.syllabusPlList || []}
                      onChangeUa={(days) => setEditForm({ ...editForm, syllabusUaList: days })}
                      onChangePl={(days) => setEditForm({ ...editForm, syllabusPlList: days })}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-nude-100">
                      <button
                        type="button"
                        onClick={handleCancelClick}
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
                            {course.priceMaxPln && course.priceMaxPln > 0 && course.priceMaxPln !== course.pricePln
                              ? `${Math.min(course.pricePln, course.priceMaxPln)} – ${Math.max(course.pricePln, course.priceMaxPln)} zł`
                              : `${course.pricePln} zł`}
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

                    {/* View Course Program Accordion */}
                    {(() => {
                      const syllabusUa = parseSyllabus(course.syllabusUa);
                      const syllabusPl = parseSyllabus(course.syllabusPl);
                      const isExpanded = !!expandedSyllabus[course.id];
                      const activePreview = previewLang[course.id] || "ua";
                      const curSyllabus = activePreview === "ua" ? syllabusUa : syllabusPl;

                      return (
                        <div className="mt-4 pt-3 border-t border-nude-100">
                          <button
                            type="button"
                            onClick={() => toggleSyllabus(course.id)}
                            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-nude-50 hover:bg-nude-100 text-charcoal-800 text-xs font-semibold transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-gold-700" />
                              <span>
                                {isExpanded ? "Згорнути програму курсу" : "Переглянути програму курсу"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-gold-800 border border-nude-200 shadow-xs">
                                {syllabusUa.length > 0 || syllabusPl.length > 0
                                  ? `${syllabusUa.length} дн. (UA) / ${syllabusPl.length} дн. (PL)`
                                  : "Програма не заповнена"}
                              </span>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-charcoal-500 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="mt-3 p-4 rounded-xl bg-nude-50/70 border border-nude-200 space-y-3">
                              {/* Preview Header & Language Toggle */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-nude-200">
                                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
                                  Попередній перегляд програми:
                                </span>
                                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-nude-200 text-xs">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewLang((prev) => ({ ...prev, [course.id]: "ua" }))
                                    }
                                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                                      activePreview === "ua"
                                        ? "bg-charcoal-900 text-white shadow-xs"
                                        : "text-charcoal-600 hover:text-charcoal-900"
                                    }`}
                                  >
                                    🇺🇦 UA ({syllabusUa.length})
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewLang((prev) => ({ ...prev, [course.id]: "pl" }))
                                    }
                                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                                      activePreview === "pl"
                                        ? "bg-charcoal-900 text-white shadow-xs"
                                        : "text-charcoal-600 hover:text-charcoal-900"
                                    }`}
                                  >
                                    🇵🇱 PL ({syllabusPl.length})
                                  </button>
                                </div>
                              </div>

                              {curSyllabus.length === 0 ? (
                                <div className="text-center py-4 text-xs text-charcoal-400">
                                  Для {activePreview === "ua" ? "української" : "польської"} версії програму ще не додано.
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {curSyllabus.map((dayItem, dIdx) => (
                                    <div
                                      key={dIdx}
                                      className="p-3.5 bg-white rounded-xl border border-nude-200/80 shadow-xs space-y-1.5 text-xs"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-charcoal-900 text-gold-300 uppercase">
                                          {dayItem.day}
                                        </span>
                                        <h5 className="font-serif font-bold text-charcoal-900 text-sm">
                                          {dayItem.title}
                                        </h5>
                                      </div>

                                      {dayItem.theory && (
                                        <p className="text-charcoal-700 text-xs pl-1">
                                          <strong className="text-gold-800 font-semibold">
                                            Теорія:{" "}
                                          </strong>
                                          {dayItem.theory}
                                        </p>
                                      )}

                                      {dayItem.practice && (
                                        <p className="text-charcoal-700 text-xs pl-1 pt-1 border-t border-nude-100">
                                          <strong className="text-charcoal-900 font-semibold">
                                            Практика:{" "}
                                          </strong>
                                          {dayItem.practice}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => startEdit(course)}
                                  className="text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center gap-1 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Редагувати текст програми</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
            ? editForm.titleUa || courses.find((c) => c.id === editingId)?.titleUa || "Курс"
            : newForm.titleUa || "Новий курс"
        }
        itemType="курс"
        isSaving={isSavingPending}
        onSave={handleModalSave}
        onDiscard={handleModalDiscard}
        onCancel={handleModalCancel}
      />
    </div>
  );
}
