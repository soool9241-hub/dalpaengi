"use client";

import { useState } from "react";
import { Star, Quote, ChevronDown, ExternalLink, Users, CalendarCheck, TrendingUp, Heart } from "lucide-react";

const filterTabs = [
  { id: "all", label: "전체" },
  { id: "family", label: "가족모임" },
  { id: "mt", label: "MT/단체" },
  { id: "info", label: "펜션 안내" },
];

interface Review {
  name: string;
  role: string;
  category: string;
  program: string;
  rating: number;
  summary: string;
  tags: string[];
  date: string;
  avatar: string;
  initial: string;
  gradient: string;
  blogUrl: string;
}

const reviews: Review[] = [
  {
    name: "벚꽃비",
    role: "6가족 모임",
    category: "family",
    program: "숙박 (20명)",
    rating: 5,
    summary: "무려 6가족이 함께! 전주 근처 독채 대형펜션을 찾고 있었는데 달팽이아지트가 딱이었어요. 넓은 공간에서 편하게 지낼 수 있어 최고!",
    tags: ["독채", "대가족", "완주"],
    date: "2024.11",
    avatar: "bg-gradient-to-br from-pink-400 to-rose-500",
    initial: "벚",
    gradient: "from-pink-50 to-rose-50",
    blogUrl: "https://blog.naver.com/zidmlql039/223674107470",
  },
  {
    name: "쪼꼬미로드",
    role: "단체 여행",
    category: "mt",
    program: "숙박 (단체)",
    rating: 5,
    summary: "할머니부터 손주까지 대가족 2박3일! 도착하자마자 에어컨 시원하게 틀어놔 주시고, 수영장 차양막까지 미리 설치해주셨어요. 드라이기·비상약·놀이도구까지 세심하게 준비되어있고, 바비큐 그릴+숯+토치 다 제공! 조용하고 여유로운 가족 여행엔 꼭 추천드려요.",
    tags: ["내돈내산", "대가족", "2박3일", "바비큐"],
    date: "2025.10",
    avatar: "bg-gradient-to-br from-amber-400 to-orange-500",
    initial: "쪼",
    gradient: "from-amber-50 to-yellow-50",
    blogUrl: "https://blog.naver.com/love_you0430/223962433538",
  },
  {
    name: "김민석",
    role: "대학 동아리",
    category: "mt",
    program: "숙박 (40명 MT)",
    rating: 5,
    summary: "40명 동아리 MT! 생각보다 넓고 시설이 깨끗해서 놀랐어요. 샤워부스 4개에 수압도 세고, 수건·드라이기 다수 구비. 펜션에서 준비해준 고기가 진짜 맛있었고 불판 5개 지원! 넓어서 레크도 여유롭게 즐겼어요. 2학기에도 꼭 다시 가고 싶네요.",
    tags: ["대학MT", "40명", "고기맛집", "깨끗"],
    date: "2025.09",
    avatar: "bg-gradient-to-br from-sky-400 to-blue-500",
    initial: "김",
    gradient: "from-sky-50 to-blue-50",
    blogUrl: "https://blog.naver.com/alstjr3425/223997844002",
  },
  {
    name: "정또언냐",
    role: "가을 여행",
    category: "family",
    program: "숙박",
    rating: 5,
    summary: "가을 공휴일을 알차게! 전주 소양 독채 펜션, 자연 속 힐링하기 딱 좋았습니다. 깔끔하고 추천!",
    tags: ["가을여행", "독채", "힐링"],
    date: "2024.10",
    avatar: "bg-gradient-to-br from-emerald-400 to-teal-500",
    initial: "정",
    gradient: "from-emerald-50 to-green-50",
    blogUrl: "https://blog.naver.com/cs72870/223609135100",
  },
  {
    name: "봉봉juice",
    role: "범호랭패밀리",
    category: "family",
    program: "숙박 (26명 가족)",
    rating: 5,
    summary: "코로나 풀리고 바로 대가족 여행! 26명이 함께한 1박2일, 넓은 공간에서 다 같이 모여서 정말 행복한 시간!",
    tags: ["대가족", "26명", "1박2일"],
    date: "2023.02",
    avatar: "bg-gradient-to-br from-violet-400 to-purple-500",
    initial: "봉",
    gradient: "from-violet-50 to-purple-50",
    blogUrl: "https://blog.naver.com/godkru/223013247269",
  },
  {
    name: "범찌니",
    role: "범호랭패밀리",
    category: "family",
    program: "숙박 (26명 가족)",
    rating: 5,
    summary: "친척 모임으로 26명 대가족! 공간이 넉넉해서 다들 편하게 쉴 수 있었어요. 함께할 수 있는 곳이 많지 않은데 여긴 최고!",
    tags: ["친척모임", "대가족", "넉넉한공간"],
    date: "2022.07",
    avatar: "bg-gradient-to-br from-lime-400 to-green-500",
    initial: "범",
    gradient: "from-lime-50 to-green-50",
    blogUrl: "https://blog.naver.com/qjawldms/222845479430",
  },
  {
    name: "잎새 (펜션지기)",
    role: "달팽이아지트 운영",
    category: "info",
    program: "펜션 소개",
    rating: 5,
    summary: "완주 독채 펜션으로 20명~40명 단체 숙소에 최적화! 깨끗한 시설과 자연 속 힐링을 약속드립니다.",
    tags: ["독채", "단체숙소", "깨끗한시설"],
    date: "2024.07",
    avatar: "bg-gradient-to-br from-emerald-400 to-teal-500",
    initial: "잎",
    gradient: "from-emerald-50 to-green-50",
    blogUrl: "https://blog.naver.com/linas23/223487254497",
  },
  {
    name: "잎새 (펜션지기)",
    role: "달팽이아지트 운영",
    category: "info",
    program: "시설 안내",
    rating: 5,
    summary: "추석 연휴에만 예약 문의 5건! 20명, 30명, 40명 모두 수용 가능한 깨끗한 독채 단체 펜션입니다.",
    tags: ["20명", "30명", "40명"],
    date: "2024.09",
    avatar: "bg-gradient-to-br from-emerald-400 to-teal-500",
    initial: "잎",
    gradient: "from-emerald-50 to-green-50",
    blogUrl: "https://blog.naver.com/linas23/223587945987",
  },
  {
    name: "청년장인 (대표)",
    role: "달팽이아지트 대표",
    category: "info",
    program: "이용 가이드",
    rating: 5,
    summary: "5년간 다양한 고객님들 감사합니다! 항아리바베큐 등 특별한 체험과 함께 최고의 추억을 만들어 드립니다.",
    tags: ["항아리바베큐", "이용가이드", "5년운영"],
    date: "2025.11",
    avatar: "bg-gradient-to-br from-sky-400 to-blue-500",
    initial: "청",
    gradient: "from-sky-50 to-blue-50",
    blogUrl: "https://blog.naver.com/sool9241/224071686858",
  },
];

