"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Phone,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
  Train,
} from "lucide-react";
import Link from "next/link";

/* ───── 타임테이블 데이터 ───── */
const DAY1 = [
  { time: "14:00", label: "집결 & 체크인", icon: "🏡" },
  { time: "15:00~17:00", label: "움직임으로 감각 깨우기 (스트레칭·바디스캔·뮤직샤워)", icon: "💪", tag: "마루", color: "bg-green-100 text-green-800" },
  { time: "17:00~19:00", label: "실행을 만드는 계획 설계 (게이미피케이션, 만다라트)", icon: "🎯", tag: "세경", color: "bg-blue-100 text-blue-800" },
  { time: "19:00~20:30", label: "저녁식사", icon: "🍽" },
  { time: "21:00~23:00", label: "삶의 방향 점검 & 자애명상 (1대1 대화, 자애명상)", icon: "🧭", tag: "붓꽃", color: "bg-purple-100 text-purple-800" },
];

const DAY2 = [
  { time: "07:00", label: "아침식사", icon: "☀️" },
  { time: "08:00~09:00", label: "모닝페이지, 감사일기 (글쓰기로 비우고 감사로 채우기)", icon: "🌱", tag: "잎새", color: "bg-amber-100 text-amber-800" },
  { time: "09:00~11:00", label: "아침 산책 & 신체놀이 (바디스캔, 젠가, 테니스공 놀이)", icon: "🚶", tag: "마루", color: "bg-green-100 text-green-800" },
  { time: "11:00", label: "정리 후 마무리 & 체크아웃", icon: "👋" },
];

/* ───── 프로그램 상세 ───── */
const PROGRAMS = [
  {
    num: 1,
    title: "움직임으로 감각 깨우기",
    sub: "스트레칭 · 바디스캔 · 뮤직샤워로 오감을 깨우는 시간",
    leader: "마루",
    time: "첫째날 15:00~17:00",
    img: "/img/program-1.jpg",
    desc: "오감에 집중하여 움직이고, 밖에서 들어오는 자극을 감지하여 환경을 이해하는 감각을 느껴보는 활동",
    details: [
      "스트레칭 & 아이스브레이킹",
      "공간탐색 · 사람탐색",
      "바디스캔 (외부감각)",
      "감각깨우기 & 눈 감고 걷기",
      "뮤직샤워",
    ],
  },
  {
    num: 2,
    title: "실행을 만드는 계획 설계 워크숍",
    sub: "게이미피케이션 × 만다라트로 올해의 실행 계획 만들기",
    leader: "세경",
    time: "첫째날 17:00~19:00",
    img: "/img/program-2.jpg",
    desc: "게이미피케이션과 만다라트 기법을 결합하여, 올해의 목표를 구체적인 실행 계획으로 만들어가는 워크숍",
    details: [
      "게이미피케이션 기반 목표 설정",
      "만다라트 기법으로 세부 목표 분해",
      "참가자들과 계획 나눔",
      "실행 가능한 액션 플랜 도출",
    ],
  },
  {
    num: 3,
    title: "삶의 방향 점검 & 자애명상",
    sub: "6가지 질문, 1대1대화로 내 삶의 나침반을 찾는 시간",
    leader: "붓꽃",
    time: "첫째날 21:00~23:00",
    img: "/img/program-3.jpg",
    desc: "OECD 자기주도적 학습 성찰 질문을 통해 내 삶의 방향을 점검하고, 진솔한 대화로 마음을 열어가는 시간",
    details: [
      "블롭트리 그림으로 이야기 나누기",
      "6가지 질문 카드",
      "생각 정리 시간",
      "듣기와 대화 명상 — 공감과 경청",
      "자애명상으로 마무리",
    ],
  },
  {
    num: 4,
    title: "모닝페이지, 감사일기",
    sub: "글쓰기로 비우고 감사로 채우기",
    leader: "잎새",
    time: "둘째날 08:00~09:00",
    img: "/img/program-4.jpg",
    desc: "지난 밤 소화한 일들이 무의식에 어떻게 남겨졌는지 풀어보고, 지금 내 주위의 모든 것에 진심으로 감사하는 시간",
    details: [
      "모닝페이지 — 아침 자유 글쓰기",
      "감사일기 작성",
    ],
  },
  {
    num: 5,
    title: "아침 산책 & 신체놀이",
    sub: "바디스캔, 젠가, 테니스공 놀이로 몸 안의 감각 탐색",
    leader: "마루",
    time: "둘째날 09:00~11:00",
    img: "/img/program-5.jpg",
    desc: "아침 산책과 함께 몸을 깨우고, 바디스캔과 신체놀이로 몸 안의 감각을 탐색하는 활동",
    details: [
      "걷고 뛰는 바디스캔 (내부감각)",
      "눈 감고 걷기 — 외부→내부 감각 전환",
      "젠가를 활용한 신체놀이",
      "테니스 공을 활용한 신체놀이",
      "마무리 바디스캔",
    ],
  },
];

