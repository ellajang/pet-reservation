import { NextResponse } from "next/server";
import { supabase } from "@/shared/lib/supabase";

export async function GET() {
  const now = new Date();
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStartStr = lastMonthStart.toISOString().split("T")[0];
  const lastMonthEndStr = lastMonthEnd.toISOString().split("T")[0];

  const [
    customersRes,
    petsRes,
    reservationsRes,
    thisMonthRes,
    lastMonthCustomersRes,
  ] = await Promise.all([
    // 전체 고객
    supabase.from("customers").select("*"),
    // 전체 반려견
    supabase.from("pets").select("*"),
    // 전체 완료 예약
    supabase
      .from("reservations")
      .select("*, services(*)")
      .eq("status", "completed"),
    // 이번 달 신규 고객
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thisMonthStart),
    // 지난달 신규 고객
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", lastMonthStartStr)
      .lte("created_at", lastMonthEndStr),
  ]);

  const customers = customersRes.data || [];
  const pets = petsRes.data || [];
  const completedReservations = reservationsRes.data || [];

  // 1. 기본 통계
  const totalCustomers = customers.length;
  const thisMonthNew = thisMonthRes.count || 0;
  const blockedCount = customers.filter((c) => c.is_blocked).length;

  // 2. 재방문율: 2회 이상 예약한 고객 비율
  const customerVisitCount: Record<string, number> = {};
  completedReservations.forEach((r) => {
    customerVisitCount[r.customer_id] = (customerVisitCount[r.customer_id] || 0) + 1;
  });
  const returningCustomers = Object.values(customerVisitCount).filter((c) => c >= 2).length;
  const visitedCustomers = Object.keys(customerVisitCount).length;
  const revisitRate = visitedCustomers > 0 ? Math.round((returningCustomers / visitedCustomers) * 100) : 0;

  // 3. 평균 방문 주기 (일)
  const customerDates: Record<string, string[]> = {};
  completedReservations.forEach((r) => {
    if (!customerDates[r.customer_id]) customerDates[r.customer_id] = [];
    customerDates[r.customer_id].push(r.date);
  });
  let totalGap = 0;
  let gapCount = 0;
  Object.values(customerDates).forEach((dates) => {
    if (dates.length < 2) return;
    const sorted = dates.sort();
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / (1000 * 60 * 60 * 24);
      totalGap += diff;
      gapCount++;
    }
  });
  const avgVisitCycle = gapCount > 0 ? Math.round(totalGap / gapCount) : 0;

  // 4. 노쇼율
  const totalNoshow = customers.reduce((sum, c) => sum + (c.no_show_count || 0), 0);
  const totalReservations = completedReservations.length + totalNoshow;
  const noshowRate = totalReservations > 0 ? Math.round((totalNoshow / totalReservations) * 100) : 0;

  // 5. 견종별 분포
  const breedCount: Record<string, number> = {};
  pets.forEach((p) => {
    const breed = p.breed || "기타";
    breedCount[breed] = (breedCount[breed] || 0) + 1;
  });
  const breedDistribution = Object.entries(breedCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([breed, count]) => ({
      breed,
      count,
      percentage: pets.length > 0 ? Math.round((count / pets.length) * 100) : 0,
    }));

  // 6. 서비스별 이용 분석
  const serviceCount: Record<string, { count: number; revenue: number; name: string }> = {};
  completedReservations.forEach((r) => {
    const name = r.services?.name || "기타";
    if (!serviceCount[name]) serviceCount[name] = { count: 0, revenue: 0, name };
    serviceCount[name].count++;
    serviceCount[name].revenue += r.price || 0;
  });
  const serviceAnalysis = Object.values(serviceCount)
    .sort((a, b) => b.count - a.count);

  // 7. 월별 신규 고객 추이 (최근 6개월)
  const monthlyNew: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    const count = customers.filter((c) => {
      const created = c.created_at?.split("T")[0];
      return created >= mStart && created <= mEnd;
    }).length;
    monthlyNew.push({
      month: `${d.getMonth() + 1}월`,
      count,
    });
  }

  // 8. 단골 고객 TOP 5
  const topCustomers = Object.entries(customerVisitCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([customerId, visits]) => {
      const customer = customers.find((c) => c.id === customerId);
      const revenue = completedReservations
        .filter((r) => r.customer_id === customerId)
        .reduce((sum, r) => sum + (r.price || 0), 0);
      return {
        name: customer?.name || "알 수 없음",
        visits,
        revenue,
      };
    });

  return NextResponse.json({
    summary: {
      totalCustomers,
      thisMonthNew,
      revisitRate,
      avgVisitCycle,
      noshowRate,
      blockedCount,
    },
    breedDistribution,
    serviceAnalysis,
    monthlyNew,
    topCustomers,
  });
}
