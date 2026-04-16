"use client";

import { useState, useEffect } from "react";
import { X, Film } from "lucide-react";
import Link from "next/link";
import { useReservation } from "@/context/ReservationContext";

const STORAGE_KEY = "jiff-popup-dismissed";

export default function JiffPopup() {
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);
  const { setSelectedProgramId, setIsJiffPromo } = useReservation();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < 86400000) return;
    }
    setShow(true);
  }, []);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const handleClose = () => {
    if (checked) {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    }
    setShow(false);
  };

  const handleApply = () => {
    setIsJiffPromo(true);
    setSelectedProgramId("stay");
    handleClose();
    setTimeout(() => {
      document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="relative w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        {/* Film strip decoration top */}
        <div className="flex-shrink-0 h-6 bg-[#151514] flex items-center px-2 gap-1.5 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-[#2d2d2a] flex-shrink-0" />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-8 right-3 z-20 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X size={14} className="text-white/70" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 [-webkit-overflow-scrolling:touch]">
          <div className="px-6 pt-6 pb-5 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5D547]/15 mb-4">
              <Film size={12} className="text-[#F5D547]" />
              <span className="text-[10px] font-bold tracking-widest text-[#F5D547]">
                제27회 전주국제영화제
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl font-black mb-1"
              style={{ color: "#F5D547" }}
            >
              JIFF STAY
            </h2>
            <p className="text-[#9c9a92] text-xs mb-3">
              2026. 4.29 WED — 5.8 FRI
            </p>
            <p className="text-white/90 text-base font-semibold leading-relaxed mb-2">
              &ldquo;영화 다 보고 별 보러 오세요&rdquo;
            </p>
            <p className="text-[11px] leading-relaxed mb-5" style={{ color: "#9c9a92" }}>
              일 년 중 단 10일, 전주에서 가장 큰 축제에<br />
              더 많이 여행 오시길 기대하며 드리는<br />
              달팽이아지트의 선물 같은 하루
            </p>

            {/* Location pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#151514] border border-[#2d2d2a] mb-6">
              <span className="text-sm">🎬</span>
              <span className="text-[11px] text-[#9c9a92]">영화의거리</span>
              <span className="text-[#F5D547] text-[10px] font-bold">→ 차로 12분</span>
              <span className="text-sm">🐌</span>
              <span className="text-[11px] text-white/80">60평 독채</span>
            </div>

            {/* Offer cards */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-3 bg-[#151514] border border-[#2d2d2a] rounded-xl p-3 text-left">
                <span className="text-[#F5D547] text-lg font-black flex-shrink-0">20%</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold">특가 할인</p>
                  <p className="text-[#9c9a92] text-[10px]">70만원 → 56만원</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#151514] border border-[#2d2d2a] rounded-xl p-3 text-left">
                <span className="text-lg flex-shrink-0">🎁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold">현물 혜택 19만원 무료</p>
                  <p className="text-[#9c9a92] text-[10px]">BBQ 그릴 3개 + 목살 5인분 + 애플사이더 5병</p>
                </div>
              </div>
            </div>

            {/* Urgency */}
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-[#E8593C] animate-pulse" />
              <span className="text-[11px] font-bold text-[#E8593C]">
                10일 한정 · 하루 1팀 선착순
              </span>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5">
              <button
                onClick={handleApply}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: "#F5D547", color: "#0a0a0a" }}
              >
                🎬 신청하기
              </button>
              <Link
                href="/programs/jiff"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border transition-all text-white/80 hover:text-white"
                style={{ borderColor: "#2d2d2a" }}
              >
                <Film size={14} />
                자세히 보기
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom: dismiss checkbox + film strip */}
        <div className="flex-shrink-0 px-6 pb-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer justify-center">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#2d2d2a] accent-[#F5D547]"
            />
            <span className="text-[11px] text-[#9c9a92]">오늘 하루 보지 않기</span>
          </label>
        </div>
        <div className="flex-shrink-0 h-6 bg-[#151514] flex items-center px-2 gap-1.5 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm bg-[#2d2d2a] flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