/* ───── 이끄미 데이터 ───── */
const LEADERS = [
  {
    name: "마루",
    role: "움직임 · 아침 산책 · 신체놀이 담당",
    emoji: "💪",
    color: "bg-green-50 border-green-200",
    tagColor: "bg-green-100 text-green-800",
    img: "/img/leader-maru.jpg",
    desc: "함께 움직이는 즐거움을 나누고자 움직임 소모임 MROOM을 운영하고 있습니다. 몸의 감각을 깨우고, 타인과 연결되는 경험을 안내합니다.",
    programs: ["움직임으로 감각 깨우기", "아침 산책 & 신체놀이"],
  },
  {
    name: "세경",
    role: "커뮤니케이션 전문가 · 워크숍 담당",
    emoji: "🎯",
    color: "bg-blue-50 border-blue-200",
    tagColor: "bg-blue-100 text-blue-800",
    img: "/img/leader-sekyung.jpg",
    desc: "13년 방송 경험과 10년 이상의 스피치 코칭을 바탕으로 말과 구조를 통해 '생각을 실행으로 바꾸는' 커뮤니케이션 전문가. 면접, 조직 커뮤니케이션, 리더 스피치까지 현장에서 바로 적용되는 실전형 교육을 진행하고 있습니다.",
    programs: ["실행을 만드는 계획 설계 워크숍"],
  },
  {
    name: "붓꽃",
    role: "상담심리사 · 붓꽃 심리상담소 운영",
    emoji: "🧭",
    color: "bg-purple-50 border-purple-200",
    tagColor: "bg-purple-100 text-purple-800",
    img: "/img/leader-yejin.jpg",
    desc: "붓꽃 심리상담소를 운영하고 있습니다. 자신을 이해하고 사랑하며, 삶의 방향을 찾아가는 여정을 함께합니다. 조용하지만 깊은 대화와 마음챙김의 시간을 나눕니다.",
    programs: ["삶의 방향 점검 & 자애명상"],
  },
  {
    name: "잎새",
    role: "모닝페이지 · 감사일기 · 저널링 담당",
    emoji: "🌱",
    color: "bg-amber-50 border-amber-200",
    tagColor: "bg-amber-100 text-amber-800",
    img: "/img/leader-ipsae.jpg",
    desc: "내 안에서 일어나는 일들을 탐구하고 질문합니다. 꿈, 자유, 안정, 공간을 키워드로 올해 새로운 터닝포인트를 만들기 위한 다양한 실험을 하고 있습니다.",
    programs: ["모닝페이지 & 감사일기"],
  },
];

/* ───── 5단계 과정 데이터 ───── */
const MAIN_PROGRAMS = [
  { num: 1, title: "움직임으로 감각 깨우기", tag: "스트레칭 · 바디스캔 · 뮤직샤워", desc: "오감에 집중하며 몸을 움직여, 굳어 있던 감각을 다시 열어갑니다", emoji: "✨", color: "bg-green-50 border-green-200 text-green-700", img: "/img/program-1.jpg" },
  { num: 2, title: "실행을 만드는 계획 설계 워크숍", tag: "만다라트 · 게이미피케이션 워크숍", desc: "꿈으로 끝나던 목표를, 구체적인 실행 계획으로 만들어갑니다", emoji: "🎯", color: "bg-blue-50 border-blue-200 text-blue-700", img: "/img/program-2.jpg" },
  { num: 3, title: "삶의 방향 점검 & 자애명상", tag: "1대1 대화 · 자애명상", desc: "낯선 사람과 솔직한 이야기를 나누고, 자애명상으로 서로를 비춥니다", emoji: "🌙", color: "bg-purple-50 border-purple-200 text-purple-700", img: "/img/program-3.jpg" },
  { num: 4, title: "모닝페이지 & 감사일기", tag: "아침 자유 글쓰기 · 감사일기", desc: "아침 자유 글쓰기로 머릿속을 비우고, 감사일기로 다시 중심을 잡습니다", emoji: "🌅", color: "bg-amber-50 border-amber-200 text-amber-700", img: "/img/program-4.jpg" },
  { num: 5, title: "아침 산책 & 신체놀이", tag: "바디스캔 · 젠가 · 테니스공 놀이", desc: "아침 산책과 함께 몸을 깨우고, 신체놀이로 몸 안의 감각을 탐색합니다", emoji: "🍃", color: "bg-emerald-50 border-emerald-200 text-emerald-700", img: "/img/program-5.jpg" },
];