const stats = [
  { icon: CalendarCheck, label: "운영 기간", value: "5년+", sub: "2021년~현재" },
  { icon: Users, label: "누적 방문", value: "300+팀", sub: "총 7,000명 이상" },
  { icon: TrendingUp, label: "재방문율", value: "15%", sub: "단골 고객 다수" },
  { icon: Heart, label: "만족도", value: "4.9/5", sub: "블로그 후기 기준" },
];

const INITIAL_SHOW = 3;

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeFilter);

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, INITIAL_SHOW);
  const hasMore = filteredReviews.length > INITIAL_SHOW;

  return (
    <section id="reviews" className="py-16 sm:py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            REVIEWS
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
            이용 현황 & 고객 후기
          </h2>
          <p className="text-text-light">
            달팽이아지트를 다녀간 분들의 생생한 후기
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-5 text-center border border-border hover:shadow-md transition-all">
                <Icon size={22} className="text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-dark">{stat.value}</p>
                <p className="text-sm font-medium text-text-mid">{stat.label}</p>
                <p className="text-xs text-text-light mt-0.5">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveFilter(tab.id); setShowAll(false); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === tab.id
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-text-mid hover:bg-sage border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReviews.map((review, i) => (
            <a
              key={i}
              href={review.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative rounded-3xl p-7 bg-gradient-to-br ${review.gradient} border border-white/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${review.avatar} flex items-center justify-center text-white font-bold text-sm`}>
                    {review.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-dark">{review.name}</p>
                    <p className="text-xs text-text-light">{review.role}</p>
                  </div>
                </div>
                <Quote size={20} className="text-primary/15" />
              </div>

              {/* Program + Date */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">{review.program}</span>
                <span className="text-xs text-text-light">{review.date}</span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Summary */}
              <p className="text-text-mid text-sm leading-relaxed mb-5 flex-1">
                &ldquo;{review.summary}&rdquo;
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {review.tags.map((tag, j) => (
                  <span key={j} className="bg-white/70 text-text-light text-xs px-2.5 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* CTA - 자세히보기 */}
              <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/80 group-hover:bg-white border border-white/60 rounded-xl text-sm font-semibold text-primary transition-all">
                <ExternalLink size={14} />
                자세히 보기
              </div>
            </a>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-16 text-text-light">
            <p>해당 카테고리의 후기가 없습니다.</p>
          </div>
        )}

        {/* Show more / Show less */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-border rounded-full text-sm font-semibold text-text-dark hover:border-primary/30 hover:bg-sage transition-all"
            >
              {showAll ? "접기" : `더보기 (${filteredReviews.length - INITIAL_SHOW}개)`}
              <ChevronDown size={16} className={`transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
