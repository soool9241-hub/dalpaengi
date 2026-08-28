import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "항아리 바베큐 모임 | 달팽이아지트",
  description:
    "항아리 속 장시간 훈연으로 육즙은 가득, 기름기는 쏙 빠진 항아리 바베큐를 함께 즐기며 AI 자동수익 인사이트를 나누는 저녁 모임. 2026.9.8(화) 저녁, 전북 완주 달팽이아지트. 바베큐만 3만원 · 바베큐+스터디 6만원 · 스터디만 3만원 중 선택, 선착순 6명.",
  keywords: [
    "달팽이아지트",
    "항아리바베큐",
    "완주 모임",
    "전주 모임",
    "미식클럽",
    "AI 자동수익",
    "네트워킹",
    "소양 펜션",
    "동네 모임",
  ],
  openGraph: {
    title: "항아리 바베큐 모임 | 달팽이아지트",
    description:
      "항아리 훈연 바베큐 + AI 자동수익 인사이트. 2026.9.8(화) 저녁 · 원하는 코스만 선택 (30,000원~60,000원) · 선착순 6명.",
    images: ["/img/bbq-night.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
