import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { errorResponse } from "@/shared/lib/api-server";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";

  let query = supabase
    .from("customers")
    .select(`
      *,
      pets (*)
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return errorResponse(error.message);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customer, pet } = body;

  // 고객 등록
  const { data: customerData, error: customerError } = await supabase
    .from("customers")
    .insert({
      name: customer.name,
      phone: customer.phone,
      memo: customer.memo || null,
    })
    .select()
    .single();

  if (customerError) {
    return errorResponse(customerError.message);
  }

  // 반려견 등록
  const { data: petData, error: petError } = await supabase
    .from("pets")
    .insert({
      customer_id: customerData.id,
      name: pet.name,
      breed: pet.breed,
      weight: pet.weight || null,
      gender: pet.gender,
      neutered: pet.neutered,
      special_notes: pet.specialNotes || null,
    })
    .select()
    .single();

  if (petError) {
    return errorResponse(petError.message);
  }

  return NextResponse.json({ customer: customerData, pet: petData });
}
