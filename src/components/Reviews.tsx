"use client";

import { useState } from "react";
import { Star, Quote, Calendar, Tag, ChevronDown, Pencil, ExternalLink, X } from "lucide-react";

const filterTabs = [
  { id: "all", label: "전체" },
  { id: "worker", label: "직장인" },
  { id: "educator", label: "교육자" },
  { id: "family", label: "가족" },
];

interface Review {
  name: string;
  role: string;
  category: string;
  program: string;
  rating: number;
  text: string;
  tags: string[];
  date: string;
  avatar: string;
  initial: string;
  gradient: string;
  blogUrl?: string;
}

const defaultReviews: Review[] = [
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
    role: "가족 여행",
    category: "family",
    program: "가족 패키지",
    rating: 5,
    text: "아이들과 함께 가족 여행으로 방문했어요. 테라스에서 보는 풍경이 정말 아름다웠고, 아이들이 자연 속에서 뛰어놀 수 있어 너무 좋았습니다. 다음에 또 오고 싶어요.",
    tags: ["가족", "체험", "자연"],
    date: "2024.03.05",
    avatar: "bg-gradient-to-br from-amber-400 to-orange-500",
    initial: "박",
    gradient: "from-amber-50 to-yellow-50",
  },
  {
    name: "정민수",
    role: "스타트업 대표",
    category: "worker",
    program: "워크숍",
    rating: 5,
    text: "팀 워크숍으로 이용했는데, 도심에서 벗어나 자연 속에서 회의하니 창의적인 아이디어가 많이 나왔습니다. 바베큐 파티도 팀 분위기를 한층 좋게 만들어줬어요. 강력 추천합니다!",
    tags: ["워크숍", "팀빌딩", "바베큐"],
    date: "2024.02.28",
    avatar: "bg-gradient-to-br from-sky-400 to-blue-500",
    initial: "정",
    gradient: "from-sky-50 to-blue-50",
  },
  {
    name: "최유진",
    role: "유치원 교사",
    category: "educator",
    program: "교원 힐링",
    rating: 5,
    text: "동료 선생님들과 힐링 여행으로 다녀왔어요. 조용한 환경에서 충분히 쉴 수 있었고, 캠프파이어 때 나눈 이야기가 오래 기억에 남을 것 같아요. 시설도 깨끗하고 관리가 잘 되어있었습니다.",
    tags: ["교원", "힐링", "캠프파이어"],
    date: "2024.02.20",
    avatar: "bg-gradient-to-br from-pink-400 to-rose-500",
    initial: "최",
    gradient: "from-pink-50 to-rose-50",
  },
  {
    name: "한승호",
    role: "가족 나들이",
    category: "family",
    program: "숙박",
    rating: 4,
    text: "부모님 모시고 가족 모임으로 이용했습니다. 넓은 공간에서 다 함께 모여 고기 구워 먹고, 밤에는 별도 보고 정말 좋았어요. 어르신들도 공기 좋다고 너무 좋아하셨습니다.",
    tags: ["가족모임", "자연", "별"],
    date: "2024.02.14",
    avatar: "bg-gradient-to-br from-lime-400 to-green-500",
    initial: "한",
    gradient: "from-lime-50 to-green-50",
  },
];

const AVATARS = [
  { avatar: "bg-gradient-to-br from-violet-400 to-purple-500", gradient: "from-violet-50 to-purple-50" },
  { avatar: "bg-gradient-to-br from-emerald-400 to-teal-500", gradient: "from-emerald-50 to-green-50" },
  { avatar: "bg-gradient-to-br from-amber-400 to-orange-500", gradient: "from-amber-50 to-yellow-50" },
  { avatar: "bg-gradient-to-br from-sky-400 to-blue-500", gradient: "from-sky-50 to-blue-50" },
  { avatar: "bg-gradient-to-br from-pink-400 to-rose-500", gradient: "from-pink-50 to-rose-50" },
];

