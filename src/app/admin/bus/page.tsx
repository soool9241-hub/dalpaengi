"use client";

import { useState, useEffect, useCallback } from "react";
import { Bus, Phone, MapPin, Clock, Users, Search, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";

const BUS_ROUTES: Record<string, number> = {
  "전북대": 500000, "전주대": 450000, "원광대": 550000, "우석대": 500000,
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "대기", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "확정", color: "bg-blue-100 text-blue-800" },
  completed: { label: "완료", color: "bg-green-100 text-green-800" },
  cancelled: { label: "취소", color: "bg-gray-100 text-gray-500" },
};

const TIME_OPTIONS_PICKUP = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});
const TIME_OPTIONS_DROPOFF = ["06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30"];

function formatPhone(phone: string): string {
  const d = phone.replace(/[^0-9]/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone;
}

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만원";
  return n.toLocaleString() + "원";
}

interface BusRow {
  id: number;
  reservation_id: number;
  manager_name: string;
  manager_phone: string;
  pickup_place: string;
  pickup_people: string;
  pickup_time: string;
  dropoff_place: string;
  dropoff_people: string;
  dropoff_time: string;
  driver_name: string;
  driver_phone: string;
  bus_number: string;
  status: string;
  created_at: string;
  reservations: {
    id: number;
    guest_name: string;
    guest_phone: string;
    reservation_date: string;
    checkout_date: string;
    stay_nights: number;
    guest_count: number;
    extra_guests: number;
    program_type: string;
    status: string;
    notes: string | null;
  };
}

