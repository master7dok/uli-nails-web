"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  Video,
  FileText,
  Presentation,
  Download,
  LogOut,
  PlayCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface CourseMaterial {
  id: string;
  titleUa: string;
  titlePl: string;
  descriptionUa?: string | null;
  descriptionPl?: string | null;
  type: "video" | "pdf" | "presentation";
  fileUrl?: string | null;
  videoEmbedUrl?: string | null;
  sortOrder: number;
}

interface AccessibleCourse {
  id: string;
  slug: string;
  titleUa: string;
  titlePl: string;
  subtitleUa?: string | null;
  subtitlePl?: string | null;
  descriptionUa: string;
  descriptionPl: string;
  coverUrl?: string | null;
  durationUa?: string | null;
  durationPl?: string | null;
  materials: CourseMaterial[];
}

interface StudentData {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
}

export default function StudentPortalPage() {
  const { language, setLanguage, t, getLocalized } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [courses, setCourses] = useState<AccessibleCourse[]>([]);

  // Active viewing state
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);

  // Login form fallback state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const checkSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.student) {
          setStudent(data.student);
          setCourses(data.courses || []);
          if (data.courses && data.courses.length > 0) {
            setSelectedCourseId(data.courses[0].id);
            if (data.courses[0].materials && data.courses[0].materials.length > 0) {
              setActiveMaterialId(data.courses[0].materials[0].id);
            }
          }
        } else {
          setStudent(null);
        }
      } else {
        setStudent(null);
      }
    } catch {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await checkSession();
      } else {
        setLoginError(
          data.error ||
            (language === "ua"
              ? "Невірний логін або пароль."
              : "Nieprawidłowy login lub hasło.")
        );
      }
    } catch {
      setLoginError(
        language === "ua"
          ? "Помилка сервера. Спробуйте пізніше."
          : "Błąd serwera. Spróbuj później."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/student/logout", { method: "POST" });
    } catch {}
    setStudent(null);
    setCourses([]);
    setSelectedCourseId(null);
    setActiveMaterialId(null);
  };

  const loc = (t as any).studentCabinet || {
    title: language === "ua" ? "Особистий кабінет учениці" : "Strefa kursantki",
    greeting: language === "ua" ? "Вітаємо," : "Witaj,",
    welcomeText:
      language === "ua"
        ? "Тут зібрані всі навчальні матеріали, відеоуроки та презентації ваших курсів."
        : "Tutaj znajdziesz wszystkie materiały szkoleniowe i lekcje wideo.",
    myCourses: language === "ua" ? "Ваші доступні курси" : "Twoje kursy",
    noCourses:
      language === "ua"
        ? "Наразі у вас немає активних курсів. Якщо ви щойно здійснили оплату, зв'яжіться з Уляною."
        : "Obecnie nie masz aktywnych kursów. Skontaktuj się z Ulianą.",
    materialsTitle: language === "ua" ? "Матеріали курсу" : "Materiały szkoleniowe",
    videoLesson: language === "ua" ? "Відеоурок" : "Lekcja wideo",
    pdfFile: language === "ua" ? "PDF файл" : "Plik PDF",
    presentationFile: language === "ua" ? "Презентація" : "Prezentacja",
    downloadBtn: language === "ua" ? "Завантажити матеріал" : "Pobierz plik",
    logout: language === "ua" ? "Вийти" : "Wyloguj",
    backToHome: language === "ua" ? "На головну" : "Strona główna",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold-600 mx-auto" />
          <p className="font-serif text-sm text-charcoal-600">
            {language === "ua" ? "Завантаження кабінету..." : "Ładowanie strefy kursantki..."}
          </p>
        </div>
      </div>
    );
  }

  // If student is NOT logged in: show dedicated clean Login Form
  if (!student) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
        <header className="py-6 px-4 sm:px-8 flex items-center justify-between border-b border-nude-200 bg-white/60 backdrop-blur-sm">
          <Link href="/" className="font-serif text-lg font-bold tracking-wider text-charcoal-900 uppercase">
            Uliana Nails
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "ua" ? "pl" : "ua")}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-nude-100 text-charcoal-700 hover:bg-nude-200 transition-colors"
            >
              {language.toUpperCase()}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal-600 hover:text-gold-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{loc.backToHome}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-9 shadow-card border border-nude-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 mb-3 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-charcoal-900 mb-1">
                {language === "ua" ? "Вхід для учениць" : "Logowanie dla kursantek"}
              </h1>
              <p className="text-xs text-charcoal-500">
                {language === "ua"
                  ? "Введіть логін та пароль, отримані від Уляни"
                  : "Wprowadź login i hasło przekazane przez Ulianę"}
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  {language === "ua" ? "Логін" : "Login"}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder={language === "ua" ? "Ваш логін" : "Twój login"}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-nude-300 text-sm font-mono focus:border-gold-600 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  {language === "ua" ? "Пароль" : "Hasło"}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={language === "ua" ? "Введіть пароль" : "Wprowadź hasło"}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-nude-300 text-sm font-mono focus:border-gold-600 focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === "ua" ? "Перевірка..." : "Weryfikacja..."}</span>
                  </>
                ) : (
                  <span>{language === "ua" ? "Увійти в кабінет" : "Zaloguj się"}</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-charcoal-400 border-t border-nude-200">
          © {new Date().getFullYear()} Uliana Nails. All rights reserved.
        </footer>
      </div>
    );
  }

  // Student IS logged in: show Student Portal Workspace
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const currentMaterial =
    currentCourse?.materials?.find((m) => m.id === activeMaterialId) ||
    currentCourse?.materials?.[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-nude-200 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-lg font-bold tracking-wider text-charcoal-900 uppercase">
              Uliana Nails
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-gold-100 text-gold-800 border border-gold-300">
              {loc.title}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Student greeting */}
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-charcoal-500 block">
                {loc.greeting}
              </span>
              <span className="text-xs font-bold text-charcoal-900">
                {student.name || student.username}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#EFE9DF]/70 p-0.5 rounded-full border border-[#E4D9CA]">
              <button
                onClick={() => setLanguage("ua")}
                className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                  language === "ua" ? "bg-white text-charcoal-900 shadow-xs" : "text-charcoal-500"
                }`}
              >
                UA
              </button>
              <button
                onClick={() => setLanguage("pl")}
                className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-all ${
                  language === "pl" ? "bg-white text-charcoal-900 shadow-xs" : "text-charcoal-500"
                }`}
              >
                PL
              </button>
            </div>

            {/* Back to site */}
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-nude-300 text-charcoal-700 hover:bg-nude-100 transition-colors hidden md:inline-flex"
            >
              {loc.backToHome}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-nude-100 hover:bg-rose-50 text-charcoal-700 hover:text-rose-700 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loc.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-nude-200 max-w-2xl mx-auto shadow-soft">
            <BookOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <h2 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
              {loc.noCourses}
            </h2>
            <p className="text-xs text-charcoal-500 mb-6">
              Якщо ви вже оплатили доступ до курсу, будь ласка, напишіть Уляні в Instagram або Telegram для активації.
            </p>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-full bg-charcoal-900 text-white text-xs font-semibold uppercase tracking-wider"
            >
              {loc.backToHome}
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Courses Switcher Bar (if more than 1 course) */}
            {courses.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {courses.map((c) => {
                  const isActive = c.id === selectedCourseId;
                  const cTitle = getLocalized(c, "title");
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        if (c.materials && c.materials.length > 0) {
                          setActiveMaterialId(c.materials[0].id);
                        }
                      }}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-charcoal-900 text-white shadow-soft"
                          : "bg-white text-charcoal-700 hover:bg-nude-100 border border-nude-200"
                      }`}
                    >
                      {cTitle}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Course Workspace Layout: Player / Content on Left, Materials list on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left 2 Cols: Main Player / Document View */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-nude-200 space-y-6">
                  {/* Active Material Header */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gold-700 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {currentMaterial?.type === "video"
                          ? loc.videoLesson
                          : currentMaterial?.type === "pdf"
                          ? loc.pdfFile
                          : loc.presentationFile}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                      {currentMaterial
                        ? getLocalized(currentMaterial, "title")
                        : getLocalized(currentCourse, "title")}
                    </h2>
                    {currentMaterial && getLocalized(currentMaterial, "description") && (
                      <p className="text-xs sm:text-sm text-charcoal-600 mt-2 leading-relaxed">
                        {getLocalized(currentMaterial, "description")}
                      </p>
                    )}
                  </div>

                  {/* Player Container */}
                  <div className="rounded-2xl overflow-hidden bg-charcoal-950 aspect-video relative shadow-inner flex items-center justify-center">
                    {currentMaterial?.type === "video" ? (
                      currentMaterial.videoEmbedUrl ? (
                        currentMaterial.videoEmbedUrl.includes("youtube.com") ||
                        currentMaterial.videoEmbedUrl.includes("youtu.be") ||
                        currentMaterial.videoEmbedUrl.includes("vimeo.com") ? (
                          <iframe
                            src={
                              currentMaterial.videoEmbedUrl.includes("youtube.com/watch?v=")
                                ? currentMaterial.videoEmbedUrl.replace("watch?v=", "embed/")
                                : currentMaterial.videoEmbedUrl.includes("youtu.be/")
                                ? currentMaterial.videoEmbedUrl.replace("youtu.be/", "www.youtube.com/embed/")
                                : currentMaterial.videoEmbedUrl.includes("vimeo.com/")
                                ? currentMaterial.videoEmbedUrl.replace("vimeo.com/", "player.vimeo.com/video/")
                                : currentMaterial.videoEmbedUrl
                            }
                            title={getLocalized(currentMaterial, "title") || "Course Video"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <video
                            src={currentMaterial.videoEmbedUrl}
                            controls
                            className="w-full h-full"
                          />
                        )
                      ) : currentMaterial.fileUrl ? (
                        <video
                          src={currentMaterial.fileUrl}
                          controls
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="text-center p-8 text-charcoal-400 space-y-2">
                          <PlayCircle className="w-12 h-12 mx-auto text-gold-500/50" />
                          <p className="text-xs">Відео скоро буде завантажено</p>
                        </div>
                      )
                    ) : (
                      /* Document / PDF view preview card */
                      <div className="p-8 text-center text-white space-y-4 max-w-sm">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-gold-300">
                          {currentMaterial?.type === "pdf" ? (
                            <FileText className="w-8 h-8" />
                          ) : (
                            <Presentation className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-lg font-bold">
                            {getLocalized(currentMaterial, "title")}
                          </h4>
                          <p className="text-xs text-charcoal-300 mt-1">
                            Натисніть кнопку нижче, щоб завантажити та відкрити цей матеріал.
                          </p>
                        </div>
                        {currentMaterial?.fileUrl && (
                          <a
                            href={currentMaterial.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-600 hover:bg-gold-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-lg"
                          >
                            <Download className="w-4 h-4" />
                            <span>{loc.downloadBtn}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions under player */}
                  {currentMaterial?.fileUrl && currentMaterial.type !== "video" && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-nude-50 border border-nude-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gold-700" />
                        <div>
                          <span className="text-xs font-bold text-charcoal-900 block">
                            {getLocalized(currentMaterial, "title")}
                          </span>
                          <span className="text-[11px] text-charcoal-500">
                            Формат: {currentMaterial.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <a
                        href={currentMaterial.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-semibold transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{loc.downloadBtn}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Course Curriculum / Materials List */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-nude-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-nude-100 pb-3">
                    <h3 className="font-serif text-base font-bold text-charcoal-900">
                      {loc.materialsTitle}
                    </h3>
                    <span className="text-xs font-semibold text-charcoal-400">
                      {currentCourse.materials.length} уроків
                    </span>
                  </div>

                  {currentCourse.materials.length === 0 ? (
                    <p className="text-xs text-charcoal-400 italic py-4 text-center">
                      Матеріали ще готуються до публікації.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {currentCourse.materials.map((mat, idx) => {
                        const isCurrent = mat.id === (currentMaterial?.id || currentCourse.materials[0]?.id);
                        const mTitle = getLocalized(mat, "title");

                        return (
                          <button
                            key={mat.id}
                            onClick={() => setActiveMaterialId(mat.id)}
                            className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isCurrent
                                ? "bg-charcoal-900 text-white border-charcoal-900 shadow-md"
                                : "bg-nude-50/70 hover:bg-nude-100/90 border-nude-200/80 text-charcoal-800"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 ${
                                  isCurrent
                                    ? "bg-white/20 text-white"
                                    : "bg-white text-charcoal-600 border border-nude-200"
                                }`}
                              >
                                {idx + 1}
                              </span>

                              <div className="min-w-0">
                                <span
                                  className={`text-xs font-semibold block truncate ${
                                    isCurrent ? "text-white" : "text-charcoal-900"
                                  }`}
                                >
                                  {mTitle}
                                </span>
                                <span
                                  className={`text-[10px] uppercase font-bold tracking-wider ${
                                    isCurrent ? "text-gold-300" : "text-charcoal-400"
                                  }`}
                                >
                                  {mat.type === "video"
                                    ? "Відео"
                                    : mat.type === "pdf"
                                    ? "PDF"
                                    : "Презентація"}
                                </span>
                              </div>
                            </div>

                            {isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-gold-300 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Course Details Card */}
                <div className="bg-nude-100/60 rounded-3xl p-6 border border-nude-200 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-charcoal-900">
                    {getLocalized(currentCourse, "title")}
                  </h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    {getLocalized(currentCourse, "description")}
                  </p>
                  {currentCourse.durationUa && (
                    <div className="pt-2 text-xs text-charcoal-500 font-medium">
                      ⏱ Термін доступу: {getLocalized(currentCourse, "duration")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
