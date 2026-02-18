"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "체크인/체크아웃 시간은 어떻게 되나요?",
    answer:
      "체크인은 오후 3시부터 가능하며, 체크아웃은 오전 11시까지입니다. 얼리 체크인이나 레이트 체크아웃은 사전 문의 시 가능 여부를 안내드립니다.",
  },
  {
    question: "예약 취소는 언제까지 가능한가요?",
    answer:
      "예약일 기준 7일 전까지 무료 취소가 가능합니다. 3~6일 전 취소 시 50% 환불, 2일 전부터는 환불이 불가합니다. 천재지변 등 불가항력적인 사유의 경우 별도 문의해주세요.",
  },
  {
    question: "프로그램은 어떻게 신청하나요?",
    answer:
      "홈페이지 예약 페이지에서 원하시는 날짜와 프로그램을 선택하여 예약하실 수 있습니다. 단체 예약이나 맞춤 프로그램은 전화 또는 카카오톡으로 문의해주세요.",
  },
  {
    question: "주차가 가능한가요?",
    answer:
      "네, 무료 주차가 가능합니다. 대형 버스 주차도 가능하며, 주차 공간이 넉넉하니 편하게 이용해주세요.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-24 px-4 bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
            자주 묻는 질문
          </h2>
          <p className="text-text-light">
            궁금한 점이 있으시면 아래 내용을 확인해주세요
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border transition-all ${
                openIndex === i ? "border-primary/30 shadow-md" : "border-border"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle
                    size={18}
                    className={`flex-shrink-0 transition-colors ${
                      openIndex === i ? "text-primary" : "text-text-light"
                    }`}
                  />
                  <span
                    className={`font-medium text-sm transition-colors ${
                      openIndex === i ? "text-primary" : "text-text-dark"
                    }`}
                  >
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-text-light transition-transform duration-300 ${
                    openIndex === i ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 animate-slide-up">
                  <div className="pl-8 border-l-2 border-primary/20">
                    <p className="text-sm text-text-mid leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