export default function BusManagementPage() {
  const [busList, setBusList] = useState<BusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<BusRow>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/bus?${params}`);
      if (res.status === 401) { window.location.href = "/admin-login"; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setBusList(json.data || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const startEdit = (bus: BusRow) => {
    setEditingId(bus.id);
    setEditForm({
      manager_name: bus.manager_name,
      manager_phone: bus.manager_phone,
      pickup_place: bus.pickup_place,
      pickup_people: bus.pickup_people,
      pickup_time: bus.pickup_time,
      dropoff_place: bus.dropoff_place,
      dropoff_people: bus.dropoff_people,
      dropoff_time: bus.dropoff_time,
      driver_name: bus.driver_name,
      driver_phone: bus.driver_phone,
      bus_number: bus.bus_number,
      status: bus.status,
    });
    setExpandedId(bus.id);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) {
        const json = await res.json();
        setToast({ type: "error", msg: json.error || "저장 실패" });
      } else {
        setToast({ type: "success", msg: "버스 정보가 저장되었습니다." });
        setEditingId(null);
        fetchData();
      }
    } catch {
      setToast({ type: "error", msg: "저장 중 오류 발생" });
    } finally {
      setSaving(false);
    }
  };

  const deleteBus = async (bus: BusRow) => {
    if (!confirm(`${bus.reservations.guest_name}님의 버스 예약을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch("/api/admin/bus", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bus.id, reservation_id: bus.reservation_id }),
      });
      if (res.ok) {
        setToast({ type: "success", msg: "버스 예약이 삭제되었습니다." });
        fetchData();
      }
    } catch {
      setToast({ type: "error", msg: "삭제 중 오류 발생" });
    }
  };

  const updateStatus = async (busId: number, newStatus: string) => {
    try {
      await fetch("/api/admin/bus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: busId, status: newStatus }),
      });
      fetchData();
    } catch { /* ignore */ }
  };

  const getBusCost = (bus: BusRow) => {
    const place = bus.pickup_place;
    if (!BUS_ROUTES[place]) return 0;
    const isRoundtrip = !!(bus.dropoff_time || bus.dropoff_people);
    return isRoundtrip ? BUS_ROUTES[place] : Math.round(BUS_ROUTES[place] * 0.6);
  };

  const isRoundtrip = (bus: BusRow) => !!(bus.dropoff_time || bus.dropoff_people);

  if (loading && busList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  const stats = {
    total: busList.length,
    pending: busList.filter(b => b.status === "pending").length,
    confirmed: busList.filter(b => b.status === "confirmed").length,
    completed: busList.filter(b => b.status === "completed").length,
    totalCost: busList.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + getBusCost(b), 0),
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <Bus size={24} className="text-primary" /> 버스 예약 관리
          </h1>
          <p className="text-sm text-gray-500 mt-1">총 {stats.total}건 · 대기 {stats.pending} · 확정 {stats.confirmed} · 완료 {stats.completed} · 예상 매출 {formatPrice(stats.totalCost)}</p>
        </div>
      </div>

      {/* 필터 + 검색 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
          {[
            { value: "all", label: "전체" },
            { value: "pending", label: "대기" },
            { value: "confirmed", label: "확정" },
            { value: "completed", label: "완료" },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${filter === f.value ? "bg-white text-primary shadow-sm" : "text-gray-500"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="예약자 이름 또는 연락처 검색..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none" />
        </div>
      </div>

      {/* 버스 목록 */}
      {busList.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bus size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">버스 예약이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {busList.map(bus => {
            const r = bus.reservations;
            const cost = getBusCost(bus);
            const roundtrip = isRoundtrip(bus);
            const expanded = expandedId === bus.id;
            const editing = editingId === bus.id;
            const st = STATUS_MAP[bus.status] || STATUS_MAP.pending;

            return (
              <div key={bus.id} className={`bg-white border rounded-xl overflow-hidden transition-all ${editing ? "border-primary border-2 shadow-md" : "border-gray-200 hover:border-gray-300"}`}>
                {/* 헤더 */}
                <div className="p-3 sm:p-4 cursor-pointer" onClick={() => !editing && setExpandedId(expanded ? null : bus.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex bg-gray-100 rounded-full p-0.5 gap-0.5" onClick={e => e.stopPropagation()}>
                          {(["pending", "confirmed", "completed"] as const).map(s => {
                            const info = STATUS_MAP[s];
                            const active = bus.status === s;
                            return (
                              <button key={s} onClick={() => !active && updateStatus(bus.id, s)}
                                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${active ? info.color + " shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                                {info.label}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-900">{r.guest_name}</span>
                        <span className="text-xs text-gray-400">{r.reservation_date} ({r.stay_nights}박)</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-purple-400" />
                          {bus.pickup_place} {roundtrip ? "왕복" : "편도"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-blue-400" />
                          승차 {bus.pickup_time || "-"}{roundtrip ? ` / 하차 ${bus.dropoff_time || "-"}` : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-green-400" />
                          {bus.pickup_people || "-"}명
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-sm sm:text-base font-black text-primary">{cost > 0 ? formatPrice(cost) : "-"}</p>
                      {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* 상세 (펼쳐진 상태) */}
                {expanded && !editing && (
                  <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-gray-400 font-bold mb-0.5">담당자</p>
                        <p className="text-gray-800 font-semibold">{bus.manager_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold mb-0.5">담당자 연락처</p>
                        <p className="text-gray-800 font-semibold">
                          {bus.manager_phone ? <a href={`tel:${bus.manager_phone}`} className="hover:text-primary">{formatPhone(bus.manager_phone)}</a> : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold mb-0.5">고객 연락처</p>
                        <p className="text-gray-800 font-semibold">
                          <a href={`tel:${r.guest_phone}`} className="hover:text-primary flex items-center gap-1">
                            <Phone size={11} /> {formatPhone(r.guest_phone)}
                          </a>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold mb-0.5">예약 상태</p>
                        <p className="text-gray-800 font-semibold">{r.status === "upcoming" ? "방문예정" : r.status === "confirmed" ? "예약확정" : r.status}</p>
                      </div>
                    </div>

                    {/* 버스 기사 정보 */}
                    {(bus.driver_name || bus.driver_phone || bus.bus_number) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                        <p className="text-[10px] font-bold text-amber-700 mb-1.5">🚍 버스 기사 정보</p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div><span className="text-gray-400">기사명</span><p className="font-semibold text-gray-800">{bus.driver_name || "-"}</p></div>
                          <div><span className="text-gray-400">기사 연락처</span><p className="font-semibold text-gray-800">
                            {bus.driver_phone ? <a href={`tel:${bus.driver_phone}`} className="hover:text-primary">{formatPhone(bus.driver_phone)}</a> : "-"}
                          </p></div>
                          <div><span className="text-gray-400">차량 번호</span><p className="font-semibold text-gray-800">{bus.bus_number || "-"}</p></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                        <p className="text-[10px] font-bold text-purple-600 mb-1.5">🚌 승차 정보</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><span className="text-gray-400">출발지</span><p className="font-semibold">{bus.pickup_place}</p></div>
                          <div><span className="text-gray-400">인원</span><p className="font-semibold">{bus.pickup_people}명</p></div>
                          <div><span className="text-gray-400">시간</span><p className="font-semibold">{bus.pickup_time || "-"}</p></div>
                        </div>
                      </div>
                      {roundtrip && (
                        <div className="bg-white rounded-lg p-2.5 border border-gray-200">
                          <p className="text-[10px] font-bold text-blue-600 mb-1.5">🚌 하차 정보</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><span className="text-gray-400">도착지</span><p className="font-semibold">{bus.dropoff_place}</p></div>
                            <div><span className="text-gray-400">인원</span><p className="font-semibold">{bus.dropoff_people}명</p></div>
                            <div><span className="text-gray-400">시간</span><p className="font-semibold">{bus.dropoff_time || "-"}</p></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {cost > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5">
                        <p className="text-xs text-gray-600">
                          {bus.pickup_place} {roundtrip ? "왕복" : "편도"} 견적: <span className="font-black text-primary text-sm">{cost.toLocaleString()}원</span>
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => startEdit(bus)}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light">수정</button>
                      <button onClick={() => deleteBus(bus)}
                        className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-bold rounded-lg hover:bg-red-100 flex items-center gap-1">
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  </div>
                )}

                {/* 수정 모드 */}
                {editing && (
                  <div className="border-t border-primary/20 p-3 sm:p-4 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-primary">수정 모드 - {r.guest_name}</p>
                      <div className="flex gap-1.5">
                        <button onClick={saveEdit} disabled={saving}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light disabled:opacity-50">
                          {saving ? <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" /> : <Save size={12} />}
                          저장
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200">취소</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold">상태</label>
                        <select value={editForm.status || "pending"}
                          onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm bg-white">
                          <option value="pending">대기</option>
                          <option value="confirmed">확정</option>
                          <option value="completed">완료</option>
                          <option value="cancelled">취소</option>
                        </select>
                      </div>
                      <div />
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold">담당자 이름</label>
                        <input value={editForm.manager_name || ""} onChange={e => setEditForm({ ...editForm, manager_name: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 font-bold">담당자 연락처</label>
                        <input value={editForm.manager_phone || ""} onChange={e => setEditForm({ ...editForm, manager_phone: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm" />
                      </div>
                    </div>

                    {/* 버스 기사 정보 */}
                    <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200 space-y-2">
                      <p className="text-[10px] font-bold text-amber-700">🚍 버스 기사 정보</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500">기사명</label>
                          <input value={editForm.driver_name || ""} onChange={e => setEditForm({ ...editForm, driver_name: e.target.value })}
                            placeholder="기사 이름" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">기사 연락처</label>
                          <input value={editForm.driver_phone || ""} onChange={e => setEditForm({ ...editForm, driver_phone: e.target.value })}
                            placeholder="010-0000-0000" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500">차량 번호</label>
                          <input value={editForm.bus_number || ""} onChange={e => setEditForm({ ...editForm, bus_number: e.target.value })}
                            placeholder="12가 3456" className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-gray-200 space-y-2">
                      <p className="text-[10px] font-bold text-purple-600">🚌 승차 정보</p>
                      <div className="grid grid-cols-3 gap-2">
                        <select value={editForm.pickup_place || ""}
                          onChange={e => setEditForm({ ...editForm, pickup_place: e.target.value, dropoff_place: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                          <option value="">출발지</option>
                          {Object.entries(BUS_ROUTES).map(([name, price]) => (
                            <option key={name} value={name}>{name} ({(price / 10000).toFixed(0)}만)</option>
                          ))}
                          <option value="기타">기타</option>
                        </select>
                        <input placeholder="인원" value={editForm.pickup_people || ""}
                          onChange={e => setEditForm({ ...editForm, pickup_people: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                        <select value={editForm.pickup_time || ""}
                          onChange={e => setEditForm({ ...editForm, pickup_time: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                          <option value="">시간</option>
                          {TIME_OPTIONS_PICKUP.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2.5 border border-gray-200 space-y-2">
                      <p className="text-[10px] font-bold text-blue-600">🚌 하차 정보</p>
                      <div className="grid grid-cols-3 gap-2">
                        <input value={editForm.dropoff_place || ""} readOnly
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-gray-50 text-gray-500" />
                        <input placeholder="인원" value={editForm.dropoff_people || ""}
                          onChange={e => setEditForm({ ...editForm, dropoff_people: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" />
                        <select value={editForm.dropoff_time || ""}
                          onChange={e => setEditForm({ ...editForm, dropoff_time: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                          <option value="">시간</option>
                          {TIME_OPTIONS_DROPOFF.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-bold z-50 ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
