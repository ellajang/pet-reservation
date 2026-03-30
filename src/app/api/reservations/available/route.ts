import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 특정 날짜의 예약 가능한 시간대 조회
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const duration = parseInt(request.nextUrl.searchParams.get("duration") || "60");

  if (!date) {
    return NextResponse.json({ error: "날짜가 필요합니다" }, { status: 400 });
  }

  // 해당 날짜의 활성 예약 조회
  const { data: reservations } = await supabase
    .from("reservations")
    .select("start_time, end_time")
    .eq("date", date)
    .not("status", "eq", "cancelled");

  // 전체 시간 슬롯
  const allSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00",
  ];

  // 각 슬롯이 예약 가능한지 체크
  const available = allSlots.map((slot) => {
    const [slotH, slotM] = slot.split(":").map(Number);
    const slotStart = slotH * 60 + slotM;
    const slotEnd = slotStart + duration;

    const isBlocked = (reservations || []).some((r) => {
      const [rStartH, rStartM] = r.start_time.split(":").map(Number);
      const [rEndH, rEndM] = r.end_time.split(":").map(Number);
      const rStart = rStartH * 60 + rStartM;
      const rEnd = rEndH * 60 + rEndM;

      // 시간이 겹치는지 확인
      return slotStart < rEnd && slotEnd > rStart;
    });

    return { time: slot, available: !isBlocked };
  });

  return NextResponse.json(available);
}
