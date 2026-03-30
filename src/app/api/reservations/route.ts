import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const month = request.nextUrl.searchParams.get("month"); // YYYY-MM

  let query = supabase
    .from("reservations")
    .select(`
      *,
      customers (*),
      pets (*),
      services (*)
    `)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (date) {
    query = query.eq("date", date);
  } else if (month) {
    query = query
      .gte("date", `${month}-01`)
      .lte("date", `${month}-31`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 기존 고객인지 확인
  let customerId = body.customerId;
  let petId = body.petId;

  if (!customerId) {
    // 전화번호로 기존 고객 검색
    const { data: existing } = await supabase
      .from("customers")
      .select("id, is_blocked")
      .eq("phone", body.customerPhone)
      .single();

    if (existing) {
      // 차단된 고객 체크
      if (existing.is_blocked) {
        return NextResponse.json(
          { error: "현재 온라인 예약이 어렵습니다. 카카오톡이나 전화로 문의해주세요." },
          { status: 403 }
        );
      }
      customerId = existing.id;
    } else {
      // 신규 고객 등록
      const { data: newCustomer, error } = await supabase
        .from("customers")
        .insert({ name: body.customerName, phone: body.customerPhone })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      customerId = newCustomer.id;
    }
  }

  if (!petId) {
    // 반려견 등록
    const { data: newPet, error } = await supabase
      .from("pets")
      .insert({
        customer_id: customerId,
        name: body.petName,
        breed: body.breed,
        gender: "male",
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    petId = newPet.id;
  }

  // 서비스 정보 가져오기
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", body.serviceId)
    .single();

  if (!service) {
    return NextResponse.json({ error: "서비스를 찾을 수 없습니다" }, { status: 400 });
  }

  // 종료 시간 계산
  const [startHour, startMin] = body.startTime.split(":").map(Number);
  const totalMin = startHour * 60 + startMin + service.duration;
  const endTime = `${Math.floor(totalMin / 60).toString().padStart(2, "0")}:${(totalMin % 60).toString().padStart(2, "0")}`;

  // 시간 충돌 체크 (DB 트리거와 별도로 API 레벨에서도 체크)
  const { data: conflicts } = await supabase
    .from("reservations")
    .select("id")
    .eq("date", body.date)
    .not("status", "eq", "cancelled")
    .lt("start_time", endTime)
    .gt("end_time", body.startTime);

  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: "해당 시간대에 이미 예약이 있습니다. 다른 시간을 선택해주세요." },
      { status: 409 }
    );
  }

  // 예약 등록
  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert({
      customer_id: customerId,
      pet_id: petId,
      service_id: body.serviceId,
      date: body.date,
      start_time: body.startTime,
      end_time: endTime,
      price: service.price,
      memo: body.memo || null,
      status: "pending",
    })
    .select(`
      *,
      customers (*),
      pets (*),
      services (*)
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(reservation);
}
