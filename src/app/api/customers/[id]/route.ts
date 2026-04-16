import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";
import { errorResponse } from "@/shared/lib/api-server";

// 고객 상세 조회 (예약 이력 포함)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [customerRes, reservationsRes] = await Promise.all([
    supabase.from("customers").select("*, pets(*)").eq("id", id).single(),
    supabase
      .from("reservations")
      .select("*, services(*)")
      .eq("customer_id", id)
      .order("date", { ascending: false })
      .limit(20),
  ]);

  if (customerRes.error) {
    return errorResponse(customerRes.error.message);
  }

  return NextResponse.json({
    customer: customerRes.data,
    reservations: reservationsRes.data || [],
  });
}

// 고객 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // 고객 정보 수정
  if (body.customer) {
    const { error } = await supabase
      .from("customers")
      .update({
        name: body.customer.name,
        phone: body.customer.phone,
        memo: body.customer.memo || null,
      })
      .eq("id", id);
    if (error) return errorResponse(error.message);
  }

  // 반려견 정보 수정
  if (body.pet) {
    const { error } = await supabase
      .from("pets")
      .update({
        name: body.pet.name,
        breed: body.pet.breed,
        weight: body.pet.weight || null,
        gender: body.pet.gender,
        neutered: body.pet.neutered,
        special_notes: body.pet.specialNotes || null,
        size_category: body.pet.sizeCategory || "small",
      })
      .eq("id", body.pet.id);
    if (error) return errorResponse(error.message);
  }

  return NextResponse.json({ success: true });
}
