import { NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";

export async function GET() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthEnd = `${today.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`;

  const [todayRes, customersRes, monthSalesRes, noshowRes, pendingRes] = await Promise.all([
    // 오늘 예약
    supabase
      .from("reservations")
      .select(`*, customers (*), pets (*), services (*)`)
      .eq("date", today)
      .neq("status", "cancelled")
      .order("start_time"),
    // 전체 고객 수
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),
    // 이번 달 매출
    supabase
      .from("reservations")
      .select("price")
      .eq("status", "completed")
      .gte("date", monthStart)
      .lte("date", monthEnd),
    // 이번 달 노쇼
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "noshow")
      .gte("date", monthStart)
      .lte("date", monthEnd),
    // 승인 대기 예약
    supabase
      .from("reservations")
      .select(`*, customers (*), pets (*), services (*)`)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const monthlyRevenue = (monthSalesRes.data || []).reduce(
    (sum, r) => sum + (r.price || 0),
    0
  );

  return NextResponse.json({
    todayReservations: todayRes.data || [],
    pendingReservations: pendingRes.data || [],
    totalCustomers: customersRes.count || 0,
    monthlyRevenue,
    monthlyNoshow: noshowRes.count || 0,
  });
}
