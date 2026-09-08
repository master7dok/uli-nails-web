"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminLogin from "@/components/admin/AdminLogin";
import PortfolioTab from "@/components/admin/PortfolioTab";
import PricesTab from "@/components/admin/PricesTab";
import CoursesTab from "@/components/admin/CoursesTab";
import SettingsTab from "@/components/admin/SettingsTab";
import TestimonialsTab from "@/components/admin/TestimonialsTab";
import {
  Image as ImageIcon,
  DollarSign,
  GraduationCap,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  MessageSquareQuote,
} from "lucide-react";

type ActiveTab = "portfolio" | "prices" | "courses" | "testimonials" | "settings";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("prices");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      setIsAuthenticated(data.authenticated === true);
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  const navItems = [
    { id: "prices" as ActiveTab, label: "Прайс-лист", icon: DollarSign },
    { id: "courses" as ActiveTab, label: "Курси & Менторинг", icon: GraduationCap },
    { id: "portfolio" as ActiveTab, label: "Портфоліо / Фото", icon: ImageIcon },
    { id: "testimonials" as ActiveTab, label: "Відгуки (Редагування)", icon: MessageSquareQuote },
    { id: "settings" as ActiveTab, label: "Налаштування & Фото сайту", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB]/70 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-white border-b border-nude-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wider text-charcoal-900 uppercase">
                Uliana Nails
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-gold-100 text-gold-800 border border-gold-300">
                Admin Panel
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 hover:bg-nude-100 transition-colors"
            >
              <span>Відкрити сайт</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Вийти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-nude-200 pb-4 mb-8 overflow-x-auto scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-charcoal-900 text-white shadow-soft"
                    : "bg-white text-charcoal-600 hover:bg-nude-100 border border-nude-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-gold-300" : "text-charcoal-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="animate-fadeIn">
          {activeTab === "prices" && <PricesTab />}
          {activeTab === "courses" && <CoursesTab />}
          {activeTab === "portfolio" && <PortfolioTab />}
          {activeTab === "testimonials" && <TestimonialsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
