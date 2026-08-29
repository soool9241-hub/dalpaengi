"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  MessageCircle,
  Check,
  Share2,
  Network,
  CalendarDays,
  Coffee,
  Flame,
  HandHeart,
} from "lucide-react";
import Link from "next/link";

/* ───── 기수 정보 ─────
   월 1기수 오픈, 총 100명(5기수)까지. 다음 기수를 열 때 여기 네 개와
   api/membership/route.ts 의 PROGRAM / COHORT_LABEL / START_TEXT 를 같이 바꾼다. */
const COHORT_LABEL = "1기";
const START_TEXT = "2026년 10월 시작";
const MAX_CAPACITY = 20;
const TOTAL_CAP = 100;

const FEE = 300_000;
const MIN_MONTHS = 3;

const KAKAO_URL = "https://open.kakao.com/o/ssowhRlg";

/* 멤버십 전용 촬영본이 아직 없어 펜션 기존 사진을 쓴다.
   TODO(sol): 1기 빌더데이 진행 후 실제 현장 사진으로 교체 */
const IMG = {
  hero: "/img/living-room-wide.jpg",
  builder: "/img/group-indoor.jpg",
  lounge: "/img/living-tv.jpg",
  bbq: "/img/bbq-night.jpg",
  cta: "/img/campfire.jpg",
};

/* ───── 인프라 맵: 흔한 오해 vs 실제 ─────
   "1,000명"이 입장 커트라인으로 읽히면 지원 모수가 죽는다.
   그래서 페이지에서 가장 먼저 이 오해를 깬다. */
const MISREAD = [
  { label: "1,000명", wrong: "입회 최저 기준", right: "함께 지향하는 방향" },
  { label: "심사 대상", wrong: "보유 자산의 크기", right: "함께 상생하려는 마음" },
  { label: "안 맞는 경우", wrong: "팔로워가 적을 때", right: "내놓을 의사가 없을 때" },
];

/* ───── 공유하는 것 3가지 ───── */
const SHARE_ITEMS = [
  { icon: Network, title: "컨택포인트", desc: "내가 가진 연결 지점 — 고객·거래처·커뮤니티" },
  { icon: Share2, title: "트래픽 채널", desc: "인스타·블로그·유튜브·카톡방·뉴스레터" },
  { icon: HandHeart, title: "트래픽 쉐어", desc: "서로의 채널로 도달을 나눔" },
];

/* ───── 혜택 ─────
   0번은 혜택이 아니라 참여 원칙이라 별도 섹션에서 먼저 다루고,
   여기서는 1~6번만 카드로 보여준다. */
const BENEFITS = [
  {
    no: "01",
    icon: Sparkles,
    title: "AI 활용사례 레퍼런스 공유회",
    meta: "주 1회 · 온라인",
    desc: "지금 실제로 굴러가고 있는 AI 활용 사례를 매주 하나씩 뜯어봅니다. 이론이 아니라 돌아가는 것만.",
    accent: "text-violet-600 bg-violet-50 border-violet-100",
  },
  {
    no: "02",
    icon: CalendarDays,
    title: "사업시스템 개발 빌더데이",
    meta: "월 1회 · 오프라인 6시간",
    desc: "하루를 통째로 비워 내 사업 시스템을 실제로 만듭니다. 각자 노트북 켜고, 막히면 그 자리에서 같이 풉니다.",
    accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
    highlight: true,
  },
  {
    no: "03",
    icon: Users,
    title: "달팽이 공유회",
    meta: "부정기 · 멤버 발표",
    desc: "멤버가 자기 프로젝트의 진행 과정을 공유합니다. 결과 자랑이 아니라 지금 어디까지 왔고 뭐가 막혔는지를.",
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    no: "04",
    icon: Flame,
    title: "항아리 바베큐 모임 우선 좌석",
    meta: "멤버 15,000원",
    desc: "매달 열리는 항바모 좌석을 먼저 잡습니다. 멤버 요금으로 참여하실 수 있어요.",
    accent: "text-amber-600 bg-amber-50 border-amber-100",
    link: "/programs/bbq",
  },
  {
    no: "05",
    icon: Coffee,
    title: "달팽이 라운지 자유석",
    meta: "평일 09~18시 · 예약제",
    desc: "일하러 오셔도 됩니다. 소양 산속에서 하루 종일 작업하고 가시는 멤버가 생각보다 많아요.",
    accent: "text-teal-600 bg-teal-50 border-teal-100",
  },
  {
    no: "06",
    icon: MessageCircle,
    title: "제휴 공간",
    meta: "준비 중",
    desc: "달팽이아지트 밖에서도 쓰실 수 있는 공간을 늘리고 있습니다. 확정되는 대로 멤버에게 먼저 안내드립니다.",
    accent: "text-gray-500 bg-gray-50 border-gray-200",
    soon: true,
  },
];

