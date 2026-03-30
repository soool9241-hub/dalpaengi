"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Check,
  Clock,
  XCircle,
  ChevronDown,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Filter,
  Plus,
  X,
} from "lucide-react";

interface Application {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  program: string;
  status: string;
  created_at: string;
}

interface ProgramInfo {
  label: string;
  maxCapacity: number;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "대기", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  { value: "confirmed", label: "확정", color: "bg-green-100 text-green-800", icon: Check },
  { value: "cancelled", label: "취소", color: "bg-red-100 text-red-800", icon: XCircle },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminProgramsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Record<string, ProgramInfo>>({});
  const [stats, setStats] = useState<Record<string, Stats>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "", email: "", message: "", program: "", status: "confirmed" });
  const [addLoading, setAddLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterProgram) params.set("program", filterProgram);
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/programs?${params}`);
    const json = await res.json();
    setApps(json.data || []);
    setPrograms(json.programs || {});
    setStats(json.stats || {});
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filterProgram]);

  const handleSearch = () => fetchData();

  const updateStatus = async (id: number, newStatus: string) => {
    await fetch("/api/admin/programs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setStatusMenuId(null);
    fetchData();
  };

  const deleteApp = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/programs?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAdd = async () => {
    if (!addForm.name.trim() || !addForm.phone.trim()) { alert("이름과 연락처는 필수입니다."); return; }
    const program = addForm.program || programKeys[0] || "spring-retreat-2026";
    setAddLoading(true);
    const res = await fetch("/api/admin/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addForm, program }),
    });
    setAddLoading(false);
    if (res.ok) {
      setShowAddModal(false);
      setAddForm({ name: "", phone: "", email: "", message: "", program: "", status: "confirmed" });
      fetchData();
    } else {
      const data = await res.json();
      alert(data.error || "추가 실패");
    }
  };

  // 필터링된 목록
  const filtered = filterStatus ? apps.filter((a) => a.status === filterStatus) : apps;

  // 프로그램 키 목록
  const programKeys = Object.keys(programs);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">프로그램 신청 관리</h1>
          <p className="text-sm text-gray-500 mt-1">프로그램별 신청자 현황을 관리합니다</p>
        </div>
        <button
          onClick={() => { setAddForm({ name: "", phone: "", email: "", message: "", program: filterProgram || programKeys[0] || "", status: "confirmed" }); setShowAddModal(true); }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-light transition-colors"
        >
          <Plus size={16} /> 수동 추가
        </button>
      </div>

      {/* 수동 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">신청자 수동 추가</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">프로그램</label>
              <select
                value={addForm.program || programKeys[0] || ""}
                onChange={(e) => setAddForm({ ...addForm, program: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {programKeys.map((key) => (
                  <option key={key} value={key}>{programs[key]?.label || key}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">이름 *</label>
                <input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="홍길동"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">연락처 *</label>
                <input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="010-1234-5678"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">이메일 (선택)</label>
              <input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="example@email.com"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">메모 (선택)</label>
              <textarea value={addForm.message} onChange={(e) => setAddForm({ ...addForm, message: e.target.value })} rows={2} placeholder="참가 동기, 특이사항 등"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">상태</label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAddForm({ ...addForm, status: opt.value })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                      addForm.status === opt.value ? opt.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={addLoading}
              className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {addLoading ? "추가 중..." : "신청자 추가"}
            </button>
          </div>
        </div>
      )}

      {/* 프로그램별 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {programKeys.map((key) => {
          const info = programs[key];
          const st = stats[key] || { total: 0, pending: 0, confirmed: 0, cancelled: 0 };
          const isSelected = filterProgram === key;
          return (
            <button
              key={key}
              onClick={() => setFilterProgram(isSelected ? "" : key)}
              className={`text-left rounded-2xl border p-5 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-gray-200 bg-white hover:shadow-md"
              }`}
            >
              <p className="font-bold text-gray-900 text-sm">{info.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-primary">{st.total}</span>
                <span className="text-sm text-gray-400">/ {info.maxCapacity}명</span>
              </div>
              {/* 진행바 */}
              <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((st.total / info.maxCapacity) * 100, 100)}%` }}
                />
              </div>
              <div className="flex gap-3 mt-3 text-xs">
                <span className="text-yellow-600">대기 {st.pending}</span>
                <span className="text-green-600">확정 {st.confirmed}</span>
                <span className="text-red-500">취소 {st.cancelled}</span>
              </div>
            </button>
          );
        })}

        {/* 전체 보기 카드 */}
        {programKeys.length > 1 && (
          <button
            onClick={() => setFilterProgram("")}
            className={`text-left rounded-2xl border p-5 transition-all ${
              !filterProgram
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-gray-200 bg-white hover:shadow-md"
            }`}
          >
            <p className="font-bold text-gray-900 text-sm">전체 프로그램</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-gray-700">
                {Object.values(stats).reduce((sum, s) => sum + s.total, 0)}
              </span>
              <span className="text-sm text-gray-400">명</span>
            </div>
          </button>
        )}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="이름 또는 연락처 검색..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">전체 상태</option>
            <option value="pending">대기</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* 신청자 목록 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">로딩 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm">신청자가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 카운트 */}
          <p className="text-xs text-gray-500">총 {filtered.length}건</p>

          {filtered.map((app) => {
            const st = getStatusStyle(app.status);
            const StIcon = st.icon;
            const isExpanded = expandedId === app.id;
            const progLabel = programs[app.program]?.label || app.program;

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
              >
                {/* 메인 행 */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : app.id)}
                >
                  {/* 상태 뱃지 */}
                  <span className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${st.color}`}>
                    <StIcon size={12} />
                    {st.label}
                  </span>

                  {/* 이름 & 연락처 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{app.name}</p>
                    <p className="text-xs text-gray-500">{app.phone}</p>
                  </div>

                  {/* 프로그램 */}
                  <span className="hidden sm:block text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                    {progLabel}
                  </span>

                  {/* 날짜 */}
                  <span className="text-xs text-gray-400 hidden sm:block">{formatDate(app.created_at)}</span>

                  <ChevronDown
                    size={16}
                    className={`text-gray-300 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>

                {/* 확장 상세 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} className="text-gray-400" />
                        <a href={`tel:${app.phone}`} className="hover:text-primary">{app.phone}</a>
                      </div>
                      {app.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <a href={`mailto:${app.email}`} className="hover:text-primary">{app.email}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Filter size={14} className="text-gray-400" />
                        {progLabel}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} className="text-gray-400" />
                        {formatDate(app.created_at)}
                      </div>
                    </div>

                    {app.message && (
                      <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                        <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">{app.message}</p>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setStatusMenuId(statusMenuId === app.id ? null : app.id); }}
                          className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                        >
                          상태 변경 <ChevronDown size={12} />
                        </button>
                        {statusMenuId === app.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden min-w-[120px]">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={(e) => { e.stopPropagation(); updateStatus(app.id, opt.value); }}
                                className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 flex items-center gap-2 ${
                                  app.status === opt.value ? "bg-gray-50" : ""
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${opt.color.split(" ")[0].replace("100", "500")}`} />
                                {opt.label}
                                {app.status === opt.value && <Check size={12} className="ml-auto text-primary" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteApp(app.id); }}
                        className="px-3 py-2 rounded-lg border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
