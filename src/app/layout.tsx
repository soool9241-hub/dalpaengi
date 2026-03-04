import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "달팽이아지트 펜션 | 서로다른 우리의 이야기가 피어나는 공간",
  description: "전북 완주 자연 속 단체 펜션. 15~60명 숙박, 바베큐, 물놀이, 목공 체험, MT/워크샵/가족모임에 최적화된 프로그램을 제공합니다. 온라인 실시간 예약 가능!",
  keywords: ["달팽이아지트", "완주 펜션", "단체 펜션", "MT 펜션", "워크샵", "가족모임", "바베큐", "물놀이", "전북 펜션", "완주 숙박"],
  authors: [{ name: "달팽이아지트 펜션" }],
  creator: "달팽이아지트",
  metadataBase: new URL("https://dalpaengi-five.vercel.app"),
  openGraph: {
    title: "달팽이아지트 펜션 | 서로다른 우리의 이야기가 피어나는 공간",
    description: "전북 완주 단체 펜션. 15~60명 숙박, 바베큐, 물놀이, 목공 체험. MT/워크샵/가족모임 최적화. 온라인 실시간 예약!",
    url: "https://dalpaengi-five.vercel.app",
    siteName: "달팽이아지트 펜션",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "달팽이아지트 펜션 | 서로다른 우리의 이야기가 피어나는 공간",
    description: "전북 완주 단체 펜션. 숙박, 바베큐, 물놀이, 목공 체험. 온라인 실시간 예약!",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
