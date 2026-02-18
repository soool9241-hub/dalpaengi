"use client";

import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image placeholder with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/95 via-primary/90 to-primary-light/85" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
        }}
      />
      {/* Additional decorative gradients */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <p className="text-white/60 text-sm tracking-[0.3em] uppercase mb-6">
            Healing Stay &middot; Pension
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            서로다른 우리의 이야기가
            <br />
            <span className="text-white/90">피어나는 공간</span>
          </h1>
          <p className="text-white/70 text-xl sm:text-2xl mb-2 font-semibold">
            달팽이 아지트 펜션
          </p>
          <p className="text-white/50 text-sm mb-10 max-w-md mx-auto leading-relaxed">
            강원도 평창의 자연 속에서 느리게, 깊이 쉬어가세요.
            <br />
            당신만의 힐링 프로그램이 준비되어 있습니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
          <a
            href="#programs"
            className="bg-white text-primary-dark px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            프로그램 둘러보기
          </a>
          <a
            href="#reservation"
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white/10 transition-all"
          >
            바로 예약하기
          </a>
        </div>

        {/* Availability Badge */}
        <div className="mt-14 animate-fade-in delay-400">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl sm:rounded-full px-5 sm:px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-white/90 text-sm">
                오늘 예약 가능 <strong>3실</strong>
              </span>
            </div>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="text-white/70 text-xs sm:text-sm">
              다음 예약 가능일 <strong>3월 25일</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-white/40" size={28} />
      </div>
    </section>
  );
}
