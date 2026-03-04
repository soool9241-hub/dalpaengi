"use client";

import { useState } from "react";
import { Settings, DollarSign, HelpCircle } from "lucide-react";
import { PRICING } from "@/types/admin";

const TABS = [
  { id: "pricing", label: "가격 설정", icon: DollarSign },
  { id: "info", label: "운영 정보", icon: HelpCircle },
];

const PRICE_ITEMS = [
  { key: "stay", label: "숙박 기본가 (15인)", value: PRICING.stay.base },
  { key: "half", label: "3시간 대여 기본가", value: PRICING.half.base },
  { key: "daynight", label: "주/야간 패키지 기본가", value: PRICING.daynight.base },
  { key: "extraGuest", label: "추가인원 (1인)", value: PRICING.extraGuest },
  { key: "bbqGrill", label: "BBQ 그릴 (1개)", value: PRICING.bbqGrill },
  { key: "gasRange", label: "가스렌지 (1개)", value: PRICING.gasRange },
  { key: "dinner", label: "저녁식사 (1인)", value: PRICING.dinner },
  { key: "woodcraft", label: "목공키트 (1개)", value: PRICING.woodcraft },
  { key: "potBbq", label: "항아리BBQ (1인분)", value: PRICING.potBbq },
];

const BUS_ROUTES = [
  { name: "전북대", price: 500000 },
  { name: "전주대", price: 450000 },
  { name: "원광대", price: 550000 },
  { name: "우석대", price: 500000 },
];

const OPERATION_INFO = [
  { label: "체크인", value: "오후 3:00" },
  { label: "체크아웃", value: "오전 11:00" },
  { label: "기본 인원", value: "15명" },
  { label: "최대 인원", value: "60명" },
  { label: "입금 계좌", value: "카카오뱅크 3333-06-4749542 임솔" },
  { label: "연락처", value: "010-8531-9531" },
  { label: "주소", value: "전북 완주군 소양면 해월신왕길 92" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("pricing");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Settings size={24} /> 설정
      </h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? "bg-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Pricing Tab */}
      {tab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">프로그램 & 옵션 가격</h3>
            <div className="space-y-0">
              {PRICE_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}원</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-4">
              * 가격 변경은 코드에서 직접 수정 필요 (types/admin.ts)
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">버스 렌트 가격</h3>
            <div className="space-y-0">
              {BUS_ROUTES.map((route) => (
                <div key={route.name} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 font-medium">{route.name} (왕복)</span>
                  <span className="text-sm font-bold text-gray-900">{route.price.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Tab */}
      {tab === "info" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4">운영 정보</h3>
          <div className="space-y-0">
            {OPERATION_INFO.map((info) => (
              <div key={info.label} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-500 font-semibold">{info.label}</span>
                <span className="text-sm text-gray-900 font-medium">{info.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-bold text-gray-900 mb-3">SMS 알림 수신 번호</h4>
            <div className="space-y-1.5 text-sm text-gray-700">
              <p className="font-medium">010-8531-9531 (대표)</p>
              <p>010-5314-0146</p>
              <p>010-4696-8497</p>
              <p>010-4696-5529</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-xl">
            <h4 className="text-sm font-bold text-amber-900 mb-2">환불 규정</h4>
            <p className="text-sm text-amber-800 font-medium">예약일 2주 전 취소 시 100% 환불 / 이후 환불 불가</p>
          </div>
        </div>
      )}
    </div>
  );
}
