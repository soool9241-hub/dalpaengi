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

            {/* 할인 */}
            <div className="rounded-xl p-3 mb-3 text-center" style={{ background: "#151514", border: "1px solid #2d2d2a" }}>
              <p className="text-[10px] mb-1" style={{ color: "#9c9a92" }}>숙박 정상가</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg line-through text-white/30">700,000원</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#E8593C20", color: "#E8593C" }}>20% OFF</span>
              </div>
              <p className="text-2xl font-black mt-1" style={{ color: "#F5D547" }}>560,000원</p>
            </div>

            {/* 현물 혜택 */}
            <div className="rounded-xl p-3 mb-3" style={{ background: "#F5D54708", border: "1px solid #F5D54740" }}>
              <p className="text-[10px] font-bold text-center mb-2" style={{ color: "#F5D547" }}>+ 추가 선물 혜택</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/80">🔥 BBQ 그릴 3개</span>
                  <span className="line-through text-white/30">90,000원</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/80">🥩 숯불 목살 5인분</span>
                  <span className="line-through text-white/30">50,000원</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/80">🍎 애플사이더 5병</span>
                  <span className="line-through text-white/30">50,000원</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/80">🥪 조식 샌드위치</span>
                  <span className="line-through text-white/30">인원수 제공</span>
                </div>
              </div>
              <div className="h-px my-2" style={{ background: "#2d2d2a" }} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: "#F5D547" }}>선물 혜택 합계</span>
                <span className="text-base font-black" style={{ color: "#F5D547" }}>190,000원 무료</span>
              </div>
            </div>

            {/* 실질 혜택 총합 */}
            <div className="rounded-xl p-2.5 mb-4 text-center" style={{ background: "#F5D54712", border: "1px solid #F5D54760" }}>
              <p className="text-[10px]" style={{ color: "#9c9a92" }}>실질 혜택</p>
              <p className="text-xl font-black" style={{ color: "#F5D547" }}>총 330,000원</p>
            </div>

            {/* Urgency */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
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
                🎁 19만원 상당 선물 받기
              </button>
              <Link
                href="/programs/jiff"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm border transition-all text-white/80 hover:text-white"
                style={{ borderColor: "#2d2d2a" }}
              >
                <Film size={14} />
                상세 내용 보기
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