/* ───── 공유회 두 종류 헷갈림 방지 ─────
   1번(인풋)과 3번(아웃풋)을 같은 "공유회"로 부르다 보니 문의가 예상된다. */
const SHARE_COMPARE = [
  { k: "누가", a: "대표 · 외부 사례", b: "멤버 본인" },
  { k: "무엇을", a: "AI 활용 레퍼런스", b: "내 프로젝트 진행과정" },
  { k: "얼마나", a: "주 1회 정기", b: "부정기" },
  { k: "성격", a: "받아가는 시간", b: "내놓고 점검받는 시간" },
];

/* ───── 항바모 요금 비교 ─────
   원가·마진은 내부 정보라 싣지 않는다. 멤버 요금이 왜 싼지는 굳이 설명하지 않음. */
const BBQ_FEES = [
  { label: "비회원", fee: "60,000원", dim: true },
  { label: "라이브 코드", fee: "50,000원", dim: true },
  { label: "멤버", fee: "15,000원", dim: false },
];

/* ───── 지원서에서 확인하는 것 ───── */
const APPLY_POINTS = [
  "현재 운영 중인 채널·커뮤니티와 대략의 규모",
  "멤버들에게 내놓을 수 있는 것 한 가지",
  "멤버십에서 받고 싶은 것 한 가지",
  "지금까지 남을 도와본 경험 한 가지",
];

