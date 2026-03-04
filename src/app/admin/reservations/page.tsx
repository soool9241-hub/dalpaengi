"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { ReservationRow, PROGRAM_LABELS, STATUS_LABELS } from "@/types/admin";

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "confirmed", label: "확정" },
  { value: "visited", label: "방문" },
  { value: "reviewed", label: "후기" },
  { value: "pending", label: "대기" },
  { value: "cancelled", label: "취소" },
];

const PROGRAM_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "stay", label: "숙박" },
  { value: "half", label: "3시간" },
  { value: "daynight", label: "주/야간" },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  visited: "bg-blue-100 text-blue-800",
  reviewed: "bg-purple-100 text-purple-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-700",
};

function formatOptions(r: ReservationRow): string {
  const opts: string[] = [];
  if (r.dinner_count > 0) opts.push(`석식${r.dinner_count}`);
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
    if (detail?.id === id) setDetail({ ...detail, status: newStatus as ReservationRow["status"] });
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
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(0); }}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                status === opt.value ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {PROGRAM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setProgram(opt.value); setPage(0); }}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                program === opt.value ? "bg-accent text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="이름 또는 전화번호..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  불러오는 중...
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">예약이 없습니다</td></tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-green-50/30 cursor-pointer transition-colors" onClick={() => setDetail(r)}>
                    <td className="px-4 py-3"><p className="font-semibold text-gray-900 text-sm">{r.guest_name}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.guest_phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.reservation_date}<span className="text-gray-400 ml-1">({r.stay_nights}박)</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.checkout_date || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{PROGRAM_LABELS[r.program_type]}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{r.guest_count}명{r.extra_guests > 0 && <span className="text-gray-400 text-xs ml-0.5">(+{r.extra_guests})</span>}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{r.bbq_count > 0 ? `${r.bbq_count}개` : "-"}{r.burner_count > 0 && <span className="text-gray-400 text-xs block">렌지{r.burner_count}</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatOptions(r)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[r.status] || r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-center">
                        <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
                          <option value="confirmed">예약확정</option>
                          <option value="visited">방문완료</option>
                          <option value="reviewed">후기완료</option>
                          <option value="pending">대기</option>
                          <option value="cancelled">취소</option>
                        </select>
                        <button onClick={() => handleDelete(r.id, r.guest_name)} className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium" title="삭제">삭제</button>
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
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2" />
            불러오는 중...
          </div>
        ) : data.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">예약이 없습니다</p>
        ) : (
          data.map((r) => (
            <div key={r.id} onClick={() => setDetail(r)} className="bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{r.guest_name}</span>
                  <span className="text-xs text-gray-500">{r.guest_phone}</span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">체크인</span>
                  <span className="text-gray-900 font-medium">{r.reservation_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">체크아웃</span>
                  <span className="text-gray-900 font-medium">{r.checkout_date || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">프로그램</span>
                  <span className="text-gray-900 font-medium">{PROGRAM_LABELS[r.program_type]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">인원</span>
                  <span className="text-gray-900 font-medium">{r.guest_count}명{r.extra_guests > 0 ? ` (+${r.extra_guests})` : ""}</span>
                </div>
                {r.bbq_count > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">BBQ</span>
                    <span className="text-gray-900 font-medium">{r.bbq_count}개</span>
                  </div>
                )}
                {formatOptions(r) !== "-" && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">부가</span>
                    <span className="text-gray-900 font-medium">{formatOptions(r)}</span>
                  </div>
                )}
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

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <button onClick={() => setDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-5">예약 상세</h2>
            <div className="space-y-2.5 sm:space-y-3">
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
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium"
                >
                  <option value="confirmed">예약확정</option>
                  <option value="visited">방문완료</option>
                  <option value="reviewed">후기완료</option>
                  <option value="pending">대기</option>
                  <option value="cancelled">취소</option>
                </select>
              </Row>
            </div>
            <div className="flex gap-2 mt-5 pt-4 border-t border-gray-200">
              {detail.status !== "cancelled" && (
                <button
                  onClick={() => { setDetail(null); setConfirm({ type: "cancel", id: detail.id, name: detail.guest_name }); }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-50 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors"
                >
                  예약 취소
                </button>
              )}
              <button
                onClick={() => { setDetail(null); handleDelete(detail.id, detail.guest_name); }}
                className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                완전 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-6 animate-scale-in">
            <div className="text-center mb-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                confirm.type === "delete" ? "bg-red-100" : "bg-amber-100"
              }`}>
                <span className="text-2xl">{confirm.type === "delete" ? "🗑️" : "⚠️"}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {confirm.type === "delete" ? "예약 삭제" : "예약 취소"}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{confirm.name}</strong>님의 예약을{" "}
                {confirm.type === "delete" ? (
                  <span className="text-red-600 font-bold">완전히 삭제</span>
                ) : (
                  <span className="text-amber-600 font-bold">취소</span>
                )}
                하시겠습니까?
              </p>
              {confirm.type === "delete" && (
                <p className="text-sm text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-2 font-medium">
                  삭제된 예약은 복구할 수 없습니다
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">아니오</button>
              <button
                onClick={executeConfirm}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-50 ${
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
    <div className="flex items-start justify-between py-2 sm:py-2.5 border-b border-gray-100">
      <span className="text-gray-500 font-medium min-w-[70px] sm:min-w-[80px] text-sm">{label}</span>
      {children || <span className="text-gray-900 text-right text-sm">{value}</span>}
    </div>
  );
}
