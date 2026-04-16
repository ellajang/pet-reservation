import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { errorResponse, getMonthRange } from "@/shared/lib/api-server";

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
    const { start, end } = getMonthRange(month);
    query = query.gte("date", start).lte("date", end);
  }

  const { data, error } = await query;
  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 예약 상태를 완료로 변경
  const { error: updateError } = await supabase
    .from("reservations")
    .update({ status: "completed" })
    .eq("id", body.reservationId);

  if (updateError) return errorResponse(updateError.message);

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

  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}
