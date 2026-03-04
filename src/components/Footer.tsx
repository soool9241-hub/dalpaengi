"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

const quickLinks = [
  { label: "프로그램 안내", href: "#programs" },
  { label: "공간 소개", href: "#spaces" },
  { label: "예약하기", href: "#reservation" },
  { label: "오시는 길", href: "#contact" },
  { label: "문의하기", href: "#contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("뉴스레터 구독이 완료되었습니다!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>🐌</span> 달팽이아지트
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              서로다른 우리들의 이야기가
              <br />
              만들어지는 공간
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4">바로가기</h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Center */}
          <div>
            <h4 className="text-base font-semibold mb-4">고객센터</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="w-4 h-4 text-white/40 flex-shrink-0" />
                <a href="tel:01085319531" className="hover:text-white transition-colors">010-8531-9531</a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <svg className="w-4 h-4 text-white/40 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.58 2 11c0 2.83 1.82 5.32 4.59 6.77L5.59 21l4.23-2.35c.7.12 1.43.18 2.18.18 5.5 0 10-3.58 10-8S17.5 3 12 3z"/></svg>
                <a href="https://pf.kakao.com/_sool9241/chat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">카카오톡 상담</a>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span>sool9241@naver.com</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <span>
                  전북 완주군 소양면
                  <br />
                  해월신왕길 92
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-semibold mb-4">뉴스레터</h4>
            <p className="text-white/60 text-sm mb-4">
              특별한 혜택과 새로운 소식을 받아보세요
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-primary-light hover:bg-primary transition-colors"
              >
                <Send size={16} className="text-white" />
              </button>
            </form>
          </div>
        </div>

        {/* Business Info */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <p className="text-xs text-white/30 leading-relaxed break-keep">
            달팽이아지트
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            주소: 전북 완주군 소양면 해월신왕길 92
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <a
            href="/admin/login"
            className="text-sm text-white/40 hover:text-white/40"
            aria-label="관리자"
          >
            &copy; 2026 달팽이아지트. All rights reserved.
          </a>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">
              이용약관
            </a>
            <a href="#" className="hover:text-white transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-white transition-colors">
              사업자정보확인
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
