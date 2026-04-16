"use client";

import { Film, Phone, MapPin, Check, Clock, Users, Star, ChevronRight, ArrowDown } from "lucide-react";
import Link from "next/link";

const JIFF_YELLOW = "#F5D547";
const JIFF_RED = "#E8593C";
const JIFF_GREEN = "#40916C";
const DARK_BG = "#0a0a0a";
const CARD_BG = "#151514";
const BORDER = "#2d2d2a";
const TEXT_SEC = "#9c9a92";

const benefits = [
  {
    emoji: "🔥",
    title: "바베큐 그릴 3개",
    desc: "세팅부터 숯까지 완비",
    value: "90,000원",
  },
  {
    emoji: "🥓",
    title: "숯불용 국내산 목살 5인분",
    desc: "도착 즉시 구워드실 수 있게 준비",
    value: "50,000원",
  },
  {
    emoji: "🍎",
    title: "웰컴 드링크",
    desc: "더스크 애플사이더 5병",
    value: "50,000원",
  },
];

const scenarios = [
  {
    icon: "💑",
    label: "커플 / 소그룹",
    sub: "2~5인",
    name: "시네마 나이트",
    timeline: [
      "19:00 영화 관람",
      "22:00 달팽이아지트 도착",
      "22:30 BBQ + 별 보기",
      "09:00 브런치",
      "11:00 체크아웃",
    ],
  },
  {
    icon: "🎬",
    label: "영화 스터디 / 단체",
    sub: "10~15인",
    name: "감상 토크",
    timeline: [
      "20:00 영화 관람",
      "23:00 달팽이아지트 복귀",
      "23:30 BBQ + 감상 토크",
      "08:00 아침 샌드위치",
      "11:00 체크아웃",
    ],
  },
  {
    icon: "📰",
    label: "영화인 · 언론",
    sub: "프레스",
    name: "작업 베이스캠프",
    timeline: [
      "낮 취재 / 상영",
      "저녁 독채에서 작업",
      "BBQ 네트워킹",
      "아침 취재 준비",
      "11:00 체크아웃",
    ],
  },
];

