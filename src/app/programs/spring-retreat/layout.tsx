import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "완주하다 봄 리트릿 | 달팽이아지트",
  description: "몸, 마음, 의식을 깨우는 1박 2일 리트릿. 2026.4.18~19, 전북 완주 달팽이아지트. 참가자 20명 한정, 얼리버드 9만원.",
  openGraph: {
    title: "완주하다 봄 리트릿 | 달팽이아지트",
    description: "몸, 마음, 의식을 깨우는 1박 2일 리트릿. 2026.4.18~19, 참가자 20명 한정.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
