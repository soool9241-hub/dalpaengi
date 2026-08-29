import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "달팽이 프라이빗 멤버십 | 달팽이아지트",
  description:
    "내걸 내놓고 입장하는 멤버십. 주 1회 AI 레퍼런스 공유회, 월 1회 빌더데이 6시간, 달팽이 라운지 자유석, 항아리 바베큐 모임 우선 좌석까지. 월 30만원 · 기수당 20명 · 최소 3개월.",
  keywords: [
    "달팽이 프라이빗 멤버십",
    "AI 멤버십",
    "빌더데이",
    "전주 AI 커뮤니티",
    "완주 커뮤니티",
    "사업 시스템 개발",
    "트래픽 쉐어",
    "달팽이아지트",
  ],
  openGraph: {
    title: "달팽이 프라이빗 멤버십 — 내걸 내놓고 입장하는 멤버십",
    description:
      "우리는 트래픽으로 단단해지길 원합니다. 주 1회 공유회 · 월 1회 빌더데이 · 라운지 자유석 · 항바모 우선 좌석. 기수당 20명 한정.",
    images: ["/img/living-room-wide.jpg"],
    type: "website",
  },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
