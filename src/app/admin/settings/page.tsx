"use client";

import { useState, useEffect } from "react";
import { Settings, DollarSign, HelpCircle, Save, Loader2, Check } from "lucide-react";
import type { PricingData, BusRoutes } from "@/context/SettingsContext";

const TABS = [
  { id: "pricing", label: "가격 설정", icon: DollarSign },
  { id: "info", label: "운영 정보", icon: HelpCircle },
];

const PRICE_FIELDS: { key: keyof PricingData; label: string }[] = [
  { key: "stay", label: "숙박 기본가 (15인)" },
  { key: "half", label: "3시간 대여 기본가 (1타임)" },
  { key: "halfExtra", label: "3시간 대여 추가 타임" },
  { key: "daynight", label: "주/야간 패키지 (타임당)" },
  { key: "extraGuest", label: "추가인원 (1인)" },
  { key: "bbqGrill", label: "BBQ 그릴 (1개)" },
  { key: "gasRange", label: "가스버너 (1개)" },
  { key: "dinner", label: "저녁식사 (1인)" },
  { key: "woodcraft", label: "목공키트 (1개)" },
  { key: "potBbq", label: "항아리BBQ (1인분)" },
  { key: "miniPool", label: "미니수영장 (1대, 7~9월 한정)" },
];

const DEFAULT_PRICING: PricingData = {
  stay: 700000, half: 400000, halfExtra: 200000, daynight: 400000,
  extraGuest: 10000, bbqGrill: 30000, gasRange: 15000,
  dinner: 10000, woodcraft: 20000, potBbq: 30000,
  miniPool: 50000,
};

const DEFAULT_BUS_ROUTES: BusRoutes = {
  "전북대": 600000, "전주대": 650000, "원광대": 700000, "우석대": 650000,
};

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
  const [pricing, setPricing] = useState<PricingData>(DEFAULT_PRICING);
  const [busRoutes, setBusRoutes] = useState<BusRoutes>(DEFAULT_BUS_ROUTES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.pricing) setPricing(data.pricing);
        if (data.bus_routes) setBusRoutes(data.bus_routes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricing, bus_routes: busRoutes }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const updatePricing = (key: keyof PricingData, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
    setPricing((prev) => ({ ...prev, [key]: num }));
  };

  const updateBusRoute = (name: string, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
    setBusRoutes((prev) => ({ ...prev, [name]: num }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={24} /> 설정
        </h1>
        {tab === "pricing" && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "bg-primary text-white hover:bg-primary/90"
            } disabled:opacity-50`}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> 저장 중...</>
            ) : saved ? (
              <><Check size={16} /> 저장됨</>
            ) : (
              <><Save size={16} /> 저장</>
            )}
          </button>
        )}
      </div>

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
              {PRICE_FIELDS.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={pricing[item.key].toLocaleString()}
                      onChange={(e) => updatePricing(item.key, e.target.value)}
                      className="w-32 text-right text-sm font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <span className="text-sm text-gray-500">원</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">버스 렌트 가격</h3>
            <div className="space-y-0">
              {Object.entries(busRoutes).map(([name, price]) => (
                <div key={name} className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 font-medium">{name} (왕복)</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={price.toLocaleString()}
                      onChange={(e) => updateBusRoute(name, e.target.value)}
                      className="w-32 text-right text-sm font-bold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <span className="text-sm text-gray-500">원</span>
                  </div>
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
