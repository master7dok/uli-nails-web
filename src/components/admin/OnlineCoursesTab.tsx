"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Video,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  FileText,
  Presentation,
  Upload,
  Link2,
  Sparkles,
  Key,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Lock,
} from "lucide-react";
import { getAdminHeaders } from "@/lib/adminClient";

interface CourseMaterial {
  id: string;
  courseId: string;
  titleUa: string;
  titlePl: string;
  descriptionUa?: string | null;
  descriptionPl?: string | null;
  type: "video" | "pdf" | "presentation";
  fileUrl?: string | null;
  videoEmbedUrl?: string | null;
  sortOrder: number;
}

interface OnlineCourseItem {
  id: string;
  slug: string;
  titleUa: string;
  titlePl: string;
  subtitleUa?: string | null;
  subtitlePl?: string | null;
  descriptionUa: string;
  descriptionPl: string;
  pricePln: number;
  priceMaxPln?: number | null;
  coverUrl?: string | null;
  badgeUa?: string | null;
  badgePl?: string | null;
  durationUa?: string | null;
  durationPl?: string | null;
  sortOrder: number;
  isActive: boolean;
  materials?: CourseMaterial[];
  _count?: {
    students: number;
    materials: number;
  };
}

interface StudentItem {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
  notes?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  courses: {
    courseId: string;
    courseTitleUa: string;
    courseTitlePl: string;
  }[];
}

