"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Star, Phone, Calendar, Users, DollarSign, ArrowUpDown, ArrowUp, ArrowDown, Flame, Download } from "lucide-react";
import { CustomerRow, ReservationRow, PROGRAM_LABELS, STATUS_LABELS, calculateRevenue } from "@/types/admin";

type SortField = "name" | "visit_count" | "last_visit" | "total_guests_brought" | "total_revenue";
type SortOrder = "asc" | "desc";

interface EnrichedCustomer extends CustomerRow {
  total_revenue: number;
  total_bbq: number;
}

interface CustomerDetail {
  customer: CustomerRow;
  reservations: ReservationRow[];
  stats: {
    totalRevenue: number;
    totalBbq: number;
    totalBurner: number;
    totalDinner: number;
    totalWoodcraft: number;
    totalPotBbq: number;
  };
}

function formatPrice(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(0) + "만원";
  return n.toLocaleString() + "원";
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  visited: "bg-blue-100 text-blue-800",
  reviewed: "bg-purple-100 text-purple-800",
  upcoming: "bg-cyan-100 text-cyan-800",
  cancelled: "bg-red-100 text-red-700",
};

const SORT_COLUMNS: { field: SortField; label: string }[] = [
  { field: "name", label: "고객명" },
  { field: "visit_count", label: "방문" },
  { field: "last_visit", label: "최근 방문" },
  { field: "total_guests_brought", label: "총 동반인원" },
  { field: "total_revenue", label: "총 매출" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortField>("last_visit");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, order, page: page.toString() });
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/admin/customers?${params}`);
      const json = await res.json();
      setCustomers(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setCustomers([]);
      setTotal(0);
    }
    setLoading(false);
  }, [search, sort, order, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (field: SortField) => {
    if (sort === field) {
      setOrder(order === "desc" ? "asc" : "desc");
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort !== field) return <ArrowUpDown size={14} className="text-gray-300 ml-1" />;
    return order === "asc"
      ? <ArrowUp size={14} className="text-primary ml-1" />
      : <ArrowDown size={14} className="text-primary ml-1" />;
  };

  const showDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?id=${id}`);
      const json = await res.json();
      setDetail(json);
    } catch {
      alert("고객 정보를 불러올 수 없습니다.");
    }
    setDetailLoading(false);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">고객 관리</h1>
        <a
          href={`/api/admin/customers/export?${new URLSearchParams({ sort, order, ...(search ? { search } : {}) }).toString()}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition-colors"
        >
          <Download size={14} /> CSV 내보내기
        </a>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
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

      {/* Mobile Sort */}
      <div className="lg:hidden flex gap-2 overflow-x-auto pb-1">
        {SORT_COLUMNS.map((col) => (
          <button
            key={col.field}
            onClick={() => handleSort(col.field)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              sort === col.field ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
            }`}
          >
            {col.label}
            <SortIcon field={col.field} />
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {SORT_COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    onClick={() => handleSort(col.field)}
                    className="text-left px-4 py-3 font-semibold text-gray-600 text-sm cursor-pointer hover:bg-gray-100 select-none transition-colors"
                  >
                    <span className="flex items-center">
                      {col.label}
                      <SortIcon field={col.field} />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">연락처</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">첫 방문</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 text-sm">BBQ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-sm">메모</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  불러오는 중...
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">고객 데이터가 없습니다</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} onClick={() => showDetail(c.id)} className="border-b border-gray-100 hover:bg-green-50/30 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                        {c.visit_count >= 3 && (
                          <span className="flex items-center gap-0.5 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            <Star size={11} className="fill-amber-500 text-amber-500" /> VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm px-2.5 py-1 rounded-full font-bold ${
                        c.visit_count >= 3 ? "bg-amber-100 text-amber-800" :
                        c.visit_count >= 2 ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-600"
                      }`}>{c.visit_count}회</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.last_visit || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.total_guests_brought}명</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{c.total_revenue > 0 ? formatPrice(c.total_revenue) : "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.first_visit || "-"}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">{c.total_bbq > 0 ? `${c.total_bbq}개` : "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[120px] truncate">{c.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">총 {total}명</p>
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
        ) : customers.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">고객 데이터가 없습니다</p>
        ) : (
          customers.map((c) => (
            <div key={c.id} onClick={() => showDetail(c.id)} className="bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{c.name}</span>
                  {c.visit_count >= 3 && (
                    <span className="flex items-center gap-0.5 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                      <Star size={10} className="fill-amber-500 text-amber-500" /> VIP
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  c.visit_count >= 3 ? "bg-amber-100 text-amber-800" :
                  c.visit_count >= 2 ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-600"
                }`}>{c.visit_count}회</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">연락처</span>
                  <span className="text-gray-700">{c.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">최근</span>
                  <span className="text-gray-700">{c.last_visit || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">동반</span>
                  <span className="text-gray-700">{c.total_guests_brought}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">매출</span>
                  <span className="font-semibold text-gray-900">{c.total_revenue > 0 ? formatPrice(c.total_revenue) : "-"}</span>
                </div>
              </div>
              {c.notes && <p className="text-xs text-gray-400 mt-2 truncate">{c.notes}</p>}
            </div>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-3">
            <p className="text-xs text-gray-500">총 {total}명</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{page + 1}/{totalPages}</span>
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setDetail(null); }} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6">
            {detailLoading && !detail ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : detail ? (
              <>
                <button onClick={() => setDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✕</button>

                {/* Customer Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg sm:text-xl flex-shrink-0">
                    {detail.customer.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      {detail.customer.name}
                      {detail.customer.visit_count >= 3 && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Star size={11} className="fill-amber-500 text-amber-500" /> VIP
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <Phone size={13} /> {detail.customer.phone}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
                  <div className="bg-green-50 rounded-xl p-2.5 sm:p-3 text-center">
                    <DollarSign size={16} className="text-green-600 mx-auto mb-1" />
                    <p className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(detail.stats.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">총 매출</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-2.5 sm:p-3 text-center">
                    <Calendar size={16} className="text-blue-600 mx-auto mb-1" />
                    <p className="text-base sm:text-lg font-bold text-gray-900">{detail.customer.visit_count}회</p>
                    <p className="text-xs text-gray-500">방문</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-2.5 sm:p-3 text-center">
                    <Users size={16} className="text-purple-600 mx-auto mb-1" />
                    <p className="text-base sm:text-lg font-bold text-gray-900">{detail.customer.total_guests_brought}명</p>
                    <p className="text-xs text-gray-500">동반인원</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-2.5 sm:p-3 text-center">
                    <Flame size={16} className="text-orange-600 mx-auto mb-1" />
                    <p className="text-base sm:text-lg font-bold text-gray-900">{detail.stats.totalBbq}개</p>
                    <p className="text-xs text-gray-500">BBQ</p>
                  </div>
                </div>

                {/* Options Summary */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">누적 옵션</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                    <div className="flex justify-between sm:flex-col sm:text-center">
                      <span className="text-gray-500">BBQ 그릴</span>
                      <span className="font-bold text-gray-900">{detail.stats.totalBbq}개</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-center">
                      <span className="text-gray-500">가스버너</span>
                      <span className="font-bold text-gray-900">{detail.stats.totalBurner}개</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-center">
                      <span className="text-gray-500">저녁식사</span>
                      <span className="font-bold text-gray-900">{detail.stats.totalDinner}명</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-center">
                      <span className="text-gray-500">목공키트</span>
                      <span className="font-bold text-gray-900">{detail.stats.totalWoodcraft}개</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:text-center">
                      <span className="text-gray-500">항아리BBQ</span>
                      <span className="font-bold text-gray-900">{detail.stats.totalPotBbq}인분</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">고객 정보</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-500">첫 방문</span>
                      <span className="font-semibold text-gray-900">{detail.customer.first_visit || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-500">최근 방문</span>
                      <span className="font-semibold text-gray-900">{detail.customer.last_visit || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-500">등록일</span>
                      <span className="font-semibold text-gray-900">{detail.customer.created_at?.split("T")[0] || "-"}</span>
                    </div>
                    <div className="flex justify-between sm:justify-start sm:gap-2">
                      <span className="text-gray-500">메모</span>
                      <span className="font-semibold text-gray-900">{detail.customer.notes || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Reservation History */}
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">예약 이력 ({detail.reservations.length}건)</h3>
                <div className="space-y-3">
                  {detail.reservations.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">예약 이력이 없습니다</p>
                  ) : (
                    detail.reservations.map((r: ReservationRow) => (
                      <div key={r.id} className="bg-gray-50 rounded-xl p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-900">{r.reservation_date}</span>
                            <span className="text-xs sm:text-sm text-gray-500">({r.stay_nights}박)</span>
                            {r.checkout_date && <span className="text-xs text-gray-400">~ {r.checkout_date}</span>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-semibold ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                            {STATUS_LABELS[r.status] || r.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">프로그램: </span>
                            <span className="font-medium text-gray-800">{PROGRAM_LABELS[r.program_type]}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">인원: </span>
                            <span className="font-medium text-gray-800">{r.guest_count}명{r.extra_guests > 0 ? ` (+${r.extra_guests})` : ""}</span>
                          </div>
                          {r.bbq_count > 0 && <div><span className="text-gray-500">BBQ: </span><span className="font-medium text-gray-800">{r.bbq_count}개</span></div>}
                          {r.burner_count > 0 && <div><span className="text-gray-500">렌지: </span><span className="font-medium text-gray-800">{r.burner_count}개</span></div>}
                          {r.dinner_count > 0 && <div><span className="text-gray-500">석식: </span><span className="font-medium text-gray-800">{r.dinner_count}명</span></div>}
                          {r.woodcraft_count > 0 && <div><span className="text-gray-500">목공: </span><span className="font-medium text-gray-800">{r.woodcraft_count}개</span></div>}
                          {r.pot_bbq_count > 0 && <div><span className="text-gray-500">항아리: </span><span className="font-medium text-gray-800">{r.pot_bbq_count}인분</span></div>}
                          {r.bus_requested && <div><span className="text-gray-500">버스: </span><span className="font-medium text-gray-800">요청</span></div>}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs sm:text-sm text-gray-500 truncate mr-2">{r.purpose || r.purpose_raw || ""} {r.notes ? `| ${r.notes}` : ""}</span>
                          <span className="text-sm font-bold text-primary whitespace-nowrap">{formatPrice(calculateRevenue(r))}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
