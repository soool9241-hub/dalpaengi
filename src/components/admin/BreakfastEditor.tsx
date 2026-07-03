"use client";

import { BREAKFAST_MENU_OPTIONS, breakfastTotal } from "@/types/admin";
import type { BreakfastItem } from "@/types/admin";

interface BreakfastEditorProps {
  items: BreakfastItem[];
  onChange: (items: BreakfastItem[]) => void;
}

// 조식을 메뉴별 수량으로 편집 (예: 김치찌개 10 + 육개장 10).
// 관리자 전용 — 육개장 20인 규칙은 하드 차단하지 않고 안내만 표시한다.
export function BreakfastEditor({ items, onChange }: BreakfastEditorProps) {
  const getCount = (menu: string) => items.find((i) => i.menu === menu)?.count ?? 0;

  const setCount = (menu: string, raw: number) => {
    const count = Math.max(0, raw || 0);
    const rest = items.filter((i) => i.menu !== menu);
    const next = count > 0 ? [...rest, { menu, count }] : rest;
    // 메뉴 순서를 옵션 정의 순서로 고정
    next.sort(
      (a, b) =>
        BREAKFAST_MENU_OPTIONS.findIndex((m) => m.name === a.menu) -
        BREAKFAST_MENU_OPTIONS.findIndex((m) => m.name === b.menu)
    );
    onChange(next);
  };

  const total = breakfastTotal(items);

  return (
    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">🍱 조식 (1인 10,000원)</p>
        <p className="text-[11px] font-semibold text-amber-800">
          총 {total}명 · {(total * 10000).toLocaleString()}원
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {BREAKFAST_MENU_OPTIONS.map((m) => (
          <div key={m.name} className="flex items-center gap-2 bg-white rounded-lg border border-amber-100 px-2 py-1.5">
            <span className="text-xs text-gray-700 flex-1 truncate">
              {m.name}
              {m.minPeople > 0 && <span className="text-[10px] text-gray-400"> ({m.minPeople}인↑)</span>}
            </span>
            <input
              type="number"
              min={0}
              value={getCount(m.name) || ""}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setCount(m.name, parseInt(e.target.value) || 0)}
              className="w-14 px-2 py-1 rounded-md border border-gray-200 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        ))}
      </div>
      {getCount("육개장") > 0 && total < 20 && (
        <p className="text-[10px] text-amber-700">※ 육개장은 보통 20인 이상 주문이에요. (관리자 예외 입력 허용)</p>
      )}
    </div>
  );
}
