import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("consent_forms")
    .insert({
      reservation_id: body.reservationId,
      customer_id: body.customerId,
      pet_id: body.petId,
      health_issues: body.healthIssues || null,
      allergies: body.allergies || null,
      aggression_level: body.aggressionLevel,
      special_requests: body.specialRequests || null,
      signature: body.signature,
      agreed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
