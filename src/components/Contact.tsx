"use client";

import { MessageCircle, Phone, Clock, CalendarCheck, LogOut } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-3">
            CONTACT
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4">
            문의하기
          </h2>
          <p className="text-text-light">
            궁금한 점이 있으시면 편하게 연락해주세요
          </p>
        </div>

        {/* Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* KakaoTalk */}
          <div className="bg-[#FEE500]/10 border border-[#FEE500]/30 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-[#FEE500] flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={24} className="text-[#3C1E1E]" />
            </div>
            <h3 className="text-lg font-bold text-text-dark mb-1">카카오톡 채널</h3>
            <p className="text-sm text-text-light mb-4">실시간 채팅 상담</p>
            <a href="https://pf.kakao.com/_sool9241/chat" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-[#FEE500] text-[#3C1E1E] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FDD835] transition-colors">
              카카오톡 상담하기
            </a>
          </div>

          {/* Phone */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center hover:shadow-lg transition-all">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Phone size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-dark mb-1">전화 문의</h3>
            <p className="text-sm text-text-light mb-4">010-8531-9531</p>
            <a
              href="tel:010-8531-9531"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              전화 걸기
            </a>
          </div>
        </div>

        {/* Operating Hours & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-2xl p-5 text-center">
            <Clock size={20} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-dark mb-1">운영 시간</p>
            <p className="text-xs text-text-light">
              평일 09:00 - 18:00
              <br />
              주말 및 공휴일 10:00 - 17:00
            </p>
          </div>
          <div className="bg-background rounded-2xl p-5 text-center">
            <CalendarCheck size={20} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-dark mb-1">체크인</p>
            <p className="text-xs text-text-light">오후 3시 이후</p>
          </div>
          <div className="bg-background rounded-2xl p-5 text-center">
            <LogOut size={20} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-text-dark mb-1">체크아웃</p>
            <p className="text-xs text-text-light">오전 11시까지</p>
          </div>
        </div>
      </div>
    </section>
  );
}
