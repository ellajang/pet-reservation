import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // 승인(confirmed) 시 시간 충돌 체크
  if (body.status === "confirmed") {
    // 현재 예약 정보 가져오기
    const { data: current } = await supabase
      .from("reservations")
      .select("date, start_time, end_time")
      .eq("id", id)
      .single();

    if (current) {
      const { data: conflicts } = await supabase
        .from("reservations")
        .select("id")
        .eq("date", current.date)
        .neq("id", id)
        .in("status", ["confirmed", "completed"])
        .lt("start_time", current.end_time)
        .gt("end_time", current.start_time);

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: "해당 시간대에 이미 확정된 예약이 있습니다. 시간을 확인해주세요." },
          { status: 409 }
        );
      }
    }
  }

  const { data, error } = await supabase
    .from("reservations")
    .update(body)
    .eq("id", id)
    .select(`
      *,
      customers (*),
      pets (*),
      services (*)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 노쇼 처리 시 고객 노쇼 카운트 증가
  if (body.status === "noshow" && data.customers) {
    await supabase
      .from("customers")
      .update({ no_show_count: (data.customers.no_show_count || 0) + 1 })
      .eq("id", data.customer_id);
  }

  return NextResponse.json(data);
}
