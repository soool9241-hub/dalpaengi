import type { MetadataRoute } from "next";

const BASE = "https://dalpaengi-five.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: BASE, lastModified, changeFrequency: "weekly", priority: 1 },
    // 프로그램 랜딩 페이지 — 검색·광고 심사에서 색인되어야 하므로 함께 노출
    //
    // TODO(sol): soundwalk_applications 테이블 생성 후 아래 한 줄 주석 해제.
    // 테이블이 없으면 신청폼이 저장 실패하므로, 그때까지는 색인에서 빼둔다.
    // { url: `${BASE}/programs/sound-walk`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/programs/spring-retreat`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/programs/vibe-coding`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/programs/jiff`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
