"use client";

import { useState } from "react";
import {
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Moon,
  Clock,
  Sun,
  Check,
  X,
} from "lucide-react";
import { useReservation } from "@/context/ReservationContext";

const questions = [
  {
    id: 1,
    icon: Heart,
    title: "어떤 휴식이 필요하신가요?",
    subtitle: "현재 상태에 가장 가까운 것을 선택해주세요",
    options: [
      {
        label: "마음의 안정",
        desc: "스트레스 해소, 마음 챙김",
        emoji: "🧘",
      },
      {
        label: "몸의 회복",
        desc: "피로 회복, 건강 관리",
        emoji: "🌿",
      },
      {
        label: "전반적인 재충전",
        desc: "새로운 경험, 에너지 회복",
        emoji: "⚡",
      },
    ],
  },
  {
    id: 2,
    icon: Users,
    title: "누구와 함께 오시나요?",
    subtitle: "동행에 따라 최적의 프로그램이 달라집니다",
    options: [
      {
        label: "혼자 또는 커플",
        desc: "1~2인의 프라이빗한 시간",
        emoji: "💑",
      },
      {
        label: "가족 여행",
        desc: "아이, 부모님과 함께하는 여행",
        emoji: "👨‍👩‍👧‍👦",
      },
      {
        label: "단체 / 워크숍",
        desc: "직장 동료, 친구 모임, 세미나",
        emoji: "🏢",
      },
    ],
  },
  {
    id: 3,
    icon: Sparkles,
    title: "어떤 경험을 기대하시나요?",
    subtitle: "가장 하고 싶은 활동을 골라주세요",
    options: [
      {
        label: "자연 속 힐링",
        desc: "숲속 산책, 명상, 다도 체험",
        emoji: "🌲",
      },
      {
        label: "맛있는 식사",
        desc: "바베큐, 건강 조식, 로컬 푸드",
        emoji: "🥩",
      },
      {
        label: "다양한 액티비티",
        desc: "캠프파이어, 보드게임, VR 체험",
        emoji: "🔥",
      },
    ],
  },
];

const programs = [
  {
    id: "stay",
    icon: Moon,
    title: "숙박객 전용 패키지",
    duration: "1박 2일",
    price: "700,000원",
    color: "from-primary to-primary-light",
    features: [
      "디럭스룸 1박",
      "조식 & 석식 포함",
      "바베큐 세트 제공",
      "숲속 산책 가이드",
      "명상 프로그램",
    ],
    bestFor: "조용한 힐링과 깊은 휴식을 원하는 분",
  },
  {
    id: "half",
    icon: Clock,
    title: "3시간 단위 대여",
    duration: "3시간",
    price: "300,000원",
    color: "from-amber-500 to-orange-500",
    features: [
      "회의실 또는 다이닝룸",
      "빔프로젝터 & 음향",
      "음료 서비스",
      "주차 무료",
    ],
    bestFor: "단체 워크숍이나 짧은 모임을 계획하는 분",
  },
  {
    id: "daynight",
    icon: Sun,
    title: "주/야간 패키지",
    duration: "5시간",
    price: "400,000원",
    color: "from-rose-500 to-pink-500",
    features: [
      "스탠다드룸 이용",
      "바베큐 또는 다과",
      "보드게임 대여",
      "캠프파이어 (야간)",
    ],
    bestFor: "다양한 활동과 즐거운 시간을 원하는 분",
  },
];

