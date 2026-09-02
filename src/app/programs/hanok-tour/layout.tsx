import type { Metadata } from "next";

/* 외국인 검색 유입이 1순위라 메타는 영어를 앞에 둔다.
   한국어 키워드도 함께 넣어 국내 검색에서도 걸리게 한다. */
export const metadata: Metadata = {
  title: "Jeonju & Wanju Local Day Tours | 달팽이아지트",
  description:
    "Four ways to spend one day in Wanju, from Jeonju Hanok Village. Every course shares a local tofu-village lunch and a round-trip transfer; you choose the afternoon — build a traditional soban, walk a slow local route, make Korean tea sweets, or spend the day listening. 12:00-18:00, groups of 10-15, KRW 99,000 per person.",
  keywords: [
    "Jeonju day tour",
    "Wanju local experience",
    "Korean culture experience",
    "hanok cafe Jeonju",
    "soban making workshop",
    "Korean tea sweets class",
    "dasik making Korea",
    "Jeonju Hanok Village day trip",
    "전주 외국인 체험",
    "완주 로컬 투어",
    "전통 소반 만들기",
    "다식 만들기 체험",
    "달팽이아지트",
  ],
  openGraph: {
    title: "One Day in Wanju — Four Ways to Spend It",
    description:
      "Soban making · a slow local route · Korean tea sweets · a day of sound. Meet at noon in Jeonju Hanok Village. 6 hours, groups of 10-15, KRW 99,000 per person.",
    images: ["/img/exterior-main.jpg"],
    type: "website",
    locale: "en_US",
  },
};

export default function HanokTourLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
