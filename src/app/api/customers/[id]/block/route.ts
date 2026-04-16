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
    .from("customers")
    .update({
      is_blocked: body.blocked,
      block_reason: body.reason || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}
