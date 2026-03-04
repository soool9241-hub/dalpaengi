"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, Lock, Eye, EyeOff } from "lucide-react";

const quickLinks = [
  { label: "프로그램 안내", href: "#programs" },
  { label: "공간 소개", href: "#spaces" },
  { label: "예약하기", href: "#reservation" },
  { label: "오시는 길", href: "#contact" },
  { label: "문의하기", href: "#contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert("뉴스레터 구독이 완료되었습니다!");
      setEmail("");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/admin";
      } else {
        setError("비밀번호가 올바르지 않습니다");
        setPassword("");
      }
    } catch {
      setError("서버 오류가 발생했습니다");
    } finally {
      setLoading(false);
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
            <button
              onClick={() => { setShowLogin(true); setPassword(""); setError(""); }}
              className="px-3 py-1 rounded-lg border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-xs cursor-pointer"
            >
              관리자 모드
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">관리자 로그인</h2>
              <p className="text-gray-500 text-sm mt-1">비밀번호를 입력하세요</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="relative mb-4">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !password}
                className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "확인 중..." : "로그인"}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
