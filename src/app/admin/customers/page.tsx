"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Star, Phone, Calendar, Users } from "lucide-react";
import { CustomerRow, ReservationRow, PROGRAM_LABELS } from "@/types/admin";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("visit_count");
  const [detail, setDetail] = useState<{ customer: CustomerRow; reservations: ReservationRow[] } | null>(null);
  const pageSize = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sort, order: "desc", page: page.toString() });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/customers?${params}`);
    const json = await res.json();
    setCustomers(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [search, sort, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showDetail = async (id: number) => {
    const res = await fetch(`/api/admin/customers?id=${id}`);
    const json = await res.json();
    setDetail(json);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">고객 관리</h1>

      {/* Search & Sort */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(0); }} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="이름 또는 전화번호..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">검색</button>
          </form>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(0); }}
            className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
          >
            <option value="visit_count">방문 횟수순</option>
            <option value="last_visit">최근 방문순</option>
            <option value="name">이름순</option>
            <option value="total_guests_brought">총 동반인원순</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sage/30">
                <th className="text-left px-4 py-3 font-medium text-text-mid">고객명</th>
                <th className="text-left px-4 py-3 font-medium text-text-mid hidden md:table-cell">연락처</th>
                <th className="text-center px-4 py-3 font-medium text-text-mid">방문</th>
                <th className="text-left px-4 py-3 font-medium text-text-mid hidden lg:table-cell">최초 방문</th>
                <th className="text-left px-4 py-3 font-medium text-text-mid hidden lg:table-cell">최근 방문</th>
                <th className="text-center px-4 py-3 font-medium text-text-mid hidden md:table-cell">총 동반인원</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-light">불러오는 중...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-text-light">고객 데이터가 없습니다</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} onClick={() => showDetail(c.id)} className="border-b border-border/50 hover:bg-sage/20 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-dark">{c.name}</span>
                        {c.visit_count >= 3 && (
                          <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">
                            <Star size={10} className="fill-amber-400 text-amber-400" /> VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-light md:hidden">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-text-mid hidden md:table-cell">{c.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        c.visit_count >= 3 ? "bg-amber-50 text-amber-700" :
                        c.visit_count >= 2 ? "bg-blue-50 text-blue-700" :
                        "bg-gray-50 text-text-mid"
                      }`}>
                        {c.visit_count}회
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-mid hidden lg:table-cell">{c.first_visit}</td>
                    <td className="px-4 py-3 text-text-mid hidden lg:table-cell">{c.last_visit}</td>
                    <td className="px-4 py-3 text-center text-text-mid hidden md:table-cell">{c.total_guests_brought}명</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-text-light">총 {total}건</p>
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

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {detail.customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-dark flex items-center gap-2">
                  {detail.customer.name}
                  {detail.customer.visit_count >= 3 && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" /> VIP
                    </span>
                  )}
                </h2>
                <p className="text-sm text-text-light">{detail.customer.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-sage/30 rounded-xl p-3 text-center">
                <Calendar size={16} className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-text-dark">{detail.customer.visit_count}</p>
                <p className="text-[10px] text-text-light">방문 횟수</p>
              </div>
              <div className="bg-sage/30 rounded-xl p-3 text-center">
                <Users size={16} className="text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-text-dark">{detail.customer.total_guests_brought}</p>
                <p className="text-[10px] text-text-light">총 동반인원</p>
              </div>
              <div className="bg-sage/30 rounded-xl p-3 text-center">
                <Phone size={16} className="text-primary mx-auto mb-1" />
                <p className="text-xs font-medium text-text-dark mt-1">{detail.customer.first_visit?.substring(0, 4)}</p>
                <p className="text-[10px] text-text-light">첫 방문</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-text-dark mb-3">예약 이력</h3>
            <div className="space-y-2">
              {detail.reservations.length === 0 ? (
                <p className="text-sm text-text-light">예약 이력이 없습니다</p>
              ) : (
                detail.reservations.map((r: ReservationRow) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm text-text-dark">{r.reservation_date} ({r.stay_nights}박)</p>
                      <p className="text-xs text-text-light">{PROGRAM_LABELS[r.program_type]} · {r.guest_count}명</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "confirmed" ? "bg-green-50 text-green-700" :
                      r.status === "pending" ? "bg-amber-50 text-amber-700" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {r.status === "confirmed" ? "확정" : r.status === "pending" ? "대기" : "취소"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
