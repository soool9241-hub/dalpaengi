"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, CalendarDays, Pencil, Save, Loader2, MessageSquare, Bus } from "lucide-react";
import { ReservationRow, PROGRAM_LABELS, STATUS_LABELS } from "@/types/admin";

interface BusRequest {
  id?: number;
  reservation_id: number;
  manager_name: string;
  manager_phone: string;
  pickup_place: string;
  pickup_people: string;
  pickup_time: string;
  pickup_detail?: string;
  dropoff_place: string;
  dropoff_people: string;
  dropoff_time: string;
  dropoff_detail?: string;
  stopover_text?: string;
}

interface BusFormData {
  managerName: string;
  managerPhone: string;
  pickupPlace: string;
  customPickup: string;
  pickupPeople: string;
  pickupTime: string;
  dropoffPlace: string;
  customDropoff: string;
  dropoffPeople: string;
  dropoffTime: string;
}

const EMPTY_BUS_FORM: BusFormData = {
  managerName: "",
  managerPhone: "",
  pickupPlace: "",
  customPickup: "",
  pickupPeople: "",
  pickupTime: "",
  dropoffPlace: "",
  customDropoff: "",
  dropoffPeople: "",
  dropoffTime: "",
};

const BUS_ROUTES: Record<string, number> = {
  "전북대": 600000,
  "전주대": 650000,
  "원광대": 700000,
  "우석대": 650000,
};

// 25인승 (50km 이내) = 1대당 정액 40만원 (왕복)
const SEATER_25_PRICE = 400000;
const is25Seater = (b: { pickup_detail?: string; dropoff_detail?: string }) =>
  /25\s*인승/.test(b.pickup_detail || "") || /25\s*인승/.test(b.dropoff_detail || "");

function calcBusCost(b: { pickup_detail?: string; dropoff_detail?: string; pickup_place?: string; dropoff_time?: string; dropoff_people?: string }): number {
  const isRoundtrip = !!(b.dropoff_time || b.dropoff_people);
  if (is25Seater(b)) {
    return isRoundtrip ? SEATER_25_PRICE : Math.round(SEATER_25_PRICE * 0.6);
  }
  const place = b.pickup_place || "";
  if (!BUS_ROUTES[place]) return 0;
  return isRoundtrip ? BUS_ROUTES[place] : Math.round(BUS_ROUTES[place] * 0.6);
}

const TIME_OPTIONS_PICKUP = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

const TIME_OPTIONS_DROPOFF = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30",
];

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "confirmed", label: "예약확정" },
  { value: "upcoming", label: "방문예정" },
  { value: "visited", label: "방문완료" },
  { value: "reviewed", label: "후기남김" },
  { value: "cancelled", label: "예약취소" },
];

const PROGRAM_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "stay", label: "숙박" },
  { value: "half", label: "3시간" },
  { value: "daynight", label: "주/야간" },
];

const PROGRAM_TYPE_OPTIONS = [
  { value: "stay", label: "숙박" },
  { value: "half", label: "3시간 대여" },
  { value: "daynight", label: "주/야간 패키지" },
];

const PURPOSE_OPTIONS = [
  "가족모임",
  "친구/지인 모임",
  "회사 워크숍/MT",
  "동호회/소모임",
  "커플/데이트",
  "생일/기념일",
  "워케이션/작업",
  "기타",
];

const BREAKFAST_MENUS: { name: string; minPeople: number }[] = [
  { name: "육개장", minPeople: 20 },
  { name: "김치찌개", minPeople: 0 },
  { name: "보리밥 비빔밥", minPeople: 0 },
  { name: "샌드위치", minPeople: 0 },
];

const REFERRAL_OPTIONS = [
  "네이버 검색",
  "인스타그램",
  "지인 추천",
  "에어비앤비",
  "블로그",
  "재방문",
  "기타",
];

// 미니수영장은 7~9월에만 노출 (월: 7,8,9)
function isPoolSeason(dateStr?: string | null): boolean {
  if (!dateStr) return true;
  const m = parseInt(dateStr.slice(5, 7), 10);
  return [7, 8, 9].includes(m);
}

// 시간제 프로그램 여부 (시간대 입력 노출용)
const isTimedProgram = (t?: string) => t === "half" || t === "daynight";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  upcoming: "bg-cyan-100 text-cyan-800",
  visited: "bg-blue-100 text-blue-800",
  reviewed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-700",
};

function formatOptions(r: ReservationRow): string {
  const opts: string[] = [];
  if (r.dinner_count > 0) opts.push(`석식${r.dinner_count}`);
  if ((r.breakfast_count || 0) > 0) opts.push(`조식${r.breakfast_count}${r.breakfast_menu ? `·${r.breakfast_menu}` : ""}`);
  if ((r.pool_count || 0) > 0) opts.push(`풀${r.pool_count}`);
  if (r.woodcraft_count > 0) opts.push(`목공${r.woodcraft_count}`);
  if (r.pot_bbq_count > 0) opts.push(`항아리${r.pot_bbq_count}`);
  if (r.bus_requested) opts.push("버스");
  return opts.length > 0 ? opts.join(", ") : "-";
}