export default function JiffPage() {
  return (
    <div style={{ background: DARK_BG, color: "#fff" }} className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center px-5 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url(/img/outdoor-night.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0a0a0a]" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border mb-6" style={{ borderColor: BORDER, background: `${CARD_BG}` }}>
            <Film size={13} style={{ color: JIFF_YELLOW }} />
            <span className="text-[11px] font-bold tracking-widest" style={{ color: JIFF_YELLOW }}>
              제27회 전주국제영화제
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-3" style={{ color: JIFF_YELLOW }}>
            JIFF STAY
          </h1>
          <p className="text-lg sm:text-xl font-semibold text-white/90 mb-2">
            &ldquo;영화 다 보고 별 보러 오세요&rdquo;
          </p>
          <p className="text-sm mb-8" style={{ color: TEXT_SEC }}>
            2026. 4.29 WED — 5.8 FRI
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#reservation"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 shadow-lg"
              style={{ background: JIFF_YELLOW, color: DARK_BG }}
            >
              지금 예약하기
            </a>
            <a
              href="https://pf.kakao.com/_sxaExbxj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm border transition-all hover:bg-white/5"
              style={{ borderColor: BORDER, color: "#fff" }}
            >
              💬 카톡 상담
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown size={20} style={{ color: TEXT_SEC }} />
        </div>
      </section>

      {/* ── 상품 개요 ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] mb-3" style={{ color: JIFF_YELLOW }}>
            OVERVIEW
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
            🎬 JIFF STAY 상품 개요
          </h2>

          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER, background: CARD_BG }}>
            {[
              ["상품명", "🎬 JIFF STAY"],
              ["기간", "2026.4.29(수) ~ 5.8(금) · 10일 한정"],
              ["대상", "전주국제영화제 관람객"],
              ["할인율", "정상가 대비 20% OFF"],
              ["예약", "홈페이지 · 카톡 sool9241 · 010-8531-9531"],
            ].map(([label, value], i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-5 py-4"
                style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : "none" }}
              >
                <span className="text-xs font-bold flex-shrink-0 w-16" style={{ color: JIFF_YELLOW }}>
                  {label}
                </span>
                <span className="text-sm text-white/80">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 가격 ──────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5" style={{ background: CARD_BG }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] mb-3" style={{ color: JIFF_YELLOW }}>
            PRICING
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mb-10">특가 가격</h2>

          <div className="rounded-2xl border p-6 sm:p-8 mb-6" style={{ borderColor: BORDER, background: DARK_BG }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4">
              <div>
                <p className="text-xs mb-1" style={{ color: TEXT_SEC }}>정상가</p>
                <p className="text-2xl font-bold line-through text-white/40">700,000원</p>
              </div>
              <span className="text-2xl" style={{ color: JIFF_YELLOW }}>→</span>
              <div>
                <p className="text-xs mb-1" style={{ color: JIFF_YELLOW }}>JIFF 특가</p>
                <p className="text-4xl sm:text-5xl font-black" style={{ color: JIFF_YELLOW }}>560,000원</p>
              </div>
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: `${JIFF_RED}20`, color: JIFF_RED }}>
              20% OFF · 14만원 할인
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs" style={{ color: TEXT_SEC }}>
              <span>기본 15인</span>
              <span>·</span>
              <span>인당 37,000원</span>
              <span>·</span>
              <span>추가 인원 8,000원/인 <span className="line-through text-white/30">(정상가 10,000원)</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 현물 혜택 ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] mb-3" style={{ color: JIFF_YELLOW }}>
            COMPLIMENTARY
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-3">현물 혜택</h2>
          <p className="text-center text-sm mb-10" style={{ color: TEXT_SEC }}>
            예약 시 무료로 제공됩니다
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 text-center"
                style={{ borderColor: BORDER, background: CARD_BG }}
              >
                <span className="text-4xl block mb-3">{b.emoji}</span>
                <h3 className="text-sm font-bold text-white mb-1">{b.title}</h3>
                <p className="text-[11px] mb-3" style={{ color: TEXT_SEC }}>{b.desc}</p>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${JIFF_YELLOW}15`, color: JIFF_YELLOW }}>
                  {b.value}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-5 text-center" style={{ borderColor: JIFF_YELLOW + "40", background: `${JIFF_YELLOW}08` }}>
            <p className="text-sm mb-1" style={{ color: TEXT_SEC }}>현물 혜택 총합</p>
            <p className="text-3xl sm:text-4xl font-black" style={{ color: JIFF_YELLOW }}>190,000원 무료</p>
          </div>
        </div>
      </section>

      {/* ── 추가 옵션 ─────────────────────────────────────────────── */}
      <section className="py-16 px-5" style={{ background: CARD_BG }}>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4" style={{ borderColor: BORDER, background: DARK_BG }}>
            <span className="text-3xl">🥪</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white mb-1">조식 패키지 <span className="text-[10px] font-normal" style={{ color: TEXT_SEC }}>(선택)</span></h3>
              <p className="text-[11px] mb-2" style={{ color: TEXT_SEC }}>
                건강 샌드위치 + 씨리얼 + 커피 + 우유
              </p>
              <p className="text-[11px]" style={{ color: TEXT_SEC }}>전날 저녁 냉장고에 사전 세팅</p>
            </div>
            <span className="text-sm font-bold" style={{ color: JIFF_YELLOW }}>1인 10,000원</span>
          </div>
        </div>
      </section>

      {/* ── 혜택 요약 ─────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-lg mx-auto">
          <div
            className="rounded-2xl p-6 sm:p-8 text-center"
            style={{ border: `2px solid ${JIFF_YELLOW}40`, background: `${JIFF_YELLOW}05` }}
          >
            <p className="text-[10px] font-bold tracking-[0.3em] mb-5" style={{ color: JIFF_YELLOW }}>
              TOTAL BENEFIT
            </p>
            <div className="space-y-2 text-sm mb-4">
              <p>
                <span className="text-white/50">정상가 70만원 →</span>{" "}
                <span className="font-bold" style={{ color: JIFF_YELLOW }}>JIFF 특가 56만원</span>{" "}
                <span style={{ color: JIFF_RED }}>(14만원 할인)</span>
              </p>
              <p>
                <span className="text-white/50">+</span>{" "}
                <span className="font-bold text-white">현물 19만원 무료</span>
              </p>
            </div>
            <div className="h-px my-5" style={{ background: BORDER }} />
            <p className="text-xs mb-2" style={{ color: TEXT_SEC }}>실질 혜택</p>
            <p className="text-4xl sm:text-5xl font-black mb-3" style={{ color: JIFF_YELLOW }}>33만원</p>
            <p className="text-xs" style={{ color: TEXT_SEC }}>
              실질 숙박비 = 37만원 (15인 기준 인당 2.5만원)
            </p>
          </div>
        </div>
      </section>

      {/* ── 접근성 ────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5" style={{ background: CARD_BG }}>
        <div className="max-w-md mx-auto text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] mb-3" style={{ color: JIFF_YELLOW }}>
            ACCESS
          </p>
          <h2 className="text-2xl sm:text-3xl font-black mb-10">오시는 길</h2>

          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ borderColor: BORDER, background: DARK_BG }}>
              <span className="text-3xl block mb-2">🎬</span>
              <p className="font-bold text-white text-sm">영화의거리</p>
              <p className="text-[11px]" style={{ color: TEXT_SEC }}>전주국제영화제 메인 상영관</p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-8 w-px" style={{ background: JIFF_YELLOW }} />
              <span className="text-xs font-bold" style={{ color: JIFF_YELLOW }}>차로 12분</span>
              <div className="h-8 w-px" style={{ background: JIFF_YELLOW }} />
            </div>

            <div className="rounded-2xl border p-5" style={{ borderColor: JIFF_YELLOW + "40", background: `${JIFF_YELLOW}08` }}>
              <span className="text-3xl block mb-2">🐌</span>
              <p className="font-bold text-sm" style={{ color: JIFF_YELLOW }}>달팽이아지트</p>
              <p className="text-[11px]" style={{ color: TEXT_SEC }}>60평 독채 · 하루 1팀</p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-8 w-px" style={{ background: BORDER }} />
              <span className="text-xs" style={{ color: TEXT_SEC }}>도착 즉시</span>
              <div className="h-8 w-px" style={{ background: BORDER }} />
            </div>

            <div className="rounded-2xl border p-5" style={{ borderColor: BORDER, background: DARK_BG }}>
              <div className="flex items-center justify-center gap-3 text-2xl mb-2">
                <span>🔥</span><span>🍎</span><span>🥩</span>
              </div>
              <p className="font-bold text-white text-sm">BBQ 세팅 완료 + 애플사이더 + 목살</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 시나리오 ──────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.3em] mb-3" style={{ color: JIFF_YELLOW }}>
            SCENARIO
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">이런 분들에게 추천</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {scenarios.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5"
                style={{ borderColor: BORDER, background: CARD_BG }}
              >
                <div className="text-center mb-4">
                  <span className="text-3xl block mb-2">{s.icon}</span>
                  <p className="text-sm font-bold text-white">{s.label}</p>
                  <p className="text-[10px]" style={{ color: TEXT_SEC }}>{s.sub}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: JIFF_YELLOW }}>&ldquo;{s.name}&rdquo;</p>
                </div>
                <div className="space-y-2">
                  {s.timeline.map((t, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="flex flex-col items-center flex-shrink-0 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: JIFF_YELLOW }} />
                        {j < s.timeline.length - 1 && <div className="w-px h-4" style={{ background: BORDER }} />}
                      </div>
                      <span className="text-[11px] text-white/70">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주의사항 ──────────────────────────────────────────────── */}
      <section className="py-16 px-5" style={{ background: CARD_BG }}>
        <div className="max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-white/60 mb-4 text-center">📌 주의사항</h3>
          <ul className="space-y-2">
            {[
              "하루 1팀 독채 운영",
              "선착순 마감 (10일 한정)",
              "수건 개별 지참",
              "퇴실 시 자차 필수 (택시 불가 지역)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: TEXT_SEC }}>
                <span className="mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA (하단 고정) ───────────────────────────────────────── */}
      <section id="reservation" className="py-20 sm:py-28 px-5">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: JIFF_RED }} />
            <span className="text-[11px] font-bold" style={{ color: JIFF_RED }}>
              10일 한정 · 하루 1팀 선착순
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-8" style={{ color: JIFF_YELLOW }}>
            지금 예약하세요
          </h2>
          <div className="flex flex-col gap-3">
            <a
              href="tel:010-8531-9531"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-base transition-all hover:brightness-110 shadow-lg"
              style={{ background: JIFF_YELLOW, color: DARK_BG }}
            >
              <Phone size={18} />
              전화 예약 010-8531-9531
            </a>
            <a
              href="https://pf.kakao.com/_sxaExbxj"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-base border transition-all hover:bg-white/5"
              style={{ borderColor: BORDER, color: "#fff" }}
            >
              💬 카톡 상담 sool9241
            </a>
          </div>
        </div>
      </section>

      {/* ── Sticky bottom CTA (mobile) ────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden p-3" style={{ background: `${DARK_BG}ee`, backdropFilter: "blur(12px)" }}>
        <div className="flex gap-2">
          <a
            href="tel:010-8531-9531"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-sm"
            style={{ background: JIFF_YELLOW, color: DARK_BG }}
          >
            <Phone size={14} />
            전화 예약
          </a>
          <a
            href="https://pf.kakao.com/_sxaExbxj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold text-sm border"
            style={{ borderColor: BORDER, color: "#fff" }}
          >
            💬 카톡 상담
          </a>
        </div>
      </div>

      {/* Bottom spacer for sticky CTA */}
      <div className="h-20 sm:h-0" style={{ background: DARK_BG }} />
    </div>
  );
}