function getRecommendation(answers: number[]): {
  programIdx: number;
  reason: string;
  matchPercent: number;
} {
  const [rest, companion, activity] = answers;
  const scores = [0, 0, 0];

  if (rest === 0) { scores[0] += 3; scores[2] += 1; }
  else if (rest === 1) { scores[0] += 3; scores[2] += 2; }
  else { scores[2] += 3; scores[1] += 1; }

  if (companion === 0) { scores[0] += 3; }
  else if (companion === 1) { scores[0] += 2; scores[2] += 2; }
  else { scores[1] += 3; scores[2] += 1; }

  if (activity === 0) { scores[0] += 3; }
  else if (activity === 1) { scores[0] += 2; scores[2] += 2; }
  else { scores[2] += 3; scores[1] += 1; }

  const maxScore = Math.max(...scores);
  const programIdx = scores.indexOf(maxScore);
  const totalPossible = 9;
  const matchPercent = Math.round((maxScore / totalPossible) * 100);

  const reasons: Record<string, string> = {
    "0": "조용한 자연 속에서 깊은 쉼이 필요하신 당신에게 1박 2일 숙박 패키지가 완벽해요. 숲속 산책, 명상, 건강한 식사까지 모두 포함되어 있어 온전한 리프레시가 가능합니다.",
    "1": "효율적인 시간 활용을 원하시는 당신에게 3시간 단위 대여가 딱이에요. 완비된 시설에서 집중력 있는 모임이나 워크숍을 진행할 수 있습니다.",
    "2": "다양한 활동과 특별한 추억을 원하시는 당신에게 주/야간 패키지를 추천해요. 바베큐, 캠프파이어, 보드게임까지 알찬 시간을 보낼 수 있습니다.",
  };

  return {
    programIdx,
    reason: reasons[String(programIdx)],
    matchPercent: Math.min(matchPercent, 97),
  };
}