export default function ReservationsPage() {
  const [data, setData] = useState<ReservationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("upcoming");
  const [program, setProgram] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detail, setDetail] = useState<ReservationRow | null>(null);
  const [editData, setEditData] = useState<Partial<ReservationRow>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "cancel" | "delete"; id: number; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [busForm, setBusForm] = useState<BusFormData>(EMPTY_BUS_FORM);
  const [busLoading, setBusLoading] = useState(false);
  const [busToggle, setBusToggle] = useState(false);
  const [busList, setBusList] = useState<BusRequest[]>([]);
  const [editingBusId, setEditingBusId] = useState<number | null>(null);
  const [busEditData, setBusEditData] = useState<Partial<BusRequest>>({});
  const [busSaving, setBusSaving] = useState(false);
  const pageSize = 20;

  const refreshBusList = async (reservationId: number): Promise<BusRequest[]> => {
    try {
      const res = await fetch(`/api/admin/reservations?bus_reservation_id=${reservationId}`);
      const json = await res.json();
      const list: BusRequest[] = json.bus_requests || (json.bus_request ? [json.bus_request] : []);
      setBusList(list);
      return list;
    } catch {
      return [];
    }
  };

  // 버스 변경 후 reservations.bus_fee + total_amount 자동 보정
  const reconcileBusFee = async (reservationId: number, newList: BusRequest[]) => {
    if (!detail || detail.id !== reservationId) return;
    const newBusFee = newList.reduce((sum, b) => sum + calcBusCost(b), 0);
    const oldBusFee = detail.bus_fee || 0;
    if (newBusFee === oldBusFee) return;
    const oldTotal = detail.total_amount || 0;
    const newTotal = oldTotal - oldBusFee + newBusFee;
    try {
      await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservationId, bus_fee: newBusFee, total_amount: newTotal }),
      });
      setDetail((prev) => prev ? { ...prev, bus_fee: newBusFee, total_amount: newTotal } : prev);
      fetchData();
    } catch { /* ignore */ }
  };

  const startEditBus = (bus: BusRequest) => {
    setEditingBusId(bus.id ?? null);
    setBusEditData({
      manager_name: bus.manager_name,
      manager_phone: bus.manager_phone,
      pickup_place: bus.pickup_place,
      pickup_people: bus.pickup_people,
      pickup_time: bus.pickup_time,
      pickup_detail: bus.pickup_detail || "",
      dropoff_place: bus.dropoff_place,
      dropoff_people: bus.dropoff_people,
      dropoff_time: bus.dropoff_time,
      dropoff_detail: bus.dropoff_detail || "",
    });
  };

  const saveBusEdit = async () => {
    if (!editingBusId || !detail) return;
    setBusSaving(true);
    try {
      const res = await fetch("/api/admin/bus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBusId, ...busEditData }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert("저장 실패: " + (j.error || "unknown"));
      } else {
        setEditingBusId(null);
        setBusEditData({});
        const list = await refreshBusList(detail.id);
        await reconcileBusFee(detail.id, list);
      }
    } catch (e) {
      alert("저장 중 오류: " + String(e));
    }
    setBusSaving(false);
  };

  const deleteBusEntry = async (busId: number) => {
    if (!detail) return;
    if (!window.confirm("이 버스 정보를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch("/api/admin/bus", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: busId, reservation_id: detail.id }),
      });
      if (res.ok) {
        const list = await refreshBusList(detail.id);
        await reconcileBusFee(detail.id, list);
      } else {
        alert("삭제 실패");
      }
    } catch (e) {
      alert("삭제 중 오류: " + String(e));
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const sortOrder = (status === "upcoming" || status === "confirmed") ? "asc" : "desc";
    const params = new URLSearchParams({ status, program, page: page.toString(), sort: "reservation_date", order: sortOrder });
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/admin/reservations?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  }, [status, program, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 모달 열려있을 때 윈도우 포커스 시 버스 목록 자동 새로고침 (버스관리 탭과 동기화)
  useEffect(() => {
    if (!detail || !detail.bus_requested) return;
    const onFocus = () => refreshBusList(detail.id);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id, detail?.bus_requested]);

  const openDetail = async (r: ReservationRow) => {
    setDetail(r);
    // guest_count를 총인원으로 사용 (extra_guests는 항상 0)
    setEditData({
      guest_name: r.guest_name,
      guest_phone: r.guest_phone,
      reservation_date: r.reservation_date,
      checkout_date: r.checkout_date,
      program_type: r.program_type,
      guest_count: r.guest_count || 0,
      extra_guests: 0,
      bbq_count: r.bbq_count,
      burner_count: r.burner_count,
      dinner_count: r.dinner_count,
      breakfast_count: r.breakfast_count ?? 0,
      breakfast_menu: r.breakfast_menu ?? "",
      pool_count: r.pool_count ?? 0,
      woodcraft_count: r.woodcraft_count,
      pot_bbq_count: r.pot_bbq_count,
      bus_requested: r.bus_requested,
      stay_nights: r.stay_nights,
      time_slot: r.time_slot,
      purpose: r.purpose,
      purpose_raw: r.purpose_raw,
      referral_source: r.referral_source,
      notes: r.notes,
      status: r.status,
    });
    setBusForm(EMPTY_BUS_FORM);
    setBusToggle(r.bus_requested);
    setBusList([]);
    setIsEditing(false);

    // 버스 요청 데이터 fetch (다중 지원)
    if (r.bus_requested) {
      setBusLoading(true);
      try {
        const res = await fetch(`/api/admin/reservations?bus_reservation_id=${r.id}`);
        const json = await res.json();
        const list: BusRequest[] = json.bus_requests || (json.bus_request ? [json.bus_request] : []);
        setBusList(list);
        if (list.length > 0) {
          const b = list[0];
          const knownRoutes = Object.keys(BUS_ROUTES);
          const isCustomPickup = b.pickup_place && !knownRoutes.includes(b.pickup_place);
          setBusForm({
            managerName: b.manager_name || "",
            managerPhone: b.manager_phone || "",
            pickupPlace: isCustomPickup ? "기타" : (b.pickup_place || ""),
            customPickup: isCustomPickup ? b.pickup_place : "",
            pickupPeople: b.pickup_people || "",
            pickupTime: b.pickup_time || "",
            dropoffPlace: isCustomPickup ? "기타" : (b.dropoff_place || ""),
            customDropoff: isCustomPickup ? b.dropoff_place : "",
            dropoffPeople: b.dropoff_people || "",
            dropoffTime: b.dropoff_time || "",
          });
        }
      } catch {
        // bus_request 없으면 무시
      }
      setBusLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (newStatus === "cancelled") {
      const r = data.find((x) => x.id === id);
      setConfirm({ type: "cancel", id, name: r?.guest_name || "" });
      return;
    }
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchData();
    if (detail?.id === id) {
      setDetail({ ...detail, status: newStatus as ReservationRow["status"] });
      setEditData((prev) => ({ ...prev, status: newStatus as ReservationRow["status"] }));
    }
  };

  const handleSaveEdit = async () => {
    if (!detail) return;
    setSaving(true);

    // 변경 내역 계산
    const changes: string[] = [];
    if (editData.guest_count !== detail.guest_count) {
      const oldTotal = detail.guest_count || 0;
      const newTotal = editData.guest_count || 0;
      changes.push(`• 인원: ${oldTotal}명 → ${newTotal}명`);
    }
    if (editData.bbq_count !== detail.bbq_count) changes.push(`• BBQ 그릴: ${detail.bbq_count}개 → ${editData.bbq_count}개`);
    if (editData.burner_count !== detail.burner_count) changes.push(`• 가스버너: ${detail.burner_count}개 → ${editData.burner_count}개`);
    if (editData.dinner_count !== detail.dinner_count) changes.push(`• 저녁식사: ${detail.dinner_count}명 → ${editData.dinner_count}명`);
    if ((editData.breakfast_count ?? 0) !== (detail.breakfast_count ?? 0)) {
      changes.push(`• 조식: ${detail.breakfast_count ?? 0}명 → ${editData.breakfast_count ?? 0}명`);
    }
    if ((editData.breakfast_menu ?? "") !== (detail.breakfast_menu ?? "")) {
      changes.push(`• 조식 메뉴: ${detail.breakfast_menu || "(없음)"} → ${editData.breakfast_menu || "(없음)"}`);
    }
    if ((editData.pool_count ?? 0) !== (detail.pool_count ?? 0)) {
      changes.push(`• 미니수영장: ${detail.pool_count ?? 0}개 → ${editData.pool_count ?? 0}개`);
    }
    if (editData.woodcraft_count !== detail.woodcraft_count) changes.push(`• 목공키트: ${detail.woodcraft_count}개 → ${editData.woodcraft_count}개`);
    if (editData.pot_bbq_count !== detail.pot_bbq_count) changes.push(`• 항아리BBQ: ${detail.pot_bbq_count}인분 → ${editData.pot_bbq_count}인분`);
    if (editData.bus_requested !== detail.bus_requested) changes.push(`• 버스: ${detail.bus_requested ? "요청" : "없음"} → ${editData.bus_requested ? "요청" : "없음"}`);
    if (editData.stay_nights !== detail.stay_nights) changes.push(`• 숙박: ${detail.stay_nights}박 → ${editData.stay_nights}박`);
    if ((editData.reservation_date ?? "") !== (detail.reservation_date ?? "")) {
      changes.push(`• 체크인: ${detail.reservation_date} → ${editData.reservation_date}`);
    }
    if ((editData.checkout_date ?? "") !== (detail.checkout_date ?? "")) {
      changes.push(`• 체크아웃: ${detail.checkout_date || "(없음)"} → ${editData.checkout_date || "(없음)"}`);
    }
    if ((editData.program_type ?? detail.program_type) !== detail.program_type) {
      changes.push(`• 프로그램: ${PROGRAM_LABELS[detail.program_type]} → ${PROGRAM_LABELS[editData.program_type as string] || editData.program_type}`);
    }
    if ((editData.time_slot ?? "") !== (detail.time_slot ?? "")) {
      changes.push(`• 시간대: ${detail.time_slot || "(없음)"} → ${editData.time_slot || "(없음)"}`);
    }
    if ((editData.purpose ?? "") !== (detail.purpose ?? "")) {
      changes.push(`• 목적: ${detail.purpose || "(없음)"} → ${editData.purpose || "(없음)"}`);
    }
    if ((editData.notes ?? "") !== (detail.notes ?? "")) changes.push(`• 메모: ${editData.notes || "(없음)"}`);
    if (editData.status !== detail.status) changes.push(`• 상태: ${STATUS_LABELS[detail.status]} → ${STATUS_LABELS[editData.status as string]}`);

    try {
      const res = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: detail.id,
          ...editData,
          bus_form: busToggle ? busForm : null,
        }),
      });

      if (!res.ok) {
        alert("저장에 실패했습니다.");
        setSaving(false);
        return;
      }

      // SMS 변경 알림 발송
      if (changes.length > 0) {
        setNotifying(true);
        try {
          await fetch("/api/admin/reservations/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              guestName: editData.guest_name ?? detail.guest_name,
              guestPhone: editData.guest_phone ?? detail.guest_phone,
              reservationDate: editData.reservation_date ?? detail.reservation_date,
              stayNights: editData.stay_nights ?? detail.stay_nights,
              guestCount: editData.guest_count ?? detail.guest_count,
              extraGuests: editData.extra_guests ?? detail.extra_guests,
              programType: editData.program_type ?? detail.program_type,
              bbqCount: editData.bbq_count ?? detail.bbq_count,
              burnerCount: editData.burner_count ?? detail.burner_count,
              dinnerCount: editData.dinner_count ?? detail.dinner_count,
              breakfastCount: editData.breakfast_count ?? detail.breakfast_count ?? 0,
              breakfastMenu: editData.breakfast_menu ?? detail.breakfast_menu ?? "",
              poolCount: editData.pool_count ?? detail.pool_count ?? 0,
              woodcraftCount: editData.woodcraft_count ?? detail.woodcraft_count,
              potBbqCount: editData.pot_bbq_count ?? detail.pot_bbq_count,
              busRequested: editData.bus_requested ?? detail.bus_requested,
              timeSlot: editData.time_slot ?? detail.time_slot,
              notes: editData.notes ?? detail.notes,
              purpose: editData.purpose ?? detail.purpose,
              changes,
            }),
          });
        } catch (smsErr) {
          console.error("변경 알림 발송 실패:", smsErr);
        }
        setNotifying(false);
      }

      // 로컬 상태 업데이트
      const updated = { ...detail, ...editData } as ReservationRow;
      setDetail(updated);
      setIsEditing(false);
      fetchData();
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
    setSaving(false);
  };

  const handleSaveBus = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: detail.id,
          bus_requested: busToggle,
          bus_form: busToggle ? busForm : null,
        }),
      });
      setDetail({ ...detail, bus_requested: busToggle });
      fetchData();
      alert(busToggle ? "버스 렌트 정보가 저장되었습니다." : "버스 렌트가 해제되었습니다.");
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    }
    setSaving(false);
  };

  const handleDelete = (id: number, name: string) => {
    setConfirm({ type: "delete", id, name });
  };

  const executeConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === "cancel") {
        await fetch("/api/admin/reservations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: confirm.id, status: "cancelled" }),
        });
      } else {
        await fetch("/api/admin/reservations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: confirm.id }),
        });
      }
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    }
    setActionLoading(false);
    setConfirm(null);
    if (detail?.id === confirm.id) setDetail(null);
    fetchData();
  };

  const totalPages = Math.ceil(total / pageSize);

  const ed = (key: keyof ReservationRow) => (editData[key] ?? detail?.[key]) as number;
  const setEd = (key: string, val: number | string | boolean) => setEditData((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">예약 관리</h1>
        <a href="/admin/reservations/calendar" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs sm:text-sm font-semibold hover:bg-primary/20 transition-colors">
          <CalendarDays size={14} /> 달력
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => { setStatus(opt.value); setPage(0); }}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                status === opt.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>{opt.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {PROGRAM_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => { setProgram(opt.value); setPage(0); }}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                program === opt.value ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>{opt.label}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="이름 또는 전화번호..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">검색</button>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">예약자</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">연락처</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">체크인</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">체크아웃</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">프로그램</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-sm">인원</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-sm">BBQ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">부가옵션</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-sm">상태</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-sm">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />불러오는 중...
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">예약이 없습니다</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-green-50/30 cursor-pointer transition-colors" onClick={() => openDetail(r)}>
                    <td className="px-4 py-3"><p className="font-semibold text-gray-900 text-sm">{r.guest_name}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.guest_phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.reservation_date}<span className="text-gray-400 ml-1">({r.stay_nights}박)</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.checkout_date || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{PROGRAM_LABELS[r.program_type]}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{r.guest_count}명</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{r.bbq_count > 0 ? `${r.bbq_count}개` : "-"}{r.burner_count > 0 && <span className="text-gray-400 text-xs block">렌지{r.burner_count}</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatOptions(r)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[r.status] || r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-center">
                        <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                          <option value="confirmed">예약확정</option>
                          <option value="upcoming">방문예정</option>
                          <option value="visited">방문완료</option>
                          <option value="reviewed">후기남김</option>
                          <option value="cancelled">예약취소</option>
                        </select>
                        <button onClick={() => handleDelete(r.id, r.guest_name)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium">삭제</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">총 {total}건 중 {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />불러오는 중...
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">예약이 없습니다</p>
        ) : (
          data.map((r) => (
            <div key={r.id} onClick={() => openDetail(r)} className="bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{r.guest_name}</span>
                  <span className="text-xs text-gray-500">{r.guest_phone}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[r.status]}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">체크인</span><span className="text-gray-900 font-medium">{r.reservation_date}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">체크아웃</span><span className="text-gray-900 font-medium">{r.checkout_date || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">프로그램</span><span className="text-gray-900 font-medium">{PROGRAM_LABELS[r.program_type]}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">인원</span><span className="text-gray-900 font-medium">{r.guest_count}명</span></div>
                {r.bbq_count > 0 && <div className="flex justify-between"><span className="text-gray-500">BBQ</span><span className="text-gray-900 font-medium">{r.bbq_count}개</span></div>}
                {formatOptions(r) !== "-" && <div className="flex justify-between"><span className="text-gray-500">부가</span><span className="text-gray-900 font-medium">{formatOptions(r)}</span></div>}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white">
                  <option value="confirmed">예약확정</option>
                  <option value="visited">방문완료</option>
                  <option value="reviewed">후기완료</option>
                  <option value="pending">대기</option>
                  <option value="cancelled">취소</option>
                </select>
                <button onClick={() => handleDelete(r.id, r.guest_name)} className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-semibold">삭제</button>
              </div>
            </div>
          ))
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-3">
            <p className="text-xs text-gray-500">총 {total}건</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{page + 1}/{totalPages}</span>
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail / Edit Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setDetail(null); setIsEditing(false); }} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {isEditing ? "예약 수정" : "예약 상세"}
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                    <Pencil size={13} /> 수정
                  </button>
                ) : null}
                <button onClick={() => { setDetail(null); setIsEditing(false); }} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
            </div>

            {isEditing ? (
              /* EDIT MODE */
              <div className="space-y-4">
                {/* 예약자 정보 (편집 가능) */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">예약자 정보</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 mb-1 block">이름</label>
                      <input type="text" value={ed("guest_name") || ""}
                        onChange={(e) => setEd("guest_name", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 mb-1 block">전화번호</label>
                      <input type="text" value={ed("guest_phone") || ""}
                        onChange={(e) => setEd("guest_phone", e.target.value.replace(/[^0-9-]/g, ""))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 mb-1 block">체크인</label>
                      <input type="date" value={ed("reservation_date") || ""}
                        onChange={(e) => setEd("reservation_date", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 mb-1 block">체크아웃</label>
                      <input type="date" value={ed("checkout_date") || ""}
                        onChange={(e) => setEd("checkout_date", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 mb-1 block">프로그램</label>
                      <select value={(ed("program_type") as unknown as string) || detail.program_type}
                        onChange={(e) => setEd("program_type", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {PROGRAM_TYPE_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {isTimedProgram((ed("program_type") as unknown as string) || detail.program_type) && (
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500 mb-1 block">시간대</label>
                      <input type="text" placeholder="예: 09-12, day, night" value={ed("time_slot") || ""}
                        onChange={(e) => setEd("time_slot", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                  )}
                </div>

                {/* 인원 */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">총 인원</label>
                    <input type="number" value={ed("guest_count") || ""}
                      onChange={(e) => {
                        const total = Math.min(parseInt(e.target.value) || 0, 45);
                        setEditData((prev) => ({ ...prev, guest_count: total, extra_guests: 0 }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">기본</label>
                    <input type="number" value={ed("guest_count") || 0} readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">추가</label>
                    <input type="number" value={ed("extra_guests") || 0} readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>

                {/* 숙박 */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">숙박 (박)</label>
                  <input type="number" value={ed("stay_nights") || ""} onChange={(e) => setEd("stay_nights", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>

                {/* BBQ / 렌지 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">BBQ 그릴</label>
                    <input type="number" value={ed("bbq_count") || ""} onChange={(e) => setEd("bbq_count", Math.min(6, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">가스버너</label>
                    <input type="number" value={ed("burner_count") || ""} onChange={(e) => setEd("burner_count", Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                {/* 석식 / 목공 / 항아리 */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">저녁식사</label>
                    <input type="number" value={ed("dinner_count") || ""} onChange={(e) => setEd("dinner_count", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">목공키트</label>
                    <input type="number" value={ed("woodcraft_count") || ""} onChange={(e) => setEd("woodcraft_count", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">항아리BBQ</label>
                    <input type="number" value={ed("pot_bbq_count") || ""} onChange={(e) => setEd("pot_bbq_count", Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                {/* 조식 (인원 + 메뉴) */}
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1">🍱 조식 (1인 10,000원)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-1 block">조식 인원</label>
                      <input type="number" value={ed("breakfast_count") ?? 0}
                        onChange={(e) => {
                          const cnt = Math.max(0, parseInt(e.target.value) || 0);
                          setEditData((prev) => {
                            const next: Partial<ReservationRow> = { ...prev, breakfast_count: cnt };
                            if (cnt === 0) next.breakfast_menu = "";
                            else if (prev.breakfast_menu === "육개장" && cnt < 20) next.breakfast_menu = "";
                            return next;
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 mb-1 block">조식 메뉴</label>
                      <select value={ed("breakfast_menu") || ""}
                        onChange={(e) => setEd("breakfast_menu", e.target.value)}
                        disabled={(ed("breakfast_count") ?? 0) === 0}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:bg-gray-100 disabled:text-gray-400">
                        <option value="">메뉴 선택</option>
                        {BREAKFAST_MENUS.map((m) => {
                          const cnt = (ed("breakfast_count") ?? 0) as number;
                          const disabled = m.minPeople > 0 && cnt < m.minPeople;
                          return (
                            <option key={m.name} value={m.name} disabled={disabled}>
                              {m.name}{m.minPeople > 0 ? ` (${m.minPeople}인↑)` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  {(ed("breakfast_count") ?? 0) > 0 && !ed("breakfast_menu") && (
                    <p className="text-[11px] text-amber-700">조식 메뉴를 선택해주세요.</p>
                  )}
                </div>

                {/* 미니수영장 + 목적 + 유입경로 */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      미니수영장 <span className="text-[10px] text-gray-400">(7~9월)</span>
                    </label>
                    <input type="number" value={ed("pool_count") ?? 0}
                      onChange={(e) => setEd("pool_count", Math.max(0, parseInt(e.target.value) || 0))}
                      disabled={!isPoolSeason((ed("reservation_date") as unknown as string) || detail.reservation_date)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">목적</label>
                    <select value={ed("purpose") || ""}
                      onChange={(e) => setEd("purpose", e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">선택 없음</option>
                      {PURPOSE_OPTIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">유입경로</label>
                    <select value={ed("referral_source") || ""}
                      onChange={(e) => setEd("referral_source", e.target.value)}
                      className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">선택 없음</option>
                      {REFERRAL_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 버스 렌트 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Bus size={14} className="text-primary" /> 버스 렌트
                    </label>
                    <div className="flex bg-gray-100 rounded-full p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBusToggle(false);
                          setEditData((prev) => ({ ...prev, bus_requested: false }));
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          !busToggle ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
                        }`}
                      >
                        없음
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBusToggle(true);
                          setEditData((prev) => ({ ...prev, bus_requested: true }));
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          busToggle ? "bg-primary text-white shadow-sm" : "text-gray-400"
                        }`}
                      >
                        요청
                      </button>
                    </div>
                  </div>

                  <div style={{ display: busToggle ? "block" : "none" }}>
                    <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                      <p className="text-xs font-semibold text-gray-700">책임자 정보</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="담당자 이름" value={busForm.managerName}
                          onChange={(e) => setBusForm((p) => ({ ...p, managerName: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        <input placeholder="연락처" value={busForm.managerPhone}
                          onChange={(e) => setBusForm((p) => ({ ...p, managerPhone: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>

                      <p className="text-xs font-semibold text-gray-700">승차 정보</p>
                      <div className="grid grid-cols-3 gap-2">
                        <select value={busForm.pickupPlace}
                          onChange={(e) => setBusForm((p) => ({ ...p, pickupPlace: e.target.value, dropoffPlace: e.target.value }))}
                          className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="">출발지 선택</option>
                          {Object.entries(BUS_ROUTES).map(([name, price]) => (
                            <option key={name} value={name}>{name} ({(price / 10000).toFixed(0)}만원)</option>
                          ))}
                          <option value="기타">기타 (직접입력)</option>
                        </select>
                        <input placeholder="인원" value={busForm.pickupPeople}
                          onChange={(e) => setBusForm((p) => ({ ...p, pickupPeople: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        <select value={busForm.pickupTime}
                          onChange={(e) => setBusForm((p) => ({ ...p, pickupTime: e.target.value }))}
                          className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="">시간 선택</option>
                          {TIME_OPTIONS_PICKUP.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      {busForm.pickupPlace === "기타" && (
                        <input placeholder="승차지 직접 입력" value={busForm.customPickup}
                          onChange={(e) => setBusForm((p) => ({ ...p, customPickup: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      )}

                      <p className="text-xs font-semibold text-gray-700">하차 정보 <span className="font-normal text-gray-400">(퇴실 11시 기준)</span></p>
                      {busForm.pickupPlace && busForm.pickupPlace !== "기타" && (
                        <p className="text-xs text-primary">하차지: {busForm.pickupPlace} (승차지와 동일)</p>
                      )}
                      {busForm.pickupPlace === "기타" && (
                        <input placeholder="하차지 직접 입력" value={busForm.customDropoff}
                          onChange={(e) => setBusForm((p) => ({ ...p, customDropoff: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input placeholder="인원" value={busForm.dropoffPeople}
                          onChange={(e) => setBusForm((p) => ({ ...p, dropoffPeople: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        <select value={busForm.dropoffTime}
                          onChange={(e) => setBusForm((p) => ({ ...p, dropoffTime: e.target.value }))}
                          className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option value="">하차 출발시간</option>
                          {TIME_OPTIONS_DROPOFF.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {busForm.pickupPlace && busForm.pickupPlace !== "기타" && BUS_ROUTES[busForm.pickupPlace] && (
                        <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
                          <p className="text-xs text-gray-600">왕복 견적: <span className="font-bold text-primary">{BUS_ROUTES[busForm.pickupPlace].toLocaleString()}원</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 상태 */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">상태</label>
                  <select value={editData.status || detail.status} onChange={(e) => setEd("status", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="confirmed">예약확정</option>
                    <option value="upcoming">방문예정</option>
                    <option value="visited">방문완료</option>
                    <option value="reviewed">후기남김</option>
                    <option value="cancelled">예약취소</option>
                  </select>
                </div>

                {/* 메모 */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">메모</label>
                  <textarea value={editData.notes ?? detail.notes ?? ""} onChange={(e) => setEd("notes", e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>

                {/* 저장 버튼 */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">취소</button>
                  <button onClick={handleSaveEdit} disabled={saving || notifying}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={14} className="animate-spin" /> 저장 중...</> :
                     notifying ? <><MessageSquare size={14} className="animate-pulse" /> 문자 발송 중...</> :
                     <><Save size={14} /> 저장 + 변경알림 발송</>}
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE */
              <>
                <div className="space-y-2.5 sm:space-y-3">
                  <Row label="예약자" value={detail.guest_name} />
                  <Row label="연락처" value={detail.guest_phone} />
                  <Row label="체크인" value={`${detail.reservation_date} (${detail.stay_nights}박)`} />
                  <Row label="체크아웃" value={detail.checkout_date || "-"} />
                  <Row label="프로그램" value={PROGRAM_LABELS[detail.program_type]} />
                  <Row label="인원" value={`${detail.guest_count}명`} />
                  <Row label="목적" value={detail.purpose || detail.purpose_raw || "-"} />
                  {detail.time_slot && <Row label="시간대" value={detail.time_slot} />}
                  <Row label="BBQ 그릴" value={`${detail.bbq_count}개`} />
                  <Row label="가스버너" value={`${detail.burner_count}개`} />
                  {detail.dinner_count > 0 && <Row label="저녁식사" value={`${detail.dinner_count}명`} />}
                  {(detail.breakfast_count || 0) > 0 && (
                    <Row label="조식" value={`${detail.breakfast_count}명${detail.breakfast_menu ? ` · ${detail.breakfast_menu}` : ""}`} />
                  )}
                  {(detail.pool_count || 0) > 0 && <Row label="미니수영장" value={`${detail.pool_count}개`} />}
                  {detail.woodcraft_count > 0 && <Row label="목공키트" value={`${detail.woodcraft_count}개`} />}
                  {detail.pot_bbq_count > 0 && <Row label="항아리BBQ" value={`${detail.pot_bbq_count}인분`} />}
                  {detail.referral_source && <Row label="유입경로" value={detail.referral_source} />}
                  {/* 버스 렌트 - 인라인 편집 */}
                  <div className="py-2.5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium text-sm flex items-center gap-1.5">
                        <Bus size={14} className="text-primary" /> 버스 렌트
                      </span>
                      <div className="flex bg-gray-100 rounded-full p-0.5">
                        <button
                          type="button"
                          onClick={function() { setBusToggle(false); }}
                          className={
                            "px-3 py-1 rounded-full text-xs font-semibold transition-all " +
                            (!busToggle ? "bg-white text-gray-900 shadow-sm" : "text-gray-400")
                          }
                        >
                          없음
                        </button>
                        <button
                          type="button"
                          onClick={function() { setBusToggle(true); }}
                          className={
                            "px-3 py-1 rounded-full text-xs font-semibold transition-all " +
                            (busToggle ? "bg-primary text-white shadow-sm" : "text-gray-400")
                          }
                        >
                          요청
                        </button>
                      </div>
                    </div>

                    {busToggle ? (
                      <div className="mt-3 bg-gray-50 rounded-xl p-3 space-y-3 animate-scale-in">
                        <p className="text-xs font-semibold text-gray-700">책임자 정보</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="담당자 이름" value={busForm.managerName}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, managerName: e.target.value }; }); }}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          <input placeholder="연락처" value={busForm.managerPhone}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, managerPhone: e.target.value }; }); }}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>

                        <p className="text-xs font-semibold text-gray-700">승차 정보</p>
                        <div className="grid grid-cols-3 gap-2">
                          <select value={busForm.pickupPlace}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, pickupPlace: e.target.value, dropoffPlace: e.target.value }; }); }}
                            className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">출발지 선택</option>
                            {Object.entries(BUS_ROUTES).map(function(entry) { return (
                              <option key={entry[0]} value={entry[0]}>{entry[0]} ({(entry[1] / 10000).toFixed(0)}만원)</option>
                            ); })}
                            <option value="기타">기타 (직접입력)</option>
                          </select>
                          <input placeholder="인원" value={busForm.pickupPeople}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, pickupPeople: e.target.value }; }); }}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          <select value={busForm.pickupTime}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, pickupTime: e.target.value }; }); }}
                            className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">시간 선택</option>
                            {TIME_OPTIONS_PICKUP.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
                          </select>
                        </div>
                        {busForm.pickupPlace === "기타" ? (
                          <input placeholder="승차지 직접 입력" value={busForm.customPickup}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, customPickup: e.target.value }; }); }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        ) : null}

                        <p className="text-xs font-semibold text-gray-700">하차 정보 <span className="font-normal text-gray-400">(퇴실 11시 기준)</span></p>
                        {busForm.pickupPlace && busForm.pickupPlace !== "기타" ? (
                          <p className="text-xs text-primary">하차지: {busForm.pickupPlace} (승차지와 동일)</p>
                        ) : null}
                        {busForm.pickupPlace === "기타" ? (
                          <input placeholder="하차지 직접 입력" value={busForm.customDropoff}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, customDropoff: e.target.value }; }); }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        ) : null}
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="인원" value={busForm.dropoffPeople}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, dropoffPeople: e.target.value }; }); }}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          <select value={busForm.dropoffTime}
                            onChange={function(e) { setBusForm(function(p) { return { ...p, dropoffTime: e.target.value }; }); }}
                            className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="">하차 출발시간</option>
                            {TIME_OPTIONS_DROPOFF.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
                          </select>
                        </div>

                        {busForm.pickupPlace && busForm.pickupPlace !== "기타" && BUS_ROUTES[busForm.pickupPlace] ? (
                          <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs text-gray-600">왕복 견적: <span className="font-bold text-primary">{BUS_ROUTES[busForm.pickupPlace].toLocaleString()}원</span></p>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={handleSaveBus}
                          disabled={saving}
                          className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {saving ? <><Loader2 size={14} className="animate-spin" /> 저장 중...</> : <><Save size={14} /> 버스 정보 저장</>}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {detail.bus_requested && busList.length > 0 && (
                    <div className="py-2.5 border-b border-gray-100">
                      <p className="text-gray-500 font-medium text-sm flex items-center gap-1.5 mb-2">
                        <Bus size={14} className="text-primary" /> 버스 상세 ({busList.length}대)
                      </p>
                      <div className="space-y-2">
                        {busList.map((b, idx) => {
                          const is25 = /25\s*인승/.test(b.pickup_detail || "") || /25\s*인승/.test(b.dropoff_detail || "");
                          const isRoundtrip = !!(b.dropoff_time || b.dropoff_people);
                          const isEditing = editingBusId === b.id;

                          if (isEditing) {
                            return (
                              <div key={b.id ?? idx} className="bg-primary/5 border-2 border-primary rounded-lg p-3 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-primary">승차정보 {idx + 1} 수정 중</span>
                                  <div className="flex gap-1">
                                    <button onClick={saveBusEdit} disabled={busSaving}
                                      className="px-2 py-1 bg-primary text-white rounded text-[11px] font-bold disabled:opacity-50">
                                      {busSaving ? "저장중..." : "저장"}
                                    </button>
                                    <button onClick={() => { setEditingBusId(null); setBusEditData({}); }}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[11px] font-bold">취소</button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                  <input placeholder="담당자명" value={busEditData.manager_name || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, manager_name: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                  <input placeholder="담당자 연락처" value={busEditData.manager_phone || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, manager_phone: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                </div>

                                <p className="text-[10px] font-bold text-purple-600 mt-1">🚌 승차 정보</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                  <input placeholder="승차지" value={busEditData.pickup_place || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, pickup_place: e.target.value, dropoff_place: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                  <input placeholder="인원" value={busEditData.pickup_people || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, pickup_people: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                  <input placeholder="시간" value={busEditData.pickup_time || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, pickup_time: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                </div>
                                <input placeholder="승차 상세 (예: 25인승 1호차 · 정문 앞)" value={busEditData.pickup_detail || ""}
                                  onChange={(e) => setBusEditData(p => ({ ...p, pickup_detail: e.target.value }))}
                                  className="w-full px-2 py-1 rounded border border-gray-200 text-xs bg-white" />

                                <p className="text-[10px] font-bold text-blue-600 mt-1">🚌 하차 정보</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                  <input placeholder="하차지" value={busEditData.dropoff_place || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, dropoff_place: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                  <input placeholder="인원" value={busEditData.dropoff_people || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, dropoff_people: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                  <input placeholder="시간" value={busEditData.dropoff_time || ""}
                                    onChange={(e) => setBusEditData(p => ({ ...p, dropoff_time: e.target.value }))}
                                    className="px-2 py-1 rounded border border-gray-200 text-xs bg-white" />
                                </div>
                                <input placeholder="하차 상세 (예: 25인승 1호차 · 후문)" value={busEditData.dropoff_detail || ""}
                                  onChange={(e) => setBusEditData(p => ({ ...p, dropoff_detail: e.target.value }))}
                                  className="w-full px-2 py-1 rounded border border-gray-200 text-xs bg-white" />

                                {(() => {
                                  const previewCost = calcBusCost(busEditData);
                                  return previewCost > 0 ? (
                                    <div className="mt-1 p-2 bg-amber-50 border border-amber-200 rounded text-[11px]">
                                      <span className="text-amber-700">
                                        {is25Seater(busEditData) ? "25인승 (50km 이내)" : busEditData.pickup_place} {(busEditData.dropoff_time || busEditData.dropoff_people) ? "왕복" : "편도"} 견적:
                                      </span>{" "}
                                      <span className="font-bold text-amber-900">{previewCost.toLocaleString()}원</span>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            );
                          }

                          return (
                            <div key={b.id ?? idx} className="bg-gray-50 rounded-lg p-2.5 text-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-primary">승차정보 {idx + 1}</span>
                                  {is25 && <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">25인승</span>}
                                  <span className="text-gray-400">· {isRoundtrip ? "왕복" : "편도"}</span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button onClick={() => startEditBus(b)}
                                    className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold hover:bg-primary/20">수정</button>
                                  <button onClick={() => b.id && deleteBusEntry(b.id)}
                                    className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[10px] font-bold hover:bg-red-100">삭제</button>
                                </div>
                              </div>
                              {(b.manager_name || b.manager_phone) && (
                                <div className="text-gray-700">
                                  <span className="text-gray-400">담당자: </span>
                                  {b.manager_name || "-"} {b.manager_phone || ""}
                                </div>
                              )}
                              <div className="text-gray-700">
                                <span className="text-purple-500 font-semibold">🚌 승차</span> {b.pickup_place || "-"}{" "}
                                {b.pickup_time || "-"} ({b.pickup_people || "-"}명)
                                <div className="text-gray-500 text-[11px] mt-0.5 ml-4">📍 상세 승차지: {b.pickup_detail || "-"}</div>
                              </div>
                              {isRoundtrip && (
                                <div className="text-gray-700">
                                  <span className="text-blue-500 font-semibold">🚌 하차</span> {b.dropoff_place || b.pickup_place || "-"}{" "}
                                  {b.dropoff_time || "-"} ({b.dropoff_people || "-"}명)
                                  <div className="text-gray-500 text-[11px] mt-0.5 ml-4">📍 상세 하차지: {b.dropoff_detail || "-"}</div>
                                </div>
                              )}
                              {(() => {
                                const c = calcBusCost(b);
                                return c > 0 ? (
                                  <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                                    1대 견적 ({is25Seater(b) ? "25인승 50km이내" : b.pickup_place} {isRoundtrip ? "왕복" : "편도"}): <span className="font-bold text-primary">{c.toLocaleString()}원</span>
                                  </div>
                                ) : null;
                              })()}
                            </div>
                          );
                        })}
                      </div>
                      {(() => {
                        const computedTotal = busList.reduce((s, b) => s + calcBusCost(b), 0);
                        const stored = detail.bus_fee || 0;
                        const mismatch = computedTotal > 0 && stored !== computedTotal;
                        return (
                          <div className="mt-2 text-xs text-gray-600 space-y-1">
                            {computedTotal > 0 && (
                              <p>
                                계산된 합산 ({busList.length}대): <span className="font-bold text-primary">{computedTotal.toLocaleString()}원</span>
                              </p>
                            )}
                            {stored > 0 && (
                              <p>
                                저장된 버스비 (DB): <span className={`font-bold ${mismatch ? "text-amber-600" : "text-primary"}`}>{stored.toLocaleString()}원</span>
                                {mismatch && (
                                  <button
                                    onClick={() => reconcileBusFee(detail.id, busList)}
                                    className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold hover:bg-amber-200"
                                  >
                                    자동 보정
                                  </button>
                                )}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <Row label="채널" value={detail.source || detail.referral_source || "-"} />
                  <Row label="메모" value={detail.notes || "-"} />
                  <Row label="상태">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[detail.status]}`}>{STATUS_LABELS[detail.status]}</span>
                  </Row>
                </div>
                <div className="flex gap-2 mt-5 pt-4 border-t border-gray-200">
                  <button onClick={() => setIsEditing(true)}
                    className="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                    <Pencil size={14} /> 옵션 수정
                  </button>
                  {detail.status !== "cancelled" && (
                    <button onClick={() => { setDetail(null); setConfirm({ type: "cancel", id: detail.id, name: detail.guest_name }); }}
                      className="flex-1 py-2.5 rounded-xl bg-amber-50 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors">예약 취소</button>
                  )}
                  <button onClick={() => { setDetail(null); handleDelete(detail.id, detail.guest_name); }}
                    className="py-2.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors">삭제</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${confirm.type === "delete" ? "bg-red-100" : "bg-amber-100"}`}>
                <span className="text-2xl">{confirm.type === "delete" ? "🗑️" : "⚠️"}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{confirm.type === "delete" ? "예약 삭제" : "예약 취소"}</h3>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{confirm.name}</strong>님의 예약을{" "}
                {confirm.type === "delete" ? <span className="text-red-600 font-bold">완전히 삭제</span> : <span className="text-amber-600 font-bold">취소</span>}
                하시겠습니까?
              </p>
              {confirm.type === "delete" && <p className="text-sm text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-2 font-medium">삭제된 예약은 복구할 수 없습니다</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">아니오</button>
              <button onClick={executeConfirm} disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-50 ${confirm.type === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}>
                {actionLoading ? "처리 중..." : confirm.type === "delete" ? "삭제" : "취소 처리"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 sm:py-2.5 border-b border-gray-100">
      <span className="text-gray-500 font-medium min-w-[70px] sm:min-w-[80px] text-sm">{label}</span>
      {children || <span className="text-gray-900 text-right text-sm">{value}</span>}
    </div>
  );
}
