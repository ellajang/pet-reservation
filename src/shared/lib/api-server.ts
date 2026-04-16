import { NextResponse } from "next/server";

// API 에러 응답 헬퍼
export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

// 월의 시작/끝 날짜 계산
export function getMonthRange(month: string) {
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

// 현재 월의 시작/끝 날짜
export function getCurrentMonthRange() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return getMonthRange(month);
}
