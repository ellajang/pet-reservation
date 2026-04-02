import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("shop_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  // 설정은 항상 1개만 존재
  const { data: existing } = await supabase
    .from("shop_settings")
    .select("id")
    .limit(1)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "설정을 찾을 수 없습니다" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("shop_settings")
    .update({
      shop_name: body.shopName,
      business_hours_start: body.businessHoursStart,
      business_hours_end: body.businessHoursEnd,
      closed_days: body.closedDays,
    })
    .eq("id", existing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
