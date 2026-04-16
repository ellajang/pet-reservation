import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { errorResponse } from "@/shared/lib/api-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("services")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 소프트 삭제 (is_active = false)
  const { error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return errorResponse(error.message);
  return NextResponse.json({ success: true });
}
