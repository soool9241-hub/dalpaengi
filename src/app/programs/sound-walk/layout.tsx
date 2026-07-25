import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "달팽이 소리산책 리트릿 | 달팽이아지트",
  description:
    "완주 숲에서 소리를 채집하고 AI로 나만의 음악을 만드는 하루. 2026.9.6(일) 12~18시, 전북 완주 달팽이아지트. 20명 한정, 참가비 99,000원.",
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
      "완주 숲의 소리를 모아 나만의 음악으로. 2026.9.6(일) 12~18시, 20명 한정, 99,000원.",
    images: ["/img/soundwalk-hero.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
