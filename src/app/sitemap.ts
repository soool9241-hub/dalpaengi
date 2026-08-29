import type { MetadataRoute } from "next";

const BASE = "https://dalpaengi-five.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: BASE, lastModified, changeFrequency: "weekly", priority: 1 },
    // 프로그램 랜딩 페이지 — 검색·광고 심사에서 색인되어야 하므로 함께 노출
    { url: `${BASE}/programs/sound-walk`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/programs/bbq`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/membership`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/programs/spring-retreat`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/programs/vibe-coding`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/programs/jiff`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
