import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "달팽이 소리산책 리트릿 | 달팽이아지트",
  description:
    "채집·창작·공유 — 완주 숲의 소리를 직접 녹음하고, 그 소리를 원소스로 AI 음악을 만들어 함께 나누는 하루. 일정 조율 중 (6시간), 전북 완주 달팽이아지트. 사전예약 특가 50% (200,000원 → 99,000원), 선착순 20명.",
  keywords: [
    "달팽이아지트",
    "완주 리트릿",
    "소리산책",
    "사운드워킹",
    "AI음악",
    "웰니스",
    "힐링",
    "전북 체험",
    "완주 펜션",
  ],
  openGraph: {
    title: "달팽이 소리산책 리트릿 | 달팽이아지트",
    description:
      "채집 · 창작 · 공유 — 완주 숲의 소리로 나만의 음악을 만드는 하루. 일정 조율 중 · 사전예약 특가 50% (200,000원 → 99,000원) · 선착순 20명.",
    images: ["/img/soundwalk-hero.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