export default function OnlineCoursesTab() {
  const [activeSubTab, setActiveSubTab] = useState<"courses" | "students">("courses");
  const [courses, setCourses] = useState<OnlineCourseItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Selected course for materials management
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Course Form Modal (Create / Edit)
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<OnlineCourseItem | null>(null);
  const [courseForm, setCourseForm] = useState({
    titleUa: "",
    titlePl: "",
    subtitleUa: "",
    subtitlePl: "",
    descriptionUa: "",
    descriptionPl: "",
    pricePln: 990,
    priceMaxPln: "" as string | number,
    durationUa: "30 днів доступу",
    durationPl: "30 dni dostępu",
    badgeUa: "Онлайн",
    badgePl: "Online",
    coverUrl: "",
    sortOrder: 0,
    isActive: true,
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);

  // Material Form Modal
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [targetCourseId, setTargetCourseId] = useState<string>("");
  const [materialForm, setMaterialForm] = useState({
    titleUa: "",
    titlePl: "",
    descriptionUa: "",
    descriptionPl: "",
    type: "video" as "video" | "pdf" | "presentation",
    fileUrl: "",
    videoEmbedUrl: "",
    sortOrder: 0,
  });
  const [uploadingMaterialFile, setUploadingMaterialFile] = useState(false);
  const [savingMaterial, setSavingMaterial] = useState(false);

  // Student Form Modal (Create / Edit)
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [studentForm, setStudentForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    notes: "",
    isActive: true,
    selectedCourseIds: [] as string[],
  });
  const [savingStudent, setSavingStudent] = useState(false);

  // Initial Load
  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes, settingsRes] = await Promise.all([
        fetch("/api/online-courses", { credentials: "include" }),
        fetch("/api/students", {
          headers: getAdminHeaders(),
          credentials: "include",
        }),
        fetch("/api/settings"),
      ]);

      const coursesData = await coursesRes.json();
      if (coursesData && Array.isArray(coursesData.courses)) {
        setCourses(coursesData.courses);
        setIsSectionVisible(Boolean(coursesData.visible));
      }

      const studentsData = await studentsRes.json();
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      }

      const settingsData = await settingsRes.json();
      if (settingsData && typeof settingsData.show_online_courses === "string") {
        setIsSectionVisible(settingsData.show_online_courses === "true");
      }
    } catch (e) {
      console.error("Error fetching online courses data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle public section visibility
  const handleToggleVisibility = async () => {
    const nextVal = !isSectionVisible;
    setSavingVisibility(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          show_online_courses: nextVal ? "true" : "false",
        }),
      });
      if (res.ok) {
        setIsSectionVisible(nextVal);
      } else {
        alert("Помилка збереження налаштування видимості");
      }
    } catch (e) {
      console.error(e);
      alert("Помилка підключення");
    } finally {
      setSavingVisibility(false);
    }
  };

  // Cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAdminHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setCourseForm((prev) => ({ ...prev, coverUrl: data.url }));
      }
    } catch (err) {
      console.error(err);
      alert("Не вдалося завантажити зображення");
    } finally {
      setUploadingCover(false);
    }
  };

  // Material file upload
  const handleMaterialFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMaterialFile(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: getAdminHeaders(),
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setMaterialForm((prev) => ({
          ...prev,
          fileUrl: data.url,
          ...(prev.titleUa === "" && { titleUa: file.name }),
          ...(prev.titlePl === "" && { titlePl: file.name }),
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Не вдалося завантажити файл матеріалу");
    } finally {
      setUploadingMaterialFile(false);
    }
  };

  // Open Course Modal
  const openCreateCourseModal = () => {
    setEditingCourse(null);
    setCourseForm({
      titleUa: "",
      titlePl: "",
      subtitleUa: "",
      subtitlePl: "",
      descriptionUa: "",
      descriptionPl: "",
      pricePln: 990,
      priceMaxPln: "",
      durationUa: "30 днів доступу",
      durationPl: "30 dni dostępu",
      badgeUa: "Онлайн",
      badgePl: "Online",
      coverUrl: "",
      sortOrder: courses.length,
      isActive: true,
    });
    setCourseModalOpen(true);
  };

  const openEditCourseModal = (course: OnlineCourseItem) => {
    setEditingCourse(course);
    setCourseForm({
      titleUa: course.titleUa,
      titlePl: course.titlePl,
      subtitleUa: course.subtitleUa || "",
      subtitlePl: course.subtitlePl || "",
      descriptionUa: course.descriptionUa,
      descriptionPl: course.descriptionPl,
      pricePln: course.pricePln,
      priceMaxPln: course.priceMaxPln ?? "",
      durationUa: course.durationUa || "",
      durationPl: course.durationPl || "",
      badgeUa: course.badgeUa || "",
      badgePl: course.badgePl || "",
      coverUrl: course.coverUrl || "",
      sortOrder: course.sortOrder,
      isActive: course.isActive,
    });
    setCourseModalOpen(true);
  };

  // Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);

    try {
      const payload = {
        ...courseForm,
        pricePln: Number(courseForm.pricePln) || 0,
        priceMaxPln:
          courseForm.priceMaxPln !== "" && courseForm.priceMaxPln !== null
            ? Number(courseForm.priceMaxPln)
            : null,
      };

      const url = editingCourse
        ? `/api/online-courses/${editingCourse.id}`
        : "/api/online-courses";
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCourseModalOpen(false);
        await fetchData();
      } else {
        const err = await res.json();
        alert("Помилка збереження курсу: " + (err.error || "Невідома помилка"));
      }
    } catch (e) {
      console.error(e);
      alert("Помилка підключення");
    } finally {
      setSavingCourse(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Ви впевнені, що хочете видалити онлайн-курс "${title}" та всі його матеріали?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/online-courses/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Не вдалося видалити курс");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Material Modal
  const openCreateMaterialModal = (courseId: string) => {
    setEditingMaterial(null);
    setTargetCourseId(courseId);
    setMaterialForm({
      titleUa: "",
      titlePl: "",
      descriptionUa: "",
      descriptionPl: "",
      type: "video",
      fileUrl: "",
      videoEmbedUrl: "",
      sortOrder: 0,
    });
    setMaterialModalOpen(true);
  };

  const openEditMaterialModal = (mat: CourseMaterial, courseId: string) => {
    setEditingMaterial(mat);
    setTargetCourseId(courseId);
    setMaterialForm({
      titleUa: mat.titleUa,
      titlePl: mat.titlePl,
      descriptionUa: mat.descriptionUa || "",
      descriptionPl: mat.descriptionPl || "",
      type: mat.type,
      fileUrl: mat.fileUrl || "",
      videoEmbedUrl: mat.videoEmbedUrl || "",
      sortOrder: mat.sortOrder,
    });
    setMaterialModalOpen(true);
  };

  // Save Material
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMaterial(true);

    try {
      const url = editingMaterial
        ? `/api/online-courses/materials/${editingMaterial.id}`
        : `/api/online-courses/${targetCourseId}/materials`;
      const method = editingMaterial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(materialForm),
      });

      if (res.ok) {
        setMaterialModalOpen(false);
        await fetchData();
      } else {
        const err = await res.json();
        alert("Помилка збереження матеріалу: " + (err.error || "Невідома помилка"));
      }
    } catch (e) {
      console.error(e);
      alert("Помилка підключення");
    } finally {
      setSavingMaterial(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (matId: string, title: string) => {
    if (!confirm(`Видалити матеріал "${title}"?`)) return;

    try {
      const res = await fetch(`/api/online-courses/materials/${matId}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Student Modal
  const openCreateStudentModal = () => {
    setEditingStudent(null);
    setStudentForm({
      username: "",
      password: "",
      name: "",
      email: "",
      notes: "",
      isActive: true,
      selectedCourseIds: courses.map((c) => c.id), // default to all active courses or empty
    });
    setStudentModalOpen(true);
  };

  const openEditStudentModal = (student: StudentItem) => {
    setEditingStudent(student);
    setStudentForm({
      username: student.username,
      password: "", // empty means do not change
      name: student.name || "",
      email: student.email || "",
      notes: student.notes || "",
      isActive: student.isActive,
      selectedCourseIds: student.courses.map((c) => c.courseId),
    });
    setStudentModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setStudentForm((prev) => ({ ...prev, password: pass }));
  };

  // Save Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStudent(true);

    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";

      const payload = {
        username: studentForm.username,
        name: studentForm.name,
        email: studentForm.email,
        notes: studentForm.notes,
        isActive: studentForm.isActive,
        courseIds: studentForm.selectedCourseIds,
        ...(studentForm.password && { password: studentForm.password }),
      };

      const res = await fetch(url, {
        method,
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStudentModalOpen(false);
        await fetchData();
      } else {
        const err = await res.json();
        alert("Помилка збереження студента: " + (err.error || "Невідома помилка"));
      }
    } catch (e) {
      console.error(e);
      alert("Помилка підключення");
    } finally {
      setSavingStudent(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id: string, username: string) => {
    if (!confirm(`Видалити акаунт студента "${username}"?`)) return;

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE",
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-gold-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner with Website Visibility Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-nude-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-gold-100 text-gold-800">
                <Video className="w-5 h-5" />
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">
                Онлайн-курси, матеріали та доступ для учениць
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl">
              Керуйте авторськими онлайн-програмами, додавайте відеоуроки, презентації чи PDF, а також створюйте логіни та паролі для клієнток, які придбали курс.
            </p>
          </div>

          {/* Visibility Toggle Switch */}
          <div className="bg-nude-50/80 p-4 rounded-2xl border border-nude-200 flex flex-col sm:items-end gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-charcoal-700">
              Показ секції на сайті:
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleVisibility}
                disabled={savingVisibility}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSectionVisible ? "bg-emerald-600" : "bg-charcoal-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isSectionVisible ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  isSectionVisible
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {isSectionVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Опубліковано</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Приховано</span>
                  </>
                )}
              </span>
            </div>
            <span className="text-[11px] text-charcoal-400">
              {isSectionVisible
                ? "Секція відображається на головній сторінці"
                : "Користувачі не бачать цей блок на сайті"}
            </span>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-nude-200">
          <button
            onClick={() => setActiveSubTab("courses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === "courses"
                ? "bg-charcoal-900 text-white shadow-soft"
                : "bg-nude-100 text-charcoal-600 hover:bg-nude-200"
            }`}
          >
            <Video className="w-4 h-4 text-gold-300" />
            <span>Онлайн-курси та матеріали ({courses.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("students")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === "students"
                ? "bg-charcoal-900 text-white shadow-soft"
                : "bg-nude-100 text-charcoal-600 hover:bg-nude-200"
            }`}
          >
            <Users className="w-4 h-4 text-gold-300" />
            <span>Студенти та доступи ({students.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SUB-TAB: ONLINE COURSES & MATERIALS                     */}
      {/* ========================================================= */}
      {activeSubTab === "courses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg font-bold text-charcoal-900">
              Список онлайн-курсів
            </h4>
            <button
              onClick={openCreateCourseModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-gold-600 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Додати онлайн-курс</span>
            </button>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-nude-200">
              <Video className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              <p className="font-serif text-base text-charcoal-700 font-semibold mb-1">
                Поки що немає створених онлайн-курсів
              </p>
              <p className="text-xs text-charcoal-500 mb-5">
                Натисніть кнопку нижче, щоб додати перший онлайн-курс та завантажити навчальні матеріали.
              </p>
              <button
                onClick={openCreateCourseModal}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-gold-600 transition-all"
              >
                + Створити перший онлайн-курс
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                const materialsCount = course.materials?.length ?? course._count?.materials ?? 0;
                const studentsCount = course._count?.students ?? 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-nude-200 space-y-5"
                  >
                    {/* Course Overview Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        {course.coverUrl ? (
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-nude-100 shrink-0 border border-nude-200">
                            <Image
                              src={course.coverUrl}
                              alt={course.titleUa}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-nude-100 flex items-center justify-center text-charcoal-400 shrink-0 border border-nude-200">
                            <Video className="w-8 h-8 text-gold-600/60" />
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {course.badgeUa && (
                              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800">
                                {course.badgeUa}
                              </span>
                            )}
                            <span className="text-xs text-charcoal-400">
                              {course.durationUa || "30 днів"}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg sm:text-xl font-bold text-charcoal-900">
                            {course.titleUa}
                          </h4>
                          <p className="text-xs text-charcoal-500 font-serif">
                            PL: {course.titlePl}
                          </p>
                          {course.subtitleUa && (
                            <p className="text-xs text-charcoal-600 mt-1 line-clamp-1">
                              {course.subtitleUa}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Meta & Actions */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end md:self-center">
                        <div className="text-right">
                          <span className="text-[11px] uppercase text-charcoal-400 font-medium block">
                            Вартість
                          </span>
                          <span className="font-serif text-xl font-bold text-charcoal-900">
                            {course.priceMaxPln && course.priceMaxPln > 0
                              ? `${course.pricePln} – ${course.priceMaxPln} zł`
                              : `${course.pricePln} zł`}
                          </span>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="text-[11px] uppercase text-charcoal-400 font-medium block">
                            Матеріалів
                          </span>
                          <span className="text-sm font-semibold text-charcoal-800">
                            {materialsCount} уроків
                          </span>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="text-[11px] uppercase text-charcoal-400 font-medium block">
                            Учениць
                          </span>
                          <span className="text-sm font-semibold text-charcoal-800">
                            {studentsCount} доступів
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setExpandedCourseId(isExpanded ? null : course.id)
                            }
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                              isExpanded
                                ? "bg-charcoal-900 text-white"
                                : "bg-nude-100 hover:bg-nude-200 text-charcoal-800"
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Матеріали ({materialsCount})</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>

                          <button
                            onClick={() => openEditCourseModal(course)}
                            className="p-2 rounded-xl bg-nude-100 hover:bg-gold-500 hover:text-white text-charcoal-800 transition-colors"
                            title="Редагувати курс"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCourse(course.id, course.titleUa)}
                            className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Видалити курс"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Materials Drawer */}
                    {isExpanded && (
                      <div className="pt-5 border-t border-nude-200 animate-fadeIn space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-gold-600" />
                            <span>Навчальні матеріали та відеоуроки ({materialsCount})</span>
                          </span>

                          <button
                            onClick={() => openCreateMaterialModal(course.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold-600 hover:bg-gold-700 text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Додати урок / файл</span>
                          </button>
                        </div>

                        {(!course.materials || course.materials.length === 0) ? (
                          <div className="bg-nude-50 rounded-2xl p-6 text-center text-xs text-charcoal-500">
                            У цьому курсі ще немає доданих відеоуроків чи файлів. Натисніть «Додати урок / файл», щоб завантажити відео або PDF.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {course.materials.map((mat, idx) => (
                              <div
                                key={mat.id}
                                className="bg-nude-50/70 hover:bg-nude-100/80 rounded-2xl p-3.5 border border-nude-200/90 flex items-center justify-between gap-4 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-charcoal-600 border border-nude-200 shrink-0">
                                    {idx + 1}
                                  </span>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                      mat.type === "video"
                                        ? "bg-sky-100 text-sky-800"
                                        : mat.type === "pdf"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {mat.type === "video"
                                      ? "Відео"
                                      : mat.type === "pdf"
                                      ? "PDF"
                                      : "Презентація"}
                                  </span>

                                  <div>
                                    <h5 className="text-xs sm:text-sm font-semibold text-charcoal-900">
                                      {mat.titleUa}
                                    </h5>
                                    <p className="text-[11px] text-charcoal-500">
                                      PL: {mat.titlePl}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {mat.fileUrl && (
                                    <a
                                      href={mat.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg text-charcoal-500 hover:text-gold-700 transition-colors"
                                      title="Відкрити файл"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}

                                  <button
                                    onClick={() => openEditMaterialModal(mat, course.id)}
                                    className="p-1.5 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-white transition-colors"
                                    title="Редагувати матеріал"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteMaterial(mat.id, mat.titleUa)}
                                    className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 transition-colors"
                                    title="Видалити матеріал"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SUB-TAB: STUDENTS & ACCESS MANAGEMENT                   */}
      {/* ========================================================= */}
      {activeSubTab === "students" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-serif text-lg font-bold text-charcoal-900">
                Акаунти учениць та доступи до курсів
              </h4>
              <p className="text-xs text-charcoal-500">
                Створюйте логіни та паролі для клієнток після оплати та призначайте їм відповідні онлайн-курси.
              </p>
            </div>
            <button
              onClick={openCreateStudentModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-gold-600 transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Створити акаунт учениці</span>
            </button>
          </div>

          {students.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-nude-200">
              <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              <p className="font-serif text-base text-charcoal-700 font-semibold mb-1">
                Ще немає створених акаунтів учениць
              </p>
              <p className="text-xs text-charcoal-500 mb-5">
                Створіть логін і пароль для першої учениці, щоб надати їй доступ до онлайн-навчання.
              </p>
              <button
                onClick={openCreateStudentModal}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-charcoal-800 hover:bg-gold-600 transition-all"
              >
                + Створити акаунт учениці
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-soft border border-nude-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-nude-50/80 border-b border-nude-200 text-[11px] font-bold uppercase tracking-wider text-charcoal-600">
                      <th className="p-4 pl-6">Логін (Username)</th>
                      <th className="p-4">Ім&apos;я / Контакти</th>
                      <th className="p-4">Доступні курси</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Останній вхід</th>
                      <th className="p-4 pr-6 text-right">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nude-200 text-xs">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-nude-50/50 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-charcoal-900">
                          {student.username}
                        </td>
                        <td className="p-4 text-charcoal-700">
                          {student.name && <div className="font-semibold">{student.name}</div>}
                          {student.email && <div className="text-charcoal-500 text-[11px]">{student.email}</div>}
                          {student.notes && (
                            <div className="text-charcoal-400 text-[10px] italic mt-0.5">
                              {student.notes}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {student.courses.length === 0 ? (
                              <span className="text-[11px] text-charcoal-400 italic">
                                Немає доступних курсів
                              </span>
                            ) : (
                              student.courses.map((c) => (
                                <span
                                  key={c.courseId}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-100 text-gold-900 border border-gold-200/80"
                                >
                                  {c.courseTitleUa}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              student.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {student.isActive ? "Активний" : "Заблоковано"}
                          </span>
                        </td>
                        <td className="p-4 text-charcoal-500 text-[11px]">
                          {student.lastLoginAt
                            ? new Date(student.lastLoginAt).toLocaleDateString("uk-UA", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Ще не заходила"}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditStudentModal(student)}
                              className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-nude-100 transition-colors"
                              title="Редагувати акаунт та доступи"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id, student.username)}
                              className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Видалити акаунт"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: CREATE / EDIT ONLINE COURSE                     */}
      {/* ========================================================= */}
      {courseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setCourseModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-nude-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-nude-100 pb-4 mb-6">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingCourse ? "Редагування онлайн-курсу" : "Додати новий онлайн-курс"}
              </h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-5">
              {/* Titles UA & PL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Назва курсу (UA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.titleUa}
                    onChange={(e) => setCourseForm({ ...courseForm, titleUa: e.target.value })}
                    placeholder="Напр. Ідеальний зріз та швидка архітектура"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Назва курсу (PL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.titlePl}
                    onChange={(e) => setCourseForm({ ...courseForm, titlePl: e.target.value })}
                    placeholder="np. Perfekcyjne cięcie i architektura żelu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtitles UA & PL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Короткий підзаголовок (UA)
                  </label>
                  <input
                    type="text"
                    value={courseForm.subtitleUa}
                    onChange={(e) => setCourseForm({ ...courseForm, subtitleUa: e.target.value })}
                    placeholder="Покрокова методика для майстрів будь-якого рівня"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Короткий підзаголовок (PL)
                  </label>
                  <input
                    type="text"
                    value={courseForm.subtitlePl}
                    onChange={(e) => setCourseForm({ ...courseForm, subtitlePl: e.target.value })}
                    placeholder="Program krok po kroku dla stylistek"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Descriptions UA & PL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Опис курсу (UA) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={courseForm.descriptionUa}
                    onChange={(e) => setCourseForm({ ...courseForm, descriptionUa: e.target.value })}
                    placeholder="Детальний опис, що входить у курс..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Опис курсу (PL) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={courseForm.descriptionPl}
                    onChange={(e) => setCourseForm({ ...courseForm, descriptionPl: e.target.value })}
                    placeholder="Opis kursu po polsku..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Ціна від (PLN) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={courseForm.pricePln}
                    onChange={(e) => setCourseForm({ ...courseForm, pricePln: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1 flex items-center justify-between">
                    <span>Ціна до (PLN)</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">(діапазон)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={courseForm.priceMaxPln}
                    onChange={(e) => setCourseForm({ ...courseForm, priceMaxPln: e.target.value })}
                    placeholder="Напр. 1500"
                    className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Термін доступу (UA)
                  </label>
                  <input
                    type="text"
                    value={courseForm.durationUa}
                    onChange={(e) => setCourseForm({ ...courseForm, durationUa: e.target.value })}
                    placeholder="30 днів доступу"
                    className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Термін доступу (PL)
                  </label>
                  <input
                    type="text"
                    value={courseForm.durationPl}
                    onChange={(e) => setCourseForm({ ...courseForm, durationPl: e.target.value })}
                    placeholder="30 dni dostępu"
                    className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Обкладинка курсу
                </label>
                <div className="flex items-center gap-4">
                  {courseForm.coverUrl && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-nude-100 border border-nude-200 shrink-0">
                      <Image
                        src={courseForm.coverUrl}
                        alt="Course cover"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="block w-full text-xs text-charcoal-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-nude-100 file:text-charcoal-800 hover:file:bg-nude-200 cursor-pointer"
                    />
                    {uploadingCover && (
                      <p className="text-xs text-gold-600 mt-1">Завантаження обкладинки...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-nude-100">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-nude-300 text-xs font-semibold text-charcoal-600 hover:bg-nude-50 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={savingCourse || uploadingCover}
                  className="px-6 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  {savingCourse ? "Збереження..." : "Зберегти онлайн-курс"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: CREATE / EDIT COURSE MATERIAL                   */}
      {/* ========================================================= */}
      {materialModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setMaterialModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-nude-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-nude-100 pb-4 mb-5">
              <h3 className="font-serif text-lg font-bold text-charcoal-900">
                {editingMaterial ? "Редагування матеріалу" : "Додати навчальний матеріал"}
              </h3>
              <button
                onClick={() => setMaterialModalOpen(false)}
                className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              {/* Material Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1.5">
                  Тип матеріалу
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterialForm({ ...materialForm, type: "video" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      materialForm.type === "video"
                        ? "bg-sky-50 border-sky-400 text-sky-900 shadow-xs"
                        : "border-nude-200 text-charcoal-600 hover:bg-nude-50"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Відеоурок</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialForm({ ...materialForm, type: "pdf" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      materialForm.type === "pdf"
                        ? "bg-rose-50 border-rose-400 text-rose-900 shadow-xs"
                        : "border-nude-200 text-charcoal-600 hover:bg-nude-50"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF файл</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialForm({ ...materialForm, type: "presentation" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      materialForm.type === "presentation"
                        ? "bg-amber-50 border-amber-400 text-amber-900 shadow-xs"
                        : "border-nude-200 text-charcoal-600 hover:bg-nude-50"
                    }`}
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Презентація</span>
                  </button>
                </div>
              </div>

              {/* Title UA & PL */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Назва уроку / файлу (UA) *
                </label>
                <input
                  type="text"
                  required
                  value={materialForm.titleUa}
                  onChange={(e) => setMaterialForm({ ...materialForm, titleUa: e.target.value })}
                  placeholder="Напр. Урок 1: Постановка фрези та безпечний зріз"
                  className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Назва уроку / файлу (PL) *
                </label>
                <input
                  type="text"
                  required
                  value={materialForm.titlePl}
                  onChange={(e) => setMaterialForm({ ...materialForm, titlePl: e.target.value })}
                  placeholder="np. Lekcja 1: Ułożenie frezu i bezpieczne cięcie"
                  className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Video Embed or File URL */}
              {materialForm.type === "video" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Посилання на відео (YouTube, Vimeo, Google Drive або пряме mp4)
                    </label>
                    <input
                      type="text"
                      value={materialForm.videoEmbedUrl}
                      onChange={(e) =>
                        setMaterialForm({ ...materialForm, videoEmbedUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=... або Vimeo"
                      className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-charcoal-500 mb-1">
                      Або завантажте відеофайл безпосередньо:
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMaterialFileUpload}
                      disabled={uploadingMaterialFile}
                      className="block w-full text-xs text-charcoal-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-nude-100 file:text-charcoal-800 hover:file:bg-nude-200 cursor-pointer"
                    />
                    {uploadingMaterialFile && (
                      <p className="text-xs text-gold-600 mt-1">Завантаження файлу...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Завантажити файл ({materialForm.type.toUpperCase()}) *
                  </label>
                  <input
                    type="file"
                    accept={
                      materialForm.type === "pdf"
                        ? ".pdf"
                        : ".pdf,.ppt,.pptx,.key,image/*"
                    }
                    onChange={handleMaterialFileUpload}
                    disabled={uploadingMaterialFile}
                    className="block w-full text-xs text-charcoal-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-nude-100 file:text-charcoal-800 hover:file:bg-nude-200 cursor-pointer mb-2"
                  />
                  {uploadingMaterialFile && (
                    <p className="text-xs text-gold-600 mb-2">Завантаження документа...</p>
                  )}
                  {materialForm.fileUrl && (
                    <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg truncate">
                      ✅ Файл завантажено: {materialForm.fileUrl}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-100">
                <button
                  type="button"
                  onClick={() => setMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-nude-300 text-xs font-semibold text-charcoal-600 hover:bg-nude-50"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={savingMaterial || uploadingMaterialFile}
                  className="px-5 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold shadow-sm"
                >
                  {savingMaterial ? "Збереження..." : "Зберегти матеріал"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL: CREATE / EDIT STUDENT ACCOUNT                   */}
      {/* ========================================================= */}
      {studentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setStudentModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-nude-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-nude-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gold-100 text-gold-800">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900">
                  {editingStudent ? "Редагування акаунта учениці" : "Створити акаунт для учениці"}
                </h3>
              </div>
              <button
                onClick={() => setStudentModalOpen(false)}
                className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Логін (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.username}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, username: e.target.value.toLowerCase() })
                  }
                  placeholder="напр. oksana_krakow"
                  className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm font-mono focus:border-gold-500 focus:outline-none"
                />
                <p className="text-[11px] text-charcoal-400 mt-0.5">
                  Цей логін учениця буде вводити для входу на сайті.
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-charcoal-700">
                    {editingStudent ? "Новий пароль (залиште пустим, щоб не міняти)" : "Пароль *"}
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-semibold text-gold-700 hover:text-gold-900 transition-colors"
                  >
                    🎲 Згенерувати
                  </button>
                </div>
                <input
                  type="text"
                  required={!editingStudent}
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  placeholder={editingStudent ? "Залиште пустим або введіть новий" : "Введіть пароль для учениці"}
                  className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm font-mono focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Ім&apos;я та прізвище учениці
                </label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Оксана Ковальчук"
                  className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Email / Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Email або телефон
                  </label>
                  <input
                    type="text"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="oksana@gmail.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Нотатки (для себе)
                  </label>
                  <input
                    type="text"
                    value={studentForm.notes}
                    onChange={(e) => setStudentForm({ ...studentForm, notes: e.target.value })}
                    placeholder="Instagram / дата оплати"
                    className="w-full px-3.5 py-2 rounded-xl border border-nude-300 text-sm focus:border-gold-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Course Access Checkboxes */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-charcoal-800 mb-2">
                  Доступ до курсів (виберіть, які курси відкрити для учениці):
                </label>
                {courses.length === 0 ? (
                  <p className="text-xs text-charcoal-400 italic">
                    Спочатку створіть онлайн-курси у сусідній вкладці.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-nude-50 border border-nude-200">
                    {courses.map((course) => {
                      const isChecked = studentForm.selectedCourseIds.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setStudentForm({
                                  ...studentForm,
                                  selectedCourseIds: [
                                    ...studentForm.selectedCourseIds,
                                    course.id,
                                  ],
                                });
                              } else {
                                setStudentForm({
                                  ...studentForm,
                                  selectedCourseIds: studentForm.selectedCourseIds.filter(
                                    (id) => id !== course.id
                                  ),
                                });
                              }
                            }}
                            className="w-4 h-4 text-gold-600 rounded border-nude-300 focus:ring-gold-500"
                          />
                          <span className="text-xs font-medium text-charcoal-800">
                            {course.titleUa}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="student-active"
                  checked={studentForm.isActive}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-gold-600 rounded border-nude-300 focus:ring-gold-500"
                />
                <label htmlFor="student-active" className="text-xs font-medium text-charcoal-700">
                  Акаунт активний (якщо зняти галочку, вхід буде заблоковано)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-nude-100">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-nude-300 text-xs font-semibold text-charcoal-600 hover:bg-nude-50"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={savingStudent}
                  className="px-5 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold shadow-sm"
                >
                  {savingStudent ? "Збереження..." : "Зберегти акаунт"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
