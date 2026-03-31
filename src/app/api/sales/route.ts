import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month"); // YYYY-MM

  // 완료된 예약 기반 매출 조회
  let query = supabase
    .from("reservations")
    .select(`
      *,
      customers (*),
      pets (*),
      services (*)
    `)
    .eq("status", "completed")
    .order("date", { ascending: false });

  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    query = query
      .gte("date", `${month}-01`)
      .lte("date", `${month}-${String(lastDay).padStart(2, "0")}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 예약 상태를 완료로 변경
  await supabase
    .from("reservations")
    .update({ status: "completed" })
    .eq("id", body.reservationId);

  // 매출 기록
  const { data, error } = await supabase
    .from("sales")
    .insert({
      reservation_id: body.reservationId,
      amount: body.amount,
      payment_method: body.paymentMethod,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