/* ───── 컴포넌트 ───── */
function ProgramAccordion({ p }: { p: typeof PROGRAMS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      <button onClick={() => setOpen(!open)} className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4">
        <span className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
          {p.num}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-lg">{p.title}</p>
          <p className={`text-sm sm:text-base text-gray-500 ${open ? "" : "line-clamp-2"}`}>{p.sub}</p>
        </div>
        <span className="text-sm text-primary font-semibold whitespace-nowrap hidden sm:block">{p.leader}</span>
        {open ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 border-t border-gray-100 pt-5 animate-fade-in">
          {p.img && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img src={p.img} alt={p.title} className="w-full h-48 sm:h-56 object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Clock size={14} /> {p.time} <span className="ml-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">{p.leader}</span>
          </div>
          <p className="text-base text-gray-700 mb-4 leading-relaxed">{p.desc}</p>
          <ul className="space-y-2.5">
            {p.details.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-base text-gray-600">
                <span className="text-primary mt-0.5">&#x2022;</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───── 후기 텍스트 슬라이더 ───── */
const REVIEWS = [
  {
    name: "머리 빗는 네오",
    text: "살짜기 금빛 들판에 석양을 바라보며 서울로 올라갑니다. 행사 기획부터 진행까지 수고해주신 기획자 분들께 깊이 감사드립니다. 좋은 강의해주신 분들께도 감사드립니다. 참여하기를 잘 했다는 저만의 생각입니다. 젊은 어른분들에게 작은 것을 배우고 가는, 모포족은 이번에 갈이 하신 모든 분들이 안하면, 정말 행복하고, 평화로우시기를 기원합니다.",
  },
  {
    name: "눈빛 예고 어피치",
    text: "각자의 인생에 대해 들을 수 있어서 좋았어요~ 부모로서 제가 가진 불안도 들어다볼 수 있었고, 무엇보다 새벽까지 수다 떤 님 오랜만에 해봐서 좋았어요 ♥ 이런 좋은 프로그램 기획해주신 달팽이님들게 감사해용~^^ 이제 일상으로 돌아가서 명상하며 불안을 잘 다스리며 생활하겠습니다~",
  },
  {
    name: "피스메이커 프로도",
    text: "불편함 없이 너무 잘 쉬다 돌아갑니다. 애써주신 분들 챙겨주신 분들 전해주신 마음 모두 감사합니다. 일상으로 돌아가서도 나눠주신 에너지로 잘 살아가 볼게요 ♥",
  },
  {
    name: "불나게 일하는 네오",
    text: "좋은 프로그램 마련해주시고 함께 해주셔서 감사합니다. 명상 요가 산책 맛있는 식사 정말 힐링 그 자체였어요. 일상으로 돌아가서 신선한 마음 간직하며 하루하루 즐겁게 생활하도록 하겠습니다^^",
  },
  {
    name: "봄 풍는 튜브",
    text: "이런 자리 기획하고 만들어주신 달팽이 부부님 감사해요 ♡♡ OO님 첫 문장처럼 축복이라는 단어가 가득한 시간이었네요! 명상과 싱잉볼, 삶의 그릇 덕분에 많은 행복을 되찾은 개적인 경험이 있어서 그런지 곁에서 관심 가져주시는 분들 보면 제가 사나고 기분도 좋아요~",
  },
  {
    name: "씩씩거리는 무지",
    text: "완주를 벗어나니 바로 현실이더라고요? 1박 2일 힐링캠프가 벌써 아련하게 느껴집니다. 하지만, 어제 오늘 배운 것들을 일상생활에서 실천할 수 있는 리스트를 제 스스로 정해봤어요! 혼자 갔지만 혼자일 틈이 없게 만들어주신 모든 분들 진심으로 감사했습니다.",
  },
];

function ReviewSlider() {
  const [current, setCurrent] = useState(0);
  const total = REVIEWS.length;
  const touchStart = useRef(0);

  const next = () => setCurrent((c) => (c + 1) % total);
  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));

  return (
    <section className="pb-12 sm:pb-16">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-2">참가자 후기</h2>
      <p className="text-sm text-gray-500 text-center mb-8">지난 리트릿에 참가한 분들의 실제 후기입니다</p>
      <div className="relative"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (diff > 50) next();
          else if (diff < -50) prev();
        }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 min-h-[200px] flex flex-col justify-between shadow-sm">
          <div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">&ldquo;{REVIEWS[current].text}&rdquo;</p>
          </div>
          <p className="text-sm font-bold text-primary mt-4">— {REVIEWS[current].name}</p>
        </div>
        <button onClick={prev} className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
          <ChevronLeft size={16} className="text-gray-700" />
        </button>
        <button onClick={next} className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
          <ChevronRight size={16} className="text-gray-700" />
        </button>
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary scale-125" : "bg-gray-300"}`} />
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">{current + 1} / {total}</p>
      </div>
    </section>
  );
}

/* ───── 신청 폼 ───── */
function ApplyForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [reason, setReason] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [transport, setTransport] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [waitlistModal, setWaitlistModal] = useState<{ show: boolean; number: number }>({ show: false, number: 0 });

  const submit = async () => {
    if (!name.trim()) { setResult({ ok: false, msg: "이름을 입력해주세요." }); return; }
    if (!phone.trim()) { setResult({ ok: false, msg: "연락처를 입력해주세요." }); return; }
    if (!age.trim()) { setResult({ ok: false, msg: "나이를 입력해주세요." }); return; }
    if (!gender) { setResult({ ok: false, msg: "성별을 선택해주세요." }); return; }
    if (!occupation.trim()) { setResult({ ok: false, msg: "현재 하시는 일을 입력해주세요." }); return; }
    if (!reason.trim()) { setResult({ ok: false, msg: "신청 이유를 입력해주세요." }); return; }
    if (!region.trim()) { setResult({ ok: false, msg: "지역을 입력해주세요." }); return; }
    if (!transport) { setResult({ ok: false, msg: "이동 방법을 선택해주세요." }); return; }
    if (!photoConsent) { setResult({ ok: false, msg: "촬영 동의에 체크해주세요." }); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/programs/retreat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, age, gender, occupation, reason, photoConsent, transport, region }),
      });
      const data = await res.json();
      console.log("[봄 리트릿 신청 응답]", data);

      if (res.ok && data.success) {
        // 폼 초기화
        setName(""); setPhone(""); setAge(""); setGender(""); setOccupation(""); setReason(""); setPhotoConsent(false); setTransport(""); setRegion("");

        if (data.waitlisted === true) {
          // 🔒 마감 → 대기자 등록 → 모달 + 폴백 메시지
          const num = Number(data.waitlistNumber) || 1;
          setWaitlistModal({ show: true, number: num });
          setResult({ ok: true, msg: `🌸 아쉽게도 마감되었습니다! 대기자 ${num}번으로 등록되었어요.` });
        } else {
          // 정상 신청 완료
          setResult({ ok: true, msg: "신청이 완료되었습니다! 확인 문자가 발송됩니다." });
        }
      } else {
        setResult({ ok: false, msg: data.error || "신청 실패" });
      }
    } catch (err) {
      console.error("[봄 리트릿 신청 에러]", err);
      setResult({ ok: false, msg: "네트워크 오류" });
    }
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* 마감 안내 모달 */}
      {waitlistModal.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-slide-up">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white px-6 py-8 text-center">
              <div className="text-5xl mb-3">🌸</div>
              <p className="text-xs font-bold tracking-widest opacity-90 mb-1">SOLD OUT</p>
              <h3 className="text-2xl font-black">아쉽게도 마감되었어요</h3>
              <p className="text-sm text-white/90 mt-2">20명 선착순이 이미 채워졌습니다</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 text-center">
                <p className="text-xs font-bold text-rose-600 tracking-wide mb-1">대기자 번호</p>
                <p className="text-5xl font-black text-rose-600">{waitlistModal.number}<span className="text-2xl">번</span></p>
                <p className="text-xs text-gray-500 mt-2">대기자 명단에 등록 완료 ✅</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-gray-900">🌿 이렇게 진행됩니다</p>
                <ul className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  <li>• 취소자 발생 시 <span className="font-bold text-rose-600">순번대로</span> 연락드립니다</li>
                  <li>• 다음 회차 진행 시 <span className="font-bold text-rose-600">가장 먼저</span> 안내드립니다</li>
                  <li>• 입력하신 연락처로 문자가 발송되었어요</li>
                </ul>
              </div>
              <p className="text-xs text-center text-gray-500">관심 가져주셔서 진심으로 감사합니다 🙏</p>
              <button
                onClick={() => setWaitlistModal({ show: false, number: 0 })}
                className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-base hover:bg-primary-light transition-colors"
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 space-y-4">
        {true ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">이름 <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">연락처 <span className="text-red-500">*</span></label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">나이 <span className="text-red-500">*</span></label>
                <input value={age} onChange={e => setAge(e.target.value)} placeholder="예: 28" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">성별 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  {["남성", "여성"].map((g) => (
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        gender === g ? "border-primary bg-primary/10 text-primary" : "border-gray-200 text-gray-400 hover:bg-gray-50"
                      }`}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">현재 하시는 일 <span className="text-red-500">*</span></label>
              <input value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="예: 프리랜서 강사" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">신청 이유 / 기대하는 점 <span className="text-red-500">*</span></label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                placeholder="리트릿에 참가하고 싶은 이유나 기대하는 점을 자유롭게 적어주세요."
                className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">지역 (시/군 단위) <span className="text-red-500">*</span></label>
              <input value={region} onChange={e => setRegion(e.target.value)} placeholder="예: 완주군" className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">이동 방법 <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "전주고속터미널", label: "뚜벅이전용 — 전주고속터미널", time: "13:30", pickup: true },
                  { value: "전주역", label: "뚜벅이전용 — 전주역", time: "14:00", pickup: true },
                  { value: "자차", label: "개별이동 — 자차이용", time: "14:30", pickup: false },
                ].map((t) => (
                  <button key={t.value} type="button" onClick={() => setTransport(t.value)}
                    className={`w-full rounded-xl border-2 transition-all text-left overflow-hidden ${
                      transport === t.value ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        transport === t.value ? "border-primary bg-primary" : "border-gray-300"
                      }`}>
                        {transport === t.value && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${transport === t.value ? "text-primary" : "text-gray-700"}`}>{t.label}</p>
                        {t.time && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold">⏰ {t.time} 집결</span>
                            {t.pickup ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold">🚐 카니발 픽업</span>
                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold">🏡 펜션 집결</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {(transport === "전주역" || transport === "전주고속터미널") && (
                <div className="mt-2 p-3 bg-gradient-to-r from-primary/10 to-amber-50 border border-primary/30 rounded-xl">
                  <p className="text-sm font-black text-primary">🚐 카니발로 친절히 모시러 갑니다!</p>
                  <p className="text-xs text-gray-600 mt-1"><span className="font-bold text-amber-600">{transport}</span>에서 <span className="font-bold text-amber-600">{transport === "전주고속터미널" ? "13:30" : "14:00"}</span>에 집결 — 확정 후 상세 안내 드립니다</p>
                </div>
              )}
            </div>
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={photoConsent} onChange={e => setPhotoConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20" />
                <span className="text-xs text-gray-600">
                  <span className="font-bold text-red-500">*</span> 리트릿 중 촬영되는 사진/영상이 홍보 목적으로 활용될 수 있음에 동의합니다. (필수)
                </span>
              </label>
            </div>
            <button onClick={submit} disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-base transition-colors disabled:opacity-50 bg-primary hover:bg-primary-light">
              {loading ? "신청 중..." : "봄 리트릿 신청하기"}
            </button>
          </>
        ) : null}
        {result && (
          <p className={`text-center text-sm font-semibold ${result.ok ? "text-green-600" : "text-red-500"}`}>
            {result.msg}
          </p>
        )}
      </div>
    </div>
  );
}

