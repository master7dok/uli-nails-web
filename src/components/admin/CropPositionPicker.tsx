"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ArrowUp, ArrowDown, Move, Disc, Check } from "lucide-react";

interface CropPositionPickerProps {
  imageUrl: string;
  value: string; // e.g. "50% 50%" or "center"
  onChange: (newValue: string) => void;
  aspectRatio?: "4/3" | "1/1";
  label?: string;
}

export function parsePosition(posStr?: string | null): { x: number; y: number } {
  if (!posStr || posStr === "center" || posStr === "center center") {
    return { x: 50, y: 50 };
  }
  if (posStr === "top" || posStr === "center top") return { x: 50, y: 15 };
  if (posStr === "bottom" || posStr === "center bottom") return { x: 50, y: 85 };
  if (posStr === "left" || posStr === "left center") return { x: 15, y: 50 };
  if (posStr === "right" || posStr === "right center") return { x: 85, y: 50 };

  const matches = posStr.match(/(\d+)%\s+(\d+)%/);
  if (matches) {
    return {
      x: parseInt(matches[1], 10),
      y: parseInt(matches[2], 10),
    };
  }
  return { x: 50, y: 50 };
}

export default function CropPositionPicker({
  imageUrl,
  value,
  onChange,
  aspectRatio = "4/3",
  label = "Кадрування передпоказу",
}: CropPositionPickerProps) {
  const { x, y } = parsePosition(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const updateFromPointer = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = Math.max(rect.left, Math.min(rect.right, e.clientX));
    const clientY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));

    const newX = Math.round(((clientX - rect.left) / rect.width) * 100);
    const newY = Math.round(((clientY - rect.top) / rect.height) * 100);

    onChange(`${newX}% ${newY}%`);
  };

  const setPreset = (presetY: number, presetX: number = 50) => {
    onChange(`${presetX}% ${presetY}%`);
  };

  const aspectClass = aspectRatio === "1/1" ? "aspect-square" : "aspect-[4/3]";

  return (
    <div className="space-y-3 bg-nude-50/90 p-4 rounded-2xl border border-nude-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-charcoal-800 flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-gold-700" />
          <span>{label}</span>
        </label>
        <span className="text-[11px] font-mono text-charcoal-500 bg-white px-2 py-0.5 rounded border border-nude-200">
          Фокус: {y}% по висоті
        </span>
      </div>

      <p className="text-[11px] text-charcoal-500 leading-snug">
        Перетягуйте фото мишкою всередині рамки або натисніть швидку кнопку, щоб важлива частина
        (обличчя, руки або сертифікати) була у фокусі картки.
      </p>

      {/* Interactive Preview Container with Pointer Events */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-charcoal-900 cursor-move select-none shadow-inner border border-gold-400/60 touch-none`}
      >
        <Image
          src={imageUrl}
          alt="Crop preview"
          fill
          unoptimized
          style={{ objectPosition: `${x}% ${y}%` }}
          className="object-cover pointer-events-none transition-all duration-75"
        />

        {/* Framing Guide Overlay */}
        <div className="absolute inset-0 border-2 border-white/40 pointer-events-none rounded-xl" />

        {/* Center Crosshair marker */}
        <div
          className="absolute w-6 h-6 rounded-full border-2 border-gold-400 bg-gold-500/30 backdrop-blur-xs -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-md flex items-center justify-center"
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
        </div>

        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-charcoal-900/80 text-[10px] text-white font-medium backdrop-blur-sm pointer-events-none">
          Рамка передпоказу на сайті
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-medium text-charcoal-600 block">Швидкі пресети:</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPreset(15, 50)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1 border ${
              y <= 25
                ? "bg-charcoal-900 text-white border-charcoal-900 shadow-xs"
                : "bg-white text-charcoal-700 border-nude-300 hover:bg-nude-100"
            }`}
          >
            <ArrowUp className="w-3 h-3 text-gold-600" />
            <span>Зверху</span>
          </button>

          <button
            type="button"
            onClick={() => setPreset(50, 50)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1 border ${
              y > 25 && y < 75
                ? "bg-charcoal-900 text-white border-charcoal-900 shadow-xs"
                : "bg-white text-charcoal-700 border-nude-300 hover:bg-nude-100"
            }`}
          >
            <Disc className="w-3 h-3 text-gold-600" />
            <span>По центру</span>
          </button>

          <button
            type="button"
            onClick={() => setPreset(85, 50)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center gap-1 border ${
              y >= 75
                ? "bg-charcoal-900 text-white border-charcoal-900 shadow-xs"
                : "bg-white text-charcoal-700 border-nude-300 hover:bg-nude-100"
            }`}
          >
            <ArrowDown className="w-3 h-3 text-gold-600" />
            <span>Знизу</span>
          </button>
        </div>
      </div>

      {/* Fine-tuning Range Slider */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] text-charcoal-500 mb-1">
          <span>⬆️ Верх (Обличчя)</span>
          <span>⏺️ Центр</span>
          <span>⬇️ Низ (Руки/Нігті)</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={y}
          onChange={(e) => onChange(`${x}% ${e.target.value}%`)}
          className="w-full accent-charcoal-900 cursor-pointer h-1.5 bg-nude-200 rounded-lg appearance-none"
        />
      </div>
    </div>
  );
}
