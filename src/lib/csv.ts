// CSV 생성·다운로드 유틸 (관리자 데이터 내보내기 공용).
// - buildCsv: 순수 문자열 생성. 서버(라우트)·클라이언트 양쪽에서 사용.
// - downloadCsv: 브라우저 전용. 클릭 시점에만 호출되므로 서버 import 되어도 안전.
// Excel 한글 깨짐 방지를 위해 UTF-8 BOM 을 앞에 붙인다.

export type CsvCell = string | number | boolean | null | undefined;

const BOM = "﻿";

function escapeCell(v: CsvCell): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // 콤마·따옴표·개행 포함 시 큰따옴표로 감싸고 내부 따옴표는 두 번으로 이스케이프
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// headers + rows → CSV 문자열 (BOM 포함)
export function buildCsv(headers: string[], rows: CsvCell[][]): string {
  const lines = [headers.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCell).join(","));
  }
  return BOM + lines.join("\r\n");
}

// 여러 섹션(제목 + 표)을 한 파일에 담는다. 매출 지표처럼 표가 여러 개일 때 사용.
export interface CsvSection {
  title: string;
  headers: string[];
  rows: CsvCell[][];
}

export function buildSectionedCsv(sections: CsvSection[]): string {
  const blocks: string[] = [];
  for (const sec of sections) {
    const lines = [escapeCell(`■ ${sec.title}`), sec.headers.map(escapeCell).join(",")];
    for (const row of sec.rows) lines.push(row.map(escapeCell).join(","));
    blocks.push(lines.join("\r\n"));
  }
  return BOM + blocks.join("\r\n\r\n");
}

// 브라우저에서 CSV 문자열을 파일로 다운로드
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// YYYYMMDD (파일명용) — 로컬 기준
export function todayStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}
