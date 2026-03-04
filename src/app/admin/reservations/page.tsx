"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { ReservationRow, PROGRAM_LABELS, STATUS_LABELS } from "@/types/admin";

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "confirmed", label: "확정" },
  { value: "pending", label: "대기" },
  { value: "cancelled", label: "취소" },
];

const PROGRAM_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "stay", label: "숙박" },
  { value: "half", label: "3시간" },
  { value: "daynight", label: "주/야간" },
];

export default function ReservationsPage() {
  const [data, setData] = useState<ReservationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [program, setProgram] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [detail, setDetail] = useState<ReservationRow | null>(null);
  const [confirm, setConfirm] = useState<{ type: "cancel" | "delete"; id: number; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status, program, page: page.toString(), sort: "reservation_date", order: "desc" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/reservations?${params}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [status, program, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    // 취소는 확인 팝업
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
    if (detail?.id === id) setDetail({ ...detail, status: newStatus as ReservationRow["status"] });
  };

  const handleDelete = (id: number, name: string) => {
    setConfirm({ type: "delete", id, name });
  };

  const executeConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
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
    setActionLoading(false);
    setConfirm(null);
    if (detail?.id === confirm.id) setDetail(null);
    fetchData();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">예약 관리</h1>
        <a href="/admin/reservations/calendar" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
          <CalendarDays size={16} /> 달력 보기
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                status === opt.value ? "bg-primary text-white" : "bg-sage/50 text-text-mid hover:bg-sage"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <span className="border-l border-border mx-2" />
          {PROGRAM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setProgram(opt.value); setPage(0); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                program === opt.value ? "bg-accent text-white" : "bg-sage/50 text-text-mid hover:bg-sage"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="이름 또는 전화번호 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">검색</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sage/30">
                <th className="text-left px-4 py-3 font-medium text-text-mid">예약자</th>
                <th className="text-left px-4 py-3 font-medium text-text-mid hidden md:table-cell">연락처</th>
                <th className="text-left px-4 py-3 font-medium text-text-mid">체크인</th>
                <th className="text-left px-4 py-3 font-medium text-text-mid hidden lg:table-cell">프로그램</th>
                <th className="text-center px-4 py-3 font-medium text-text-mid">인원</th>
                <th className="text-center px-4 py-3 font-medium text-text-mid">상태</th>
                <th className="text-center px-4 py-3 font-medium text-text-mid">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-light">불러오는 중...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-light">예약이 없습니다</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-sage/20 cursor-pointer transition-colors" onClick={() => setDetail(r)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-dark">{r.guest_name}</p>
                      <p className="text-xs text-text-light md:hidden">{r.guest_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-text-mid hidden md:table-cell">{r.guest_phone}</td>
                    <td className="px-4 py-3 text-text-mid">
                      {r.reservation_date}
                      <span className="text-xs text-text-light ml-1">({r.stay_nights}박)</span>
                    </td>
                    <td className="px-4 py-3 text-text-mid hidden lg:table-cell">{PROGRAM_LABELS[r.program_type]}</td>
                    <td className="px-4 py-3 text-center text-text-mid">{r.guest_count}명</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.status === "confirmed" ? "bg-green-50 text-green-700" :
                        r.status === "pending" ? "bg-amber-50 text-amber-700" :
                        "bg-red-50 text-red-600"
                      }`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-center">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className="text-xs border border-border rounded-lg px-2 py-1 bg-white"
                        >
                          <option value="confirmed">확정</option>
                          <option value="pending">대기</option>
                          <option value="cancelled">취소</option>
                        </select>
                        <button
                          onClick={() => handleDelete(r.id, r.guest_name)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="삭제"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-light">총 {total}건 중 {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg hover:bg-sage disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg hover:bg-sage disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 text-text-light hover:text-text-dark text-lg">✕</button>
            <h2 className="text-lg font-bold text-text-dark mb-4">예약 상세</h2>
            <div className="space-y-3 text-sm">
              <Row label="예약자" value={detail.guest_name} />
              <Row label="연락처" value={detail.guest_phone} />
              <Row label="체크인" value={`${detail.reservation_date} (${detail.stay_nights}박)`} />
              <Row label="체크아웃" value={detail.checkout_date || "-"} />
              <Row label="프로그램" value={PROGRAM_LABELS[detail.program_type]} />
              <Row label="인원" value={`${detail.guest_count}명 (추가 ${detail.extra_guests}명)`} />
              <Row label="목적" value={detail.purpose || detail.purpose_raw || "-"} />
              {detail.time_slot && <Row label="시간대" value={detail.time_slot} />}
              <Row label="BBQ 그릴" value={`${detail.bbq_count}개`} />
              <Row label="가스렌지" value={`${detail.burner_count}개`} />
              {detail.dinner_count > 0 && <Row label="저녁식사" value={`${detail.dinner_count}명`} />}
              {detail.woodcraft_count > 0 && <Row label="목공키트" value={`${detail.woodcraft_count}개`} />}
              {detail.pot_bbq_count > 0 && <Row label="항아리BBQ" value={`${detail.pot_bbq_count}인분`} />}
              <Row label="버스" value={detail.bus_requested ? "요청함" : "없음"} />
              <Row label="채널" value={detail.source || detail.referral_source || "-"} />
              <Row label="메모" value={detail.notes || "-"} />
              <Row label="상태">
                <select
                  value={detail.status}
                  onChange={(e) => handleStatusChange(detail.id, e.target.value)}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="confirmed">확정</option>
                  <option value="pending">대기</option>
                  <option value="cancelled">취소</option>
                </select>
              </Row>
            </div>
            <div className="flex gap-2 mt-6 pt-4 border-t border-border">
              {detail.status !== "cancelled" && (
                <button
                  onClick={() => { setDetail(null); setConfirm({ type: "cancel", id: detail.id, name: detail.guest_name }); }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-50 text-amber-700 font-medium text-sm hover:bg-amber-100 transition-colors"
                >
                  예약 취소
                </button>
              )}
              <button
                onClick={() => { setDetail(null); handleDelete(detail.id, detail.guest_name); }}
                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
              >
                완전 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                confirm.type === "delete" ? "bg-red-100" : "bg-amber-100"
              }`}>
                <span className="text-2xl">{confirm.type === "delete" ? "🗑️" : "⚠️"}</span>
              </div>
              <h3 className="text-lg font-bold text-text-dark">
                {confirm.type === "delete" ? "예약 삭제" : "예약 취소"}
              </h3>
              <p className="text-sm text-text-mid mt-2">
                <strong>{confirm.name}</strong>님의 예약을{" "}
                {confirm.type === "delete" ? (
                  <span className="text-red-600 font-bold">완전히 삭제</span>
                ) : (
                  <span className="text-amber-600 font-bold">취소</span>
                )}
                하시겠습니까?
              </p>
              {confirm.type === "delete" && (
                <p className="text-xs text-red-500 mt-2 bg-red-50 rounded-lg px-3 py-2">
                  삭제된 예약은 복구할 수 없습니다
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-text-mid font-medium text-sm hover:bg-sage/50 transition-colors"
              >
                아니오
              </button>
              <button
                onClick={executeConfirm}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-white font-medium text-sm transition-colors disabled:opacity-50 ${
                  confirm.type === "delete" ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
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
    <div className="flex items-start justify-between py-2 border-b border-border/50">
      <span className="text-text-light font-medium min-w-[80px]">{label}</span>
      {children || <span className="text-text-dark text-right">{value}</span>}
    </div>
  );
}
