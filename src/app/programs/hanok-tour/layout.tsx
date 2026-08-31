import type { Metadata } from "next";

/* 외국인 검색 유입이 1순위라 메타는 영어를 앞에 둔다.
   한국어 키워드도 함께 넣어 국내 검색에서도 걸리게 한다. */
export const metadata: Metadata = {
  title: "Korean Culture Day Tour in Jeonju | 달팽이아지트",
  description:
    "A half-day Korean culture experience from Jeonju Hanok Village: a local tofu-village lunch, tea and yakgwa in a 500-pyeong hanok cafe, a woodworking studio tour, and hand-building your own traditional Korean soban tray. Pickup and drop-off included. From KRW 90,000.",
  keywords: [
    "Jeonju tour",
    "Korean culture experience",
    "hanok cafe Jeonju",
    "soban making workshop",
    "Jeonju Hanok Village day trip",
    "Korean traditional craft",
    "전주 외국인 체험",
    "한옥 체험 투어",
    "전통 소반 만들기",
    "달팽이아지트",
  ],
  openGraph: {
    title: "Korean Culture Day Tour — Eat, Rest, and Make Something Korean",
    description:
      "Local tofu-village lunch · tea and yakgwa in a hanok cafe · make your own traditional soban tray. Pickup from Jeonju Hanok Village. From KRW 90,000.",
    images: ["/img/exterior-main.jpg"],
    type: "website",
    locale: "en_US",
  },
};

export default function HanokTourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
