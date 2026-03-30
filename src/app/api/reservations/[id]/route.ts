import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

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
