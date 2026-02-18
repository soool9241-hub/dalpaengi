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
              강원도 평창의 자연 속에서
              <br />
              느릿하지만 확실한 휴식을
              <br />
              경험해 보세요.
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
                <span>1544-0000</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span>help@healingstay.com</span>
              </li>
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
                <span>
                  강원도 평창군 대관령면
                  <br />
                  올림픽로 123
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
          <p className="text-xs text-white/30 leading-relaxed">
            사업자등록번호: 123-45-67890 | 대표: 홍길동 | 주소: 강원도 평창군 대관령면 올림픽로 123
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; 2026 달팽이아지트. All rights reserved.
          </p>
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
