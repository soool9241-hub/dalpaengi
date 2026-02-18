"use client";

import { useState } from "react";
import { Star, Quote, Calendar, Tag } from "lucide-react";

const filterTabs = [
  { id: "all", label: "전체" },
  { id: "worker", label: "직장인" },
  { id: "educator", label: "교육자" },
  { id: "family", label: "가족" },
];

const reviews = [
  {
    name: "김지영",
    role: "IT 기업 직장인",
    category: "worker",
    program: "디지털 디톡스",
    rating: 5,
    text: "바쁜 일상에서 벗어나 온전히 나를 위한 시간을 가질 수 있었어요. 숲속 산책과 명상 프로그램이 특히 좋았고, 디지털 기기 없이 보낸 시간이 정말 소중했습니다. 퇴실 후에도 그 평온함이 계속 이어지더라구요.",
    tags: ["힐링", "명상", "휴식"],
    date: "2024.03.15",
    avatar: "bg-gradient-to-br from-violet-400 to-purple-500",
    initial: "김",
    gradient: "from-violet-50 to-purple-50",
  },
  {
    name: "이현우",
    role: "중학교 교사",
    category: "educator",
    program: "교원 힐링",
    rating: 5,
    text: "교직원 연수로 다녀왔는데 모든 분들이 만족했습니다. 회의실 시설이 깔끔하고, 야간 캠프파이어가 정말 분위기 있었어요. 자연 속에서 재충전이 제대로 됐다고 모두들 얘기하더라구요.",
    tags: ["교원", "힐링", "재충전"],
    date: "2024.03.10",
    avatar: "bg-gradient-to-br from-emerald-400 to-teal-500",
    initial: "이",
    gradient: "from-emerald-50 to-green-50",
  },
  {
    name: "박서연",
    role: "가족 힐링",
    category: "family",
    program: "가족 패키지",
    rating: 5,
    text: "아이들과 함께 가족 여행으로 방문했어요. 디럭스룸 테라스에서 보는 풍경이 정말 아름다웠고, 아이들이 자연 속에서 뛰어놀 수 있어 너무 좋았습니다. 조식도 건강하고 맛있었어요! 다음에 또 오고 싶어요.",
    tags: ["가족", "체험", "자연"],
    date: "2024.03.05",
    avatar: "bg-gradient-to-br from-amber-400 to-orange-500",
    initial: "박",
    gradient: "from-amber-50 to-yellow-50",
  },
];

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeFilter);

  return (
    <section id="reviews" className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            STORIES
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
            실제 참여자 스토리
          </h2>
          <p className="text-text-light">
            달팽이아지트를 다녀간 분들의 생생한 이야기
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
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
          {filteredReviews.map((review, i) => (
            <div
              key={i}
              className={`relative rounded-3xl p-7 bg-gradient-to-br ${review.gradient} border border-white/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
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

              {/* Program badge */}
              <div className="flex items-center gap-1.5 mb-3">
                <Tag size={12} className="text-primary" />
                <span className="text-xs font-medium text-primary">{review.program}</span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-text-mid text-sm leading-relaxed mb-5">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {review.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="bg-white/70 text-text-light text-xs px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-text-light">
                <Calendar size={12} />
                {review.date}
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-16 text-text-light">
            <p>해당 카테고리의 후기가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  );
}
