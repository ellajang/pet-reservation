import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { errorResponse } from "@/shared/lib/api-server";

// 반려견 추가
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("pets")
    .insert({
      customer_id: body.customerId,
      name: body.name,
      breed: body.breed,
      weight: body.weight || null,
      gender: body.gender || "male",
      neutered: body.neutered || false,
      special_notes: body.specialNotes || null,
      size_category: body.sizeCategory || "small",
    })
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}
