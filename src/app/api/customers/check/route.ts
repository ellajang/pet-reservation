import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "전화번호가 필요합니다" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("customers")
    .select(`*, pets (*)`)
    .eq("phone", phone)
    .single();

  if (error || !data) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true, customer: data });
}