/* ───── 지원 현황 훅 ───── */
function useMembershipStatus() {
  const [status, setStatus] = useState({
    cohort: COHORT_LABEL,
    max: MAX_CAPACITY,
    applied: 0,
    confirmed: 0,
    remaining: MAX_CAPACITY,
    closed: false,
  });
  useEffect(() => {
    fetch("/api/membership")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);
  return status;
}

/* ───── 지원서 폼 ───── */
function ApplyForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occupation, setOccupation] = useState("");
  const [region, setRegion] = useState("");
  const [channels, setChannels] = useState("");
  const [reach, setReach] = useState("");
  const [give, setGive] = useState("");
  const [want, setWant] = useState("");
  const [helped, setHelped] = useState("");
  const [howFound, setHowFound] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [doneModal, setDoneModal] = useState<{ show: boolean; waitlisted: boolean }>({
    show: false,
    waitlisted: false,
  });

  const submit = async () => {
    if (!name.trim()) return setResult({ ok: false, msg: "이름을 입력해주세요." });
    if (!phone.trim()) return setResult({ ok: false, msg: "연락처를 입력해주세요." });
    if (!occupation.trim()) return setResult({ ok: false, msg: "현재 하시는 일을 입력해주세요." });
    if (!region.trim()) return setResult({ ok: false, msg: "지역을 입력해주세요." });
    if (!channels.trim()) return setResult({ ok: false, msg: "운영 중인 채널을 적어주세요." });
    if (!give.trim()) return setResult({ ok: false, msg: "내놓을 수 있는 것을 적어주세요." });
    if (!want.trim()) return setResult({ ok: false, msg: "받고 싶은 것을 적어주세요." });
    if (!helped.trim()) return setResult({ ok: false, msg: "남을 도와본 경험을 적어주세요." });
    if (!privacyConsent) return setResult({ ok: false, msg: "개인정보 수집 동의에 체크해주세요." });

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, email, occupation, region,
          channels, reach, give, want, helped, howFound, privacyConsent,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setName(""); setPhone(""); setEmail(""); setOccupation(""); setRegion("");
        setChannels(""); setReach(""); setGive(""); setWant(""); setHelped("");
        setHowFound(""); setPrivacyConsent(false);
        setDoneModal({ show: true, waitlisted: data.waitlisted === true });
        setResult({
          ok: true,
          msg: data.waitlisted
            ? "다음 기수 우선 대상으로 등록되었습니다."
            : "지원서가 접수되었습니다. 3일 이내 연락드립니다.",
        });
      } else {
        setResult({ ok: false, msg: data.error || "접수 실패" });
      }
    } catch {
      setResult({ ok: false, msg: "네트워크 오류" });
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300";
  const labelClass = "text-xs font-semibold text-gray-600 block mb-1";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 접수 완료 모달 */}
      {doneModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white px-6 py-8 text-center">
              <p className="text-5xl mb-3">{doneModal.waitlisted ? "⏳" : "🐌"}</p>
              <p className="text-xl font-black">
                {doneModal.waitlisted ? "다음 기수 우선 대상" : "지원서가 접수되었습니다"}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-violet-50 rounded-2xl p-4 mb-4">
                <ul className="text-sm text-gray-700 space-y-2 leading-relaxed">
                  {doneModal.waitlisted ? (
                    <>
                      <li>• {COHORT_LABEL} 정원이 이미 채워졌습니다</li>
                      <li>• 다음 기수는 <span className="font-bold text-violet-600">한 달 뒤</span>에 열립니다</li>
                      <li>• 열리는 즉시 <span className="font-bold text-violet-600">가장 먼저</span> 안내드립니다</li>
                      <li>• 지원서는 그대로 유지되니 다시 쓰지 않으셔도 됩니다</li>
                    </>
                  ) : (
                    <>
                      <li>• 지원서를 읽고 <span className="font-bold text-violet-600">3일 이내</span> 연락드립니다</li>
                      <li>• 결과와 무관하게 <span className="font-bold text-violet-600">꼭 회신</span>드립니다</li>
                      <li>• <span className="font-bold text-violet-600">지금 입금하지 마세요</span> — 안내 후 결제입니다</li>
                      <li>• 입력하신 연락처로 문자가 발송되었어요</li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => setDoneModal({ show: false, waitlisted: false })}
                className="w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold text-base hover:bg-violet-700 transition-colors"
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* 기본 정보 */}
        <div>
          <p className="text-[11px] font-black text-violet-600 uppercase tracking-wider mb-3">기본 정보</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>이름 <span className="text-red-500">*</span></label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>연락처 <span className="text-red-500">*</span></label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>지역 <span className="text-red-500">*</span></label>
                <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="예: 전주시" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>이메일</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="선택" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>현재 하시는 일 <span className="text-red-500">*</span></label>
              <input value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="예: 온라인 쇼핑몰 운영 3년차" className={inputClass} />
            </div>
          </div>
        </div>

        {/* 인프라 맵 */}
        <div className="pt-1">
          <p className="text-[11px] font-black text-violet-600 uppercase tracking-wider mb-1">인프라 맵</p>
          <p className="text-xs text-gray-500 mb-3">
            크기로 심사하지 않습니다. 작아도 괜찮으니 있는 그대로 적어주세요.
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>운영 중인 채널·커뮤니티 <span className="text-red-500">*</span></label>
              <textarea
                value={channels} onChange={(e) => setChannels(e.target.value)} rows={3}
                placeholder="예: 인스타 @myshop 800명 / 단골 카톡방 120명 / 블로그 주 2회 발행"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>대략의 총 도달 규모 (명)</label>
              <input
                value={reach}
                onChange={(e) => setReach(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric" placeholder="예: 1200 (모르시면 비워두세요)"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 지원서 3문항 */}
        <div className="pt-1">
          <p className="text-[11px] font-black text-violet-600 uppercase tracking-wider mb-1">지원서</p>
          <p className="text-xs text-gray-500 mb-3">
            이 세 문항을 가장 눈여겨 봅니다. 길게 쓰지 않으셔도 됩니다.
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>
                1. 멤버들에게 <span className="text-violet-600 font-bold">내놓을 수 있는 것</span> 한 가지 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={give} onChange={(e) => setGive(e.target.value)} rows={3}
                placeholder="예: 쇼핑몰 상세페이지 카피를 봐드릴 수 있어요 / 우리 단골방에 소개해드릴 수 있어요"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>
                2. 멤버십에서 <span className="text-violet-600 font-bold">받고 싶은 것</span> 한 가지 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={want} onChange={(e) => setWant(e.target.value)} rows={3}
                placeholder="예: 주문 처리를 자동화하고 싶은데 어디부터 손대야 할지 모르겠어요"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>
                3. 지금까지 <span className="text-violet-600 font-bold">남을 도와본 경험</span> 한 가지 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={helped} onChange={(e) => setHelped(e.target.value)} rows={3}
                placeholder="예: 같은 업종 사장님께 거래처를 연결해드린 적이 있어요"
                className={`${inputClass} resize-none`}
              />
            </div>
            <div>
              <label className={labelClass}>달팽이 멤버십을 알게 된 경로</label>
              <input value={howFound} onChange={(e) => setHowFound(e.target.value)} placeholder="예: 항아리 바베큐 모임 / 온라인 라이브 / 지인 소개" className={inputClass} />
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox" checked={privacyConsent}
              onChange={(e) => setPrivacyConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500/20"
            />
            <span className="text-xs text-gray-600">
              <span className="font-bold text-red-500">*</span> 심사 및 안내 연락을 위한 개인정보 수집·이용에 동의합니다.
              지원서는 심사 목적으로만 사용되며 외부에 공개되지 않습니다.
            </span>
          </label>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-opacity disabled:opacity-50 bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90"
        >
          {loading ? "접수 중..." : "🐌 지원서 보내기"}
        </button>
        <p className="text-center text-[11px] text-gray-400">
          지금 결제하지 않습니다. 심사 후 안내드린 뒤 결제하시면 됩니다.
        </p>
        {result && (
          <p className={`text-center text-sm font-semibold ${result.ok ? "text-green-600" : "text-red-500"}`}>
            {result.msg}
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
export default function MembershipPage() {
  const status = useMembershipStatus();

  return (
    <main className="min-h-screen bg-white">
      {/* 상단 내비 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={16} /> 달팽이아지트
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={KAKAO_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 bg-[#FEE500] text-[#3C1E1E] px-3 py-2 rounded-full text-xs font-bold hover:brightness-95 transition-all"
            >
              <MessageCircle size={13} /> 문의
            </a>
            <a href="#apply" className="px-4 py-2 bg-violet-600 text-white rounded-full text-xs font-bold hover:bg-violet-700 transition-colors">
              지원하기
            </a>
          </div>
        </div>
      </div>

      {/* 히어로 */}
      <section className="relative min-h-[560px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG.hero} alt="달팽이 프라이빗 멤버십" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-violet-950/85 via-slate-950/80 to-slate-950/95" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-violet-300 text-sm font-bold tracking-widest uppercase mb-4">
            달팽이 프라이빗 멤버십 · {COHORT_LABEL}
          </p>
          <p className="text-6xl mb-5">🐌</p>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            내걸 내놓고
            <br />
            <span className="text-violet-300">입장하는</span> 멤버십
          </h1>
          <p className="text-base sm:text-lg text-white/70 mt-6 leading-relaxed">
            우리는 트래픽으로 단단해지길 원합니다.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Users size={14} /> 기수당 {MAX_CAPACITY}명
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <CalendarDays size={14} /> {START_TEXT}
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              <Clock size={14} /> 최소 {MIN_MONTHS}개월
            </div>
          </div>

          {/* 회비 */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-6 border border-white/20 max-w-sm mx-auto">
            <p className="text-[11px] font-black text-violet-300 tracking-widest uppercase">멤버십 회비</p>
            <p className="text-4xl font-black text-white mt-2">
              월 {FEE.toLocaleString("ko-KR")}
              <span className="text-lg font-bold">원</span>
            </p>
            <p className="text-xs text-white/50 mt-2">
              최소 {MIN_MONTHS}개월 · 총 {TOTAL_CAP}명까지만
            </p>
            <div className="mt-4 pt-4 border-t border-white/15">
              <p className="text-xs text-white/60">
                {COHORT_LABEL} 현재{" "}
                <span className="font-black text-violet-300">
                  {status.confirmed}/{status.max}명
                </span>{" "}
                확정
              </p>
            </div>
          </div>

          <a
            href="#apply"
            className="mt-7 inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full font-black text-base hover:opacity-90 transition-opacity shadow-lg shadow-violet-900/40"
          >
            지원서 쓰기 <ArrowRight size={16} />
          </a>
          <p className="text-[11px] text-white/40 mt-3">지원 후 심사가 있습니다 · 결제는 심사 뒤에</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-24">
        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            혼자 모은 <span className="font-black text-violet-600">1,000명</span>은
            <br className="sm:hidden" /> 혼자 쓰면 1,000명입니다.
          </p>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium mt-4">
            그런데 스무 명이 각자 가진 걸 내놓으면
            <br />
            <span className="font-black text-violet-600">2만 명</span>이 됩니다.
          </p>
          <p className="text-sm text-gray-500 mt-6 leading-relaxed">
            이 멤버십은 배우러 오는 곳이 아니라, 각자 가진 걸 합쳐서
            <br className="hidden sm:block" /> 서로의 도달을 키우는 곳입니다.
          </p>
        </section>

        {/* 참여 원칙 — 오해 깨기 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">참여 원칙</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              인프라 맵 쉐어는 <span className="text-violet-600">자격 컷오프가 아닙니다</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">가장 많이 오해하시는 부분이라 먼저 말씀드려요</p>
          </div>

          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-3 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-wider">항목</div>
              <div className="px-3 py-2.5 text-[11px] font-black text-gray-400 uppercase tracking-wider">이렇게 아시지만</div>
              <div className="px-3 py-2.5 text-[11px] font-black text-violet-600 uppercase tracking-wider">실제로는</div>
            </div>
            {MISREAD.map((m, i) => (
              <div key={i} className={`grid grid-cols-3 items-center ${i > 0 ? "border-t border-gray-100" : ""}`}>
                <div className="px-3 py-4 text-sm font-bold text-gray-900">{m.label}</div>
                <div className="px-3 py-4 text-xs text-gray-400 line-through">{m.wrong}</div>
                <div className="px-3 py-4 text-sm font-bold text-violet-600">{m.right}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-violet-50 border border-violet-100 rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-gray-800 font-bold leading-relaxed">
              확인하는 건 하나입니다.
              <br />
              <span className="text-violet-700">
                자기가 가진 인맥 풀을 공유해서 함께 가겠다는 마음이 있는가.
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              채널이 작아도 내놓을 의사가 있으면 들어옵니다.
              <br />
              크더라도 받기만 하려는 분과는 맞지 않습니다.
            </p>
          </div>
        </section>

        {/* 공유하는 것 3가지 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">WHAT WE SHARE</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              함께 나누는 <span className="text-violet-600">3가지</span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {SHARE_ITEMS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 text-center hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mx-auto">
                    <Icon size={20} className="text-violet-600" />
                  </div>
                  <p className="font-black text-gray-900 text-sm mt-3">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 지향치 */}
          <div className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white text-center">
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">우리가 지향하는 숫자</p>
            <div className="flex items-center justify-center gap-3 sm:gap-5 mt-4 flex-wrap">
              <div>
                <p className="text-2xl sm:text-3xl font-black">1,000명</p>
                <p className="text-[11px] text-white/60 mt-0.5">1인</p>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white/40">×</span>
              <div>
                <p className="text-2xl sm:text-3xl font-black">{MAX_CAPACITY}명</p>
                <p className="text-[11px] text-white/60 mt-0.5">기수</p>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white/40">=</span>
              <div>
                <p className="text-3xl sm:text-4xl font-black text-violet-200">2만 명</p>
                <p className="text-[11px] text-white/60 mt-0.5">함께 닿는 곳</p>
              </div>
            </div>
            <p className="text-xs text-white/60 mt-5">
              목표선이지 입장권이 아닙니다. 함께 키워가는 숫자예요.
            </p>
          </div>
        </section>

        {/* 혜택 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">MEMBER BENEFITS</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              멤버가 되면 <span className="text-violet-600">받는 것</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">월 {FEE.toLocaleString("ko-KR")}원에 전부 포함됩니다</p>
          </div>

          <div className="space-y-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.no}
                  className={`rounded-2xl border p-5 transition-all ${
                    b.highlight ? "border-indigo-200 bg-indigo-50/40 shadow-sm" : "border-gray-200 bg-white"
                  } ${b.soon ? "opacity-70" : "hover:shadow-md"}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${b.accent}`}>
                      <Icon size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-300 tracking-widest">{b.no}</span>
                        <p className="font-black text-gray-900 text-sm sm:text-base">{b.title}</p>
                        {b.soon && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full text-[10px] font-bold">
                            커밍쑨
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-violet-600 mt-1">{b.meta}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">{b.desc}</p>
                      {b.link && (
                        <Link href={b.link} className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 mt-2">
                          항바모 보러가기 <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 빌더데이 */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl border border-indigo-200 overflow-hidden">
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img src={IMG.builder} alt="빌더데이" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/85 via-indigo-950/30 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-[11px] font-black text-indigo-200 uppercase tracking-widest">가장 큰 혜택</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">빌더데이</p>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-indigo-700 font-black text-xs">
                월 1회 · 6시간
              </div>
            </div>
            <div className="p-5 sm:p-6 bg-indigo-50/40">
              <p className="text-sm text-gray-700 leading-relaxed">
                하루를 통째로 비워서 내 사업 시스템을 <span className="font-bold text-indigo-700">실제로 만드는 날</span>입니다.
                강의를 듣는 게 아니라 각자 노트북을 켜고 만들다가, 막히면 그 자리에서 같이 풉니다.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-5">
                <div className="bg-white rounded-xl p-3 text-center border border-indigo-100">
                  <p className="text-lg font-black text-indigo-700">6시간</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">한 번에</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-indigo-100">
                  <p className="text-lg font-black text-indigo-700">월 1회</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">정기 진행</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-indigo-100">
                  <p className="text-lg font-black text-indigo-700">최대 60명</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">공간 한도</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                💡 신청이 60명을 넘기면 월 2회로 나눠서 진행합니다. 자리가 좁아 못 오시는 일은 없게 합니다.
              </p>
            </div>
          </div>
        </section>

        {/* 공유회 두 종류 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">헷갈리기 쉬운 부분</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              공유회가 <span className="text-violet-600">두 개</span>입니다
            </h2>
            <p className="text-sm text-gray-500 mt-2">이름은 비슷하지만 방향이 반대예요</p>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-3 py-3" />
              <div className="px-3 py-3 text-xs font-black text-violet-600 leading-tight">
                레퍼런스 공유회
                <span className="block text-[10px] font-bold text-gray-400 mt-0.5">받아가는 시간</span>
              </div>
              <div className="px-3 py-3 text-xs font-black text-emerald-600 leading-tight">
                달팽이 공유회
                <span className="block text-[10px] font-bold text-gray-400 mt-0.5">내놓는 시간</span>
              </div>
            </div>
            {SHARE_COMPARE.map((r, i) => (
              <div key={i} className={`grid grid-cols-3 items-center ${i > 0 ? "border-t border-gray-100" : ""}`}>
                <div className="px-3 py-3.5 text-[11px] font-bold text-gray-400 uppercase">{r.k}</div>
                <div className="px-3 py-3.5 text-xs sm:text-sm text-gray-700">{r.a}</div>
                <div className="px-3 py-3.5 text-xs sm:text-sm font-semibold text-gray-900">{r.b}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 항바모 멤버 요금 */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl border border-amber-200 overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img src={IMG.bbq} alt="항아리 바베큐 모임" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/85 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-[11px] font-black text-amber-200 uppercase tracking-widest">멤버 혜택 04</p>
                <p className="text-lg font-black text-white mt-1">🍖 항아리 바베큐 모임</p>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-sm text-gray-700 leading-relaxed mb-5">
                매달 열리는 항아리 바베큐 모임에 <span className="font-bold text-amber-600">멤버 요금</span>으로,
                좌석도 먼저 잡으실 수 있습니다.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {BBQ_FEES.map((f) => (
                  <div
                    key={f.label}
                    className={`rounded-xl p-3 text-center border ${
                      f.dim ? "bg-gray-50 border-gray-200" : "bg-amber-500 border-amber-500 shadow-md"
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${f.dim ? "text-gray-400" : "text-white/80"}`}>{f.label}</p>
                    <p className={`text-base sm:text-lg font-black mt-1 ${f.dim ? "text-gray-400 line-through" : "text-white"}`}>
                      {f.fee}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/programs/bbq"
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-amber-500/10 text-amber-700 font-bold text-sm hover:bg-amber-600 hover:text-white transition-colors"
              >
                항아리 바베큐 모임 보기 <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* 라운지 */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl border border-teal-200 overflow-hidden">
            <div className="relative h-40 overflow-hidden">
              <img src={IMG.lounge} alt="달팽이 라운지" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/85 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-[11px] font-black text-teal-200 uppercase tracking-widest">멤버 혜택 05</p>
                <p className="text-lg font-black text-white mt-1">☕ 달팽이 라운지 자유석</p>
              </div>
            </div>
            <div className="p-5 sm:p-6 flex flex-wrap items-center gap-3 justify-between">
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  평일 낮에 일하러 오셔도 됩니다. 소양 산속에서 하루 종일 작업하고 가시는 멤버가 많아요.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-xs font-bold text-teal-700">
                  평일 09~18시
                </span>
                <span className="px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-xs font-bold text-teal-700">
                  예약제
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 지원 절차 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">HOW TO JOIN</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              들어오시는 <span className="text-violet-600">순서</span>
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { n: "1", t: "지원서 작성", d: "아래 폼을 채워주세요. 5분이면 충분합니다.", tone: "violet" },
              { n: "2", t: "심사 · 3일 이내 연락", d: "결과와 무관하게 꼭 회신드립니다.", tone: "violet" },
              { n: "3", t: "안내 후 결제", d: `월 ${FEE.toLocaleString("ko-KR")}원 · 최소 ${MIN_MONTHS}개월`, tone: "violet" },
              { n: "4", t: "인프라 맵 등록 · 입장", d: "내 채널을 맵에 올리면서 시작합니다.", tone: "indigo" },
            ].map((s) => (
              <div key={s.n} className="flex items-start gap-4 bg-white rounded-2xl border border-gray-200 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm text-white ${
                  s.tone === "indigo" ? "bg-indigo-600" : "bg-violet-600"
                }`}>
                  {s.n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm">{s.t}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-3">지원서에서 여쭙는 것</p>
            <ul className="space-y-2">
              {APPLY_POINTS.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={15} className="text-violet-600 flex-shrink-0 mt-0.5" /> {p}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              💡 <span className="font-bold text-gray-700">내놓을 수 있는 것</span>과{" "}
              <span className="font-bold text-gray-700">받고 싶은 것</span>의 균형을 봅니다.
              받고 싶은 것만 길고 내놓을 것이 비어 있으면, 이 멤버십과는 잘 맞지 않습니다.
            </p>
          </div>
        </section>

        {/* 지원서 */}
        <section id="apply" className="pb-12 sm:pb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-2">APPLY</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {COHORT_LABEL} <span className="text-violet-600">지원서</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {START_TEXT} · 정원 {MAX_CAPACITY}명 · 현재 확정{" "}
              <span className="font-black text-violet-600">
                {status.confirmed}/{status.max}명
              </span>
            </p>
          </div>
          <ApplyForm />
        </section>

        {/* 운영 안내 */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">회비</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  <span className="text-violet-600 text-lg font-black">월 {FEE.toLocaleString("ko-KR")}원</span>
                </p>
                <p className="text-xs text-gray-500">최소 {MIN_MONTHS}개월</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">정원</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">기수당 {MAX_CAPACITY}명</p>
                <p className="text-xs text-gray-500">총 {TOTAL_CAP}명까지</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">기수 오픈</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">월 1기수</p>
                <p className="text-xs text-gray-500">{COHORT_LABEL} — {START_TEXT}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">장소</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">달팽이아지트</p>
                <p className="text-xs text-gray-500">전북 완주군 소양면 해월신왕길 92</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">참고사항</p>
              <ul className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
                <li>🐌 지원 후 심사가 있습니다. 결과와 무관하게 3일 이내 회신드립니다.</li>
                <li>💳 결제는 심사 통과 안내를 받으신 뒤에 진행합니다.</li>
                <li>🤝 입회 시 인프라 맵에 본인 채널을 등록해주셔야 합니다.</li>
                <li>📅 기수는 월 1회 열리며, 정원이 차면 다음 기수 우선 대상으로 접수됩니다.</li>
                <li>🚗 오프라인 일정(빌더데이·라운지)은 완주 달팽이아지트에서 진행됩니다.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-8">
          <div className="relative rounded-2xl overflow-hidden">
            <img src={IMG.cta} alt="달팽이아지트" className="w-full h-64 sm:h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-violet-950/70 to-violet-950/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="text-4xl mb-3">🐌</p>
              <p className="text-xl sm:text-2xl font-black text-white leading-snug">
                받으러 오는 사람이 아니라
                <br />
                <span className="text-violet-300">내놓으러 오는 사람</span>만 모입니다
              </p>
              <p className="text-sm text-white/60 mt-3">
                {COHORT_LABEL} {MAX_CAPACITY}명 · {START_TEXT}
              </p>
              <a
                href="#apply"
                className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-violet-700 rounded-full font-black text-base hover:bg-violet-50 transition-colors shadow-lg"
              >
                지원서 쓰기 <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
