import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 시간이 지난 확정 예약을 자동으로 완료 처리
export async function POST() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // 1. 오늘 이전 날짜의 확정 예약 → 완료
  const { data: pastDays, error: err1 } = await supabase
    .from("reservations")
    .update({ status: "completed" })
    .eq("status", "confirmed")
    .lt("date", today)
    .select("id");

  // 2. 오늘 중 종료 시간이 지난 확정 예약 → 완료
  const { data: pastToday, error: err2 } = await supabase
    .from("reservations")
    .update({ status: "completed" })
    .eq("status", "confirmed")
    .eq("date", today)
    .lt("end_time", currentTime)
    .select("id");

  if (err1 || err2) {
    return NextResponse.json({ error: "자동 완료 처리 실패" }, { status: 500 });
  }

  const count = (pastDays?.length || 0) + (pastToday?.length || 0);
  return NextResponse.json({ completed: count });
}