export default function Recommend() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const { setSelectedProgramId } = useReservation();

  const currentQuestion = step >= 1 && step <= 3 ? questions[step - 1] : null;

  const handleStart = () => setStep(1);

  const handleSelect = (optionIdx: number) => {
    setSelectedOption(optionIdx);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      const newAnswers = answers.slice(0, -1);
      setAnswers(newAnswers);
      setSelectedOption(null);
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setSelectedOption(null);
  };

  const result = step === 4 ? getRecommendation(answers) : null;
  const recommendedProgram = result ? programs[result.programIdx] : null;

  return (
    <>
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Start */}
          {step === 0 && (
            <div className="text-center animate-fade-in-up">
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
                FIND YOUR PROGRAM
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
                나에게 맞는 프로그램 찾기
              </h2>
              <p className="text-text-light mb-4 max-w-md mx-auto">
                간단한 질문 3개에 답하고
                <br />
                맞춤 프로그램을 추천받으세요
              </p>
              <div className="flex items-center justify-center gap-2 mb-10">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-2 text-xs text-text-light">
                    <span className="w-7 h-7 rounded-full bg-sage text-primary font-bold flex items-center justify-center text-xs">
                      {n}
                    </span>
                    {n < 3 && <span className="w-8 h-px bg-border" />}
                  </div>
                ))}
              </div>
              <button
                onClick={handleStart}
                className="bg-primary text-white px-10 py-4 rounded-full font-semibold text-sm hover:bg-primary-light transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                시작하기
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Questions */}
          {currentQuestion && (
            <div className="animate-fade-in-up" key={step}>
              <div className="flex items-center gap-3 mb-10">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        n < step
                          ? "bg-primary text-white"
                          : n === step
                          ? "bg-primary text-white scale-110 shadow-md"
                          : "bg-sage text-text-light"
                      }`}
                    >
                      {n < step ? <Check size={14} /> : n}
                    </div>
                    {n < 3 && (
                      <div className="flex-1 h-1 rounded-full bg-sage overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: n < step ? "100%" : "0%" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center mb-8">
                <p className="text-xs text-primary font-semibold mb-2">
                  질문 {step} / 3
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-text-dark mb-2">
                  {currentQuestion.title}
                </h3>
                <p className="text-text-light text-sm">
                  {currentQuestion.subtitle}
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 hover:shadow-md ${
                      selectedOption === i
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-white hover:border-primary/30"
                    }`}
                  >
                    <span className="text-3xl flex-shrink-0">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className={`font-semibold ${selectedOption === i ? "text-primary" : "text-text-dark"}`}>
                        {opt.label}
                      </p>
                      <p className="text-sm text-text-light mt-0.5">{opt.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedOption === i ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {selectedOption === i && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    step > 1 ? "text-text-mid hover:text-text-dark" : "text-transparent pointer-events-none"
                  }`}
                >
                  <ArrowLeft size={16} />
                  이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedOption === null}
                  className={`px-8 py-3 rounded-full font-semibold text-sm inline-flex items-center gap-2 transition-all ${
                    selectedOption !== null
                      ? "bg-primary text-white hover:bg-primary-light shadow-md"
                      : "bg-border text-text-light cursor-not-allowed"
                  }`}
                >
                  {step === 3 ? "결과 보기" : "다음"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {step === 4 && result && recommendedProgram && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-8">
                <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
                  RESULT
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-2">
                  추천 프로그램
                </h2>
                <p className="text-text-light text-sm">당신의 답변을 분석했습니다</p>
              </div>

              <div
                className={`relative rounded-3xl p-5 sm:p-8 bg-gradient-to-br ${recommendedProgram.color} text-white mb-6 overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <recommendedProgram.icon size={28} className="text-white/80 flex-shrink-0" />
                      <div>
                        <p className="text-white/60 text-xs font-medium">
                          적합도 {result.matchPercent}%
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold">{recommendedProgram.title}</h3>
                      </div>
                    </div>
                    <div className="text-left sm:text-right ml-10 sm:ml-0">
                      <p className="text-white/60 text-xs">{recommendedProgram.duration}</p>
                      <p className="text-lg sm:text-xl font-bold">{recommendedProgram.price}</p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-white/20 rounded-full mb-6">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${result.matchPercent}%` }}
                    />
                  </div>

                  <p className="text-white/80 text-sm leading-relaxed mb-6">{result.reason}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {recommendedProgram.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-xs text-white/90"
                      >
                        <Check size={12} className="text-white/60 flex-shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-sage rounded-2xl p-5 mb-8 text-center">
                <p className="text-sm text-text-mid">
                  <span className="font-semibold text-primary">이런 분께 추천!</span>{" "}
                  {recommendedProgram.bestFor}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (recommendedProgram) {
                      setSelectedProgramId(recommendedProgram.id as "stay" | "half" | "daynight");
                    }
                    document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto bg-primary text-white px-10 py-3.5 rounded-full font-semibold text-sm hover:bg-primary-light transition-all shadow-md text-center"
                >
                  이 프로그램 예약하기
                </button>
                <button
                  onClick={() => setShowPopup(true)}
                  className="w-full sm:w-auto border-2 border-primary text-primary px-8 py-3.5 rounded-full font-semibold text-sm hover:bg-primary/5 transition-all text-center"
                >
                  상세 내용 보기
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-border text-text-mid px-8 py-3.5 rounded-full font-semibold text-sm hover:border-primary/30 transition-all"
                >
                  <RotateCcw size={14} />
                  다시 해보기
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Detail Popup */}
      {showPopup && recommendedProgram && result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in p-8">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${recommendedProgram.color} flex items-center justify-center`}>
                <recommendedProgram.icon size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-dark">{recommendedProgram.title}</h3>
                <p className="text-sm text-text-light">{recommendedProgram.duration} | {recommendedProgram.price}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-primary">적합도</span>
                <span className="text-sm text-text-light">{result.matchPercent}%</span>
              </div>
              <div className="w-full h-2 bg-sage rounded-full">
                <div className="h-full bg-primary rounded-full" style={{ width: `${result.matchPercent}%` }} />
              </div>
            </div>

            <p className="text-text-mid text-sm leading-relaxed mb-6">{result.reason}</p>

            <div className="mb-6">
              <p className="text-sm font-semibold text-text-dark mb-3">포함 사항</p>
              <div className="space-y-2">
                {recommendedProgram.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 bg-sage/50 rounded-xl px-4 py-3 text-sm text-text-mid">
                    <Check size={14} className="text-primary flex-shrink-0" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-sage rounded-2xl p-4 mb-6">
              <p className="text-sm text-text-mid">
                <span className="font-semibold text-primary">추천 대상:</span> {recommendedProgram.bestFor}
              </p>
            </div>

            <button
              onClick={() => {
                if (recommendedProgram) {
                  setSelectedProgramId(recommendedProgram.id as "stay" | "half" | "daynight");
                }
                setShowPopup(false);
                document.getElementById("reservation")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="block w-full bg-primary text-white text-center py-4 rounded-2xl font-semibold hover:bg-primary-light transition-colors"
            >
              예약하기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
