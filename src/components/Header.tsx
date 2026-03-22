"use client";

import { useState, useEffect } from "react";
import { Menu, X, Phone, ChevronDown, Settings } from "lucide-react";

const navLinks = [
  { label: "프로그램", href: "#programs" },
  { label: "공간", href: "#spaces" },
  { label: "갤러리", href: "#gallery" },
  { label: "후기", href: "#reviews" },
  { label: "예약", href: "#reservation" },
  { label: "FAQ", href: "#faq" },
  { label: "문의", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl">🐌</span>
            <div>
              <span
                className={`text-lg font-bold transition-colors ${
                  scrolled ? "text-primary-dark" : "text-white"
                }`}
              >
                달팽이아지트
              </span>
              <span
                className={`hidden sm:block text-[10px] tracking-wider transition-colors ${
                  scrolled ? "text-text-light" : "text-white/60"
                }`}
              >
                HEALING STAY & PENSION
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  scrolled ? "text-text-mid" : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:010-8531-9531"
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                scrolled ? "text-text-mid" : "text-white/80"
              }`}
            >
              <Phone size={14} />
              010-8531-9531
            </a>
            <a
              href="#reservation"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-light transition-all shadow-md hover:shadow-lg"
            >
              예약하기
            </a>
            <a
              href="/admin-login"
              className={`p-2 rounded-full transition-all opacity-30 hover:opacity-100 ${
                scrolled ? "text-text-light hover:bg-gray-100" : "text-white/40 hover:bg-white/10"
              }`}
              title="관리자"
            >
              <Settings size={16} />
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-1">
            <a
              href="/admin-login"
              className={`p-2 rounded-lg transition-all ${
                scrolled ? "text-text-light hover:bg-gray-100" : "text-white/60 hover:bg-white/10"
              }`}
              title="관리자"
            >
              <Settings size={20} />
            </a>
            <button
              className="p-2 rounded-lg"
              onClick={() => setOpen(!open)}
              aria-label="메뉴"
            >
              {open ? (
                <X size={24} className={scrolled ? "text-text-dark" : "text-white"} />
              ) : (
                <Menu size={24} className={scrolled ? "text-text-dark" : "text-white"} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-border animate-fade-in shadow-lg">
          <nav className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-mid hover:text-primary hover:bg-sage/30 py-3 px-4 rounded-xl text-sm font-medium transition-all"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <hr className="my-2 border-border" />
            <a
              href="tel:010-8531-9531"
              className="flex items-center gap-2 text-sm text-text-mid py-3 px-4"
            >
              <Phone size={14} />
              010-8531-9531
            </a>
            <a
              href="#reservation"
              className="bg-primary text-white text-center py-3 rounded-xl text-sm font-semibold mt-2"
              onClick={() => setOpen(false)}
            >
              예약하기
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
