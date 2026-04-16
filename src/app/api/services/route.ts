import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { errorResponse } from "@/shared/lib/api-server";

export async function GET() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("services")
    .insert({
      name: body.name,
      duration: body.duration,
      price: body.price,
      description: body.description || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}
