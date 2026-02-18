import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "달팽이아지트 펜션 | 서로다른 우리의 이야기가 피어나는 공간",
  description: "강원도 평창 자연 속 힐링 펜션. 숙박, 단체 프로그램, 바베큐 등 다양한 패키지를 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