const INITIAL_SHOW = 3;

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(defaultReviews);

  // Write review modal
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [writeMode, setWriteMode] = useState<"direct" | "blog">("direct");
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "worker",
    program: "",
    rating: 5,
    text: "",
    blogUrl: "",
  });

  const filteredReviews =
    activeFilter === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeFilter);

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, INITIAL_SHOW);
  const hasMore = filteredReviews.length > INITIAL_SHOW;

  const handleSubmitReview = () => {
    if (!formData.name.trim() || !formData.program.trim()) return;
    if (writeMode === "direct" && !formData.text.trim()) return;
    if (writeMode === "blog" && !formData.blogUrl.trim()) return;

    const style = AVATARS[reviews.length % AVATARS.length];
    const newReview: Review = {
      name: formData.name,
      role: formData.role || "방문 고객",
      category: formData.category,
      program: formData.program,
      rating: formData.rating,
      text: writeMode === "blog" ? `블로그에 후기를 남겨주셨습니다.` : formData.text,
      tags: [],
      date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      avatar: style.avatar,
      initial: formData.name.charAt(0),
      gradient: style.gradient,
      blogUrl: writeMode === "blog" ? formData.blogUrl : undefined,
    };

    setReviews((prev) => [newReview, ...prev]);
    setFormData({ name: "", role: "", category: "worker", program: "", rating: 5, text: "", blogUrl: "" });
    setShowWriteModal(false);
    setShowAll(true);
  };

  return (
    <>
      <section id="reviews" className="py-16 sm:py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
              REVIEWS
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
              방문 이용 고객 후기
            </h2>
            <p className="text-text-light">
              달팽이아지트를 다녀간 분들의 생생한 후기
            </p>
          </div>

          {/* Filter tabs + Write button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div className="flex flex-wrap justify-center gap-2">
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
            <button
              onClick={() => setShowWriteModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary-light transition-colors shadow-md"
            >
              <Pencil size={14} />
              후기 작성
            </button>
          </div>

          {/* Review Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((review, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-7 bg-gradient-to-br ${review.gradient} border border-white/60 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
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

                {/* Program badge */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Tag size={12} className="text-primary" />
                  <span className="text-xs font-medium text-primary">{review.program}</span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, j) => (
                    <Star key={`e-${j}`} size={14} className="text-gray-200" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-text-mid text-sm leading-relaxed mb-5">
                  &ldquo;{review.text}&rdquo;
                </p>

                {/* Blog link */}
                {review.blogUrl && (
                  <a href={review.blogUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-4">
                    <ExternalLink size={12} /> 블로그 후기 보기
                  </a>
                )}

                {/* Tags */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {review.tags.map((tag, j) => (
                      <span key={j} className="bg-white/70 text-text-light text-xs px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

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

      {/* Write Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWriteModal(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in p-5 sm:p-8">
            <button onClick={() => setShowWriteModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={16} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Pencil size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-dark">후기 작성</h3>
              <p className="text-sm text-text-light mt-1">소중한 경험을 공유해주세요</p>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              <button onClick={() => setWriteMode("direct")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${writeMode === "direct" ? "bg-primary text-white shadow-md" : "bg-sage text-text-mid"}`}>
                직접 작성
              </button>
              <button onClick={() => setWriteMode("blog")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${writeMode === "blog" ? "bg-primary text-white shadow-md" : "bg-sage text-text-mid"}`}>
                블로그 후기
              </button>
            </div>

            <div className="space-y-4">
              {/* Name & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-mid mb-1 block">이름 *</label>
                  <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-mid mb-1 block">소속/직업</label>
                  <input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="회사원, 교사 등" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-medium text-text-mid mb-1 block">카테고리</label>
                <div className="flex gap-2">
                  {filterTabs.filter((t) => t.id !== "all").map((tab) => (
                    <button key={tab.id} onClick={() => setFormData({ ...formData, category: tab.id })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${formData.category === tab.id ? "bg-primary text-white" : "bg-sage text-text-mid hover:bg-primary/10"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Program */}
              <div>
                <label className="text-xs font-medium text-text-mid mb-1 block">이용 프로그램 *</label>
                <input value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  placeholder="숙박, 3시간 대여, 워크숍 등" className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary" />
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs font-medium text-text-mid mb-1 block">만족도</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setFormData({ ...formData, rating: s })}>
                      <Star size={24} className={`transition-colors ${s <= formData.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct write or Blog URL */}
              {writeMode === "direct" ? (
                <div>
                  <label className="text-xs font-medium text-text-mid mb-1 block">후기 내용 *</label>
                  <textarea value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="방문 경험을 자유롭게 작성해주세요" rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary resize-none" />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-text-mid mb-1 block">블로그 주소 *</label>
                  <input value={formData.blogUrl} onChange={(e) => setFormData({ ...formData, blogUrl: e.target.value })}
                    placeholder="https://blog.naver.com/..." className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-white focus:outline-none focus:border-primary" />
                  <p className="text-xs text-text-light mt-1">네이버 블로그, 티스토리 등 후기 링크를 입력해주세요</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowWriteModal(false)}
                className="flex-1 py-3 border-2 border-border rounded-xl font-semibold text-sm text-text-mid hover:bg-sage transition-colors">
                취소
              </button>
              <button onClick={handleSubmitReview}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-light transition-colors">
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