/* ───── 잔여석 카운터 훅 ───── */
function useRetreatStatus() {
  const [status, setStatus] = useState({ current: 0, remaining: 20, max: 20, closed: false });
  useEffect(() => {
    fetch("/api/programs/retreat")
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, []);
  return status;
}

/* ───── D-day 계산 ───── */
function getDday() {
  const target = new Date("2026-04-18T00:00:00+09:00");
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/* ───── 메인 페이지 ───── */
export default function SpringRetreatPage() {
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const retreatStatus = useRetreatStatus();
  const dday = getDday();
  return (
    <div className="min-h-screen bg-background">
      {/* 상단 내비 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors">
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">달팽이아지트</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href="https://open.kakao.com/o/ssowhRlg" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-[#FEE500] text-[#3C1E1E] px-3 py-2 rounded-full text-xs font-bold hover:brightness-95 transition-all">
              <MessageCircle size={12} /> 카톡문의
            </a>
            <a href="#apply" className="bg-primary text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-primary-light transition-all">
              신청하기
            </a>
          </div>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="relative pt-14">
        <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
          <img src="/img/retreat-hero.jpg" alt="완주하다 봄 리트릿" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <span className="text-4xl mb-4">🌱</span>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">4월 18일, 완주 산속에서<br/>나를 리셋하는 1박 2일</h1>
            <p className="text-lg sm:text-xl text-white/80 mt-3 font-medium">운동 · 명상 · 목표설계 · 저널링 · 네트워킹</p>
            <p className="text-sm sm:text-base text-amber-300 mt-2 font-bold">20명 선착순 · 숙박+식사+프로그램 전부 포함</p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Calendar size={14} /> 2026.4.18(토)~19(일)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <MapPin size={14} /> 달팽이아지트펜션 (전북 완주)
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                <Users size={14} /> 20명 한정
              </div>
            </div>
            <p className="text-xs text-white/50 mt-3 flex items-center gap-1"><Train size={12} /> 서울에서 KTX 1시간 30분 · 자차 2시간 30분</p>
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-white">200,000원</span>
              </div>
              <p className="text-xs text-white/50 mt-1.5">1박 2일 올인원 · 선착순 20명</p>
            </div>
          </div>
        </div>
      </section>



      <div className="max-w-3xl mx-auto px-4 pb-24">

        {/* 인트로 */}
        <section className="py-12 sm:py-16 text-center">
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-medium">
            겨울 동안 움츠렸던 몸,<br />멈춰 있던 마음,<br />흐려졌던 의식.
          </p>
          <p className="text-lg sm:text-xl text-primary font-bold mt-6 leading-relaxed">
            봄의 리듬에 맞춰<br />다시 깨어나는 시간.
          </p>
          <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
            자기 삶을 완주하고 싶은 사람들을 위한<br />운동 · 계획설계 · 명상 · 글쓰기 리트릿
          </p>
        </section>

        {/* 이런 분께 추천 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">이런 분께 추천합니다</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "😮‍💨", title: "내가 잘 가고 있는지\n모르겠는 분", desc: "계속 달리는데 방향이 맞는지 확인하고 싶은 분" },
              { icon: "🧭", title: "방향이 헷갈리는 분", desc: "성공보다 의미, 속도보다 균형을 원하는 분" },
              { icon: "🤝", title: "혼자라 외로운 분", desc: "비슷한 고민을 가진 사람들과 함께하고 싶은 분" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
                <span className="text-3xl">{item.icon}</span>
                <p className="font-bold text-gray-900 mt-3 whitespace-pre-line text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-sage/50 rounded-2xl p-5">
            <p className="text-sm text-gray-700 font-medium text-center">
              프리랜서, 1인 사업자, 브랜드 운영자, 창작자, 코치/강사, 로컬 창업자 등<br />
              <span className="text-primary font-bold">자기 일을 만들어가며 끝까지 잘 완주하고 싶은 사람</span>
            </p>
          </div>
        </section>

        {/* 나를 다시 자라나게 하는 5단계 과정 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">주요 프로그램</h2>
          <div className="space-y-4">
            {MAIN_PROGRAMS.map((step, i) => (
              <div key={i} className={`rounded-2xl border ${step.color} relative overflow-hidden`}>
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center font-black text-base">
                    {step.num}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{step.emoji}</span>
                      <h3 className="font-black text-white text-base sm:text-lg drop-shadow-md">{step.title}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-primary/70">{step.tag}</p>
                  <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
                {i < MAIN_PROGRAMS.length - 1 && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-gray-300">
                    <ChevronDown size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 이끄미 소개 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-3">이 시간을 함께 여는 이끄미</h2>
          <p className="text-sm text-gray-500 text-center mb-8">이 여정은 이끄미들과 함께 만들어집니다</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEADERS.map((l, i) => (
              <div key={i} className={`rounded-2xl border p-5 ${l.color}`}>
                <div className="flex items-center gap-3 mb-3">
                  {l.img ? (
                    <img src={l.img} alt={l.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
                      <span className="text-3xl">{l.emoji}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-black text-gray-900">{l.name} <span className="text-sm font-medium text-gray-500">이끄미</span></p>
                    <p className="text-xs font-semibold text-gray-500">{l.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">{l.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {l.programs.map((prog) => (
                    <span key={prog} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.tagColor}`}>{prog}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 참가비 배너 */}
        <section className="pb-12 sm:pb-16">
          <div className="bg-gradient-to-r from-primary to-emerald-600 rounded-2xl p-6 sm:p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-4 left-8 text-6xl rotate-12">🌱</div>
              <div className="absolute bottom-4 right-8 text-6xl -rotate-12">🌱</div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-white/80 uppercase tracking-wider">참가비</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="text-4xl sm:text-5xl font-black">200,000원</span>
              </div>
              <div className="inline-block mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="text-sm">1박 2일 · 식사·프로그램 모두 포함</span>
              </div>
              <p className="text-sm text-white/70 mt-3">20명 선착순</p>
            </div>
          </div>
        </section>

        {/* 참가비에 포함된 10가지 혜택 */}
        <section className="pb-12 sm:pb-16">
          <div className="text-center mb-8">
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-2">VALUE PACKAGE</p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              참가비에 포함된 <span className="text-primary">10가지 혜택</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2">이 모든 것이 한 번의 참가비에 포함됩니다</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {[
              { icon: "🏡", title: "1박 숙박", desc: "산속 펜션 1박", value: "5만원 상당" },
              { icon: "🍽", title: "완주 로컬 밥상", desc: "2끼 식사 제공", value: "2만원 상당" },
              { icon: "💪", title: "감각을 깨우는 움직임", desc: "전문 이끄미 세션", value: "10만원 상당" },
              { icon: "🎯", title: "계획 설계 워크숍", desc: "게이미피케이션 · 만다라트", value: "10만원 상당" },
              { icon: "🧭", title: "삶의 방향 점검 & 명상", desc: "자애명상 · 걷기명상 · 대화", value: "10만원 상당" },
              { icon: "🎁", title: "웰컴키트", desc: "일상으로 이어가는 선물 세트", value: "정성 가득" },
              { icon: "🍵", title: "간식 & 음료", desc: "차, 과일, 다과 제공", value: "덤!" },
              { icon: "🌿", title: "자연 힐링", desc: "완주 산속 자연 치유", value: "덤!" },
              { icon: "🤝", title: "네트워킹", desc: "같은 고민 동료 20명", value: "측정불가 가치!" },
              { icon: "🌱", title: "삶의 방향 설계", desc: "올해의 로드맵 완성", value: "측정불가!" },
            ].map((b, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                    <p className="text-xs font-bold text-primary mt-1">{b.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 text-center border border-primary/20">
            <p className="text-sm text-gray-600">혜택을 환산하면</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              총 <span className="text-primary">42만원</span> 이상의 가치 <span className="text-sm text-gray-500">+ 측정불가 혜택</span>
            </p>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-gray-500">참가비</p>
              <p className="text-4xl font-black text-primary mt-1">200,000원</p>
            </div>
            <a href="#apply" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-light transition-colors">
              지금 바로 신청하기 <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* 타임테이블 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-6">1박 2일 타임테이블</h2>

          {/* 탭 버튼 */}
          <div className="flex gap-2 mb-5">
            <button onClick={() => setActiveDay(1)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeDay === 1 ? "bg-primary text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              DAY 1 · 4.18(토)
            </button>
            <button onClick={() => setActiveDay(2)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeDay === 2 ? "bg-accent text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              DAY 2 · 4.19(일)
            </button>
          </div>

          {/* 타임라인 */}
          <div className="space-y-2.5">
            {(activeDay === 1 ? DAY1 : DAY2).map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">
                    {item.label.includes("(") ? (
                      <>{item.label.split("(")[0].trim()}<br /><span className="font-normal text-xs text-gray-500">({item.label.split("(").slice(1).join("(")}</span></>
                    ) : item.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
                {item.tag && (
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${item.color}`}>{item.tag}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 프로그램 상세 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">세부 프로그램</h2>
          <div className="space-y-4">
            {PROGRAMS.map((p) => (
              <ProgramAccordion key={p.num} p={p} />
            ))}
          </div>
        </section>

        {/* 계절 로드맵 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">완주하다 시즌 로드맵</h2>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { season: "봄", month: "4월", theme: "깨우기\n움트기", eng: "awake", emoji: "🌱", active: true },
              { season: "여름", month: "7월", theme: "몰입", eng: "flow", emoji: "🌿" },
              { season: "가을", month: "10월", theme: "수확", eng: "harvest", emoji: "🍂" },
              { season: "겨울", month: "1월", theme: "돌아보기\n정리", eng: "reflection", emoji: "❄️" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 text-center transition-shadow ${s.active ? "bg-primary text-white shadow-lg ring-2 ring-primary/30" : "bg-white border border-gray-200 text-gray-600"}`}>
                <span className="text-2xl">{s.emoji}</span>
                <p className={`text-lg font-black mt-2 ${s.active ? "text-white" : "text-gray-900"}`}>{s.season}</p>
                <p className={`text-xs font-semibold mt-1 ${s.active ? "text-white/80" : "text-gray-500"}`}>{s.month}</p>
                <p className={`text-[11px] mt-2 whitespace-pre-line leading-snug ${s.active ? "text-white/70" : "text-gray-400"}`}>{s.theme}</p>
                <p className={`text-[10px] mt-1 italic ${s.active ? "text-white/50" : "text-gray-300"}`}>{s.eng}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 참가 안내 */}
        <section className="pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-8">참가 안내</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">일시</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">2026.4.18(토) ~ 19(일)</p>
                  <p className="text-xs text-gray-500">1박 2일</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">장소</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">달팽이아지트펜션</p>
                  <p className="text-xs text-gray-500">전북 완주군 소양면 해월신왕길 92</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">인원</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">20명 한정</p>
                  <p className="text-xs text-gray-500">선착순 마감</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">참가비</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    <span className="text-primary text-lg font-black">200,000원</span>
                  </p>
                  <p className="text-xs text-gray-500">1박 2일 올인원</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">포함 내용</p>
                <div className="flex flex-wrap gap-2">
                  {["1박 2일 숙박", "2끼 식사 & 간식", "프로그램 4~5타임", "웰컴키트"].map((item) => (
                    <span key={item} className="px-3 py-1.5 rounded-full bg-sage text-sm text-gray-700 font-medium">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* 교통편 안내 (서울 타겟) */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Train size={20} className="text-blue-600" />
              <h3 className="font-black text-gray-900">서울에서 오시나요?</h3>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">참가자 36%가 서울</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚄</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">KTX (추천)</p>
                  <p className="text-xs text-gray-500 mt-0.5">용산역 → 전주역 <span className="font-bold text-blue-600">1시간 30분</span></p>
                  <p className="text-xs text-gray-400">전주역에서 펜션까지 차량 30분</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚌</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">고속버스</p>
                  <p className="text-xs text-gray-500 mt-0.5">센트럴시티 → 전주 <span className="font-bold text-blue-600">2시간 40분</span></p>
                  <p className="text-xs text-gray-400">전주터미널에서 펜션까지 차량 30분</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white rounded-xl p-4">
                <span className="text-lg">🚗</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">자차</p>
                  <p className="text-xs text-gray-500 mt-0.5">서울 → 완주 <span className="font-bold text-blue-600">약 2시간 30분</span> (고속도로)</p>
                  <p className="text-xs text-gray-400">무료 주차 가능 · 네비: 전북 완주군 해월신왕길 92</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-500 font-semibold mt-4 text-center">💡 교통편 고민되시면 카톡으로 편하게 물어보세요!</p>
          </div>

          <div id="apply" className="mt-6 scroll-mt-20">
            <ApplyForm />
          </div>
        </section>

        {/* 참가자 실제 후기 — 슬라이더 */}
        <div id="reviews" className="scroll-mt-20">
          <ReviewSlider />
        </div>

        {/* 경험 중심 CTA */}
        <section className="pb-12 sm:pb-16">
          <div className="rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <img src="/img/retreat-bg.jpg" alt="완주 자연 풍경" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10">
              <Sparkles size={32} className="mx-auto text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-black mt-4">
                이 경험으로<br /><span className="text-amber-400">당신의 방향에 터닝포인트가 되기를</span>
              </h3>
              <p className="text-white/60 text-sm mt-3 max-w-sm mx-auto">
                몸을 깨우고, 계획을 세우고, 마음을 나누는 1박 2일.<br />돌아가는 길, 발걸음이 달라집니다.
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-white">20명</p>
                  <p className="text-xs text-white/50 mt-1">한정 모집</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-amber-400">5가지</p>
                  <p className="text-xs text-white/50 mt-1">프로그램</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p className="text-3xl font-black text-white">1박2일</p>
                  <p className="text-xs text-white/50 mt-1">올인원</p>
                </div>
              </div>
              <a href="#apply" className="inline-flex items-center gap-2 mt-8 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-black text-lg hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/30">
                함께 시작하기 <ArrowRight size={18} />
              </a>
              <p className="text-xs text-white/40 mt-3">신청 후 안내 문자가 발송됩니다</p>
            </div>
          </div>
        </section>


      </div>

      <div className="h-[72px]" />
    </div>
  );
}
