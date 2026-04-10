"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone, Calendar } from "lucide-react";

export default function FloatingCTA() {
  const pathname = usePathname();

  // 관리자 페이지, SMS 페이지에서는 숨김
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/sms")) return null;

  const isRetreat = pathname?.startsWith("/programs/spring-retreat");

  // 리트릿 페이지는 담당자가 다름
  const config = isRetreat
    ? {
        kakao: "https://open.kakao.com/o/ssowhRlg",
        tel: "010-5314-0146",
        reservation: "#apply",
      }
    : {
        kakao: "https://pf.kakao.com/_sool9241/chat",
        tel: "010-8531-9531",
        reservation: "#reservation",
      };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] animate-slide-up"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
        <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-3">
          <a
            href={config.kakao}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 flex-1 py-3 bg-[#FEE500] text-[#3C1E1E] rounded-xl font-bold text-sm hover:brightness-95 transition-all"
          >
            <MessageCircle size={16} /> 카톡 상담
          </a>
          <a
            href={`tel:${config.tel}`}
            className="flex items-center justify-center gap-1.5 flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all"
          >
            <Phone size={16} /> 전화하기
          </a>
          <a
            href={config.reservation}
            className="flex items-center justify-center gap-1.5 flex-[1.5] py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
          >
            <Calendar size={16} /> 신청하기
          </a>
        </div>
      </div>
    </div>
  );
}
