import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 로그인 | 달팽이아지트",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
