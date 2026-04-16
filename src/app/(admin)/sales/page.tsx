"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useSales } from "@/hooks/useSales";

interface SalesItem {
  id: string;
  date: string;
  price: number;
  status: string;
  customers: { name: string };
  pets: { name: string };
  services: { name: string };
}

export default function SalesPage() {
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const { data: sales = [], isLoading: loading } = useSales(month) as {
    data: SalesItem[];
    isLoading: boolean;
  };

  const totalAmount = sales.reduce((sum, s) => sum + s.price, 0);
  const avgAmount = sales.length > 0 ? Math.round(totalAmount / sales.length) : 0;

  // 서비스별 통계
  const serviceStats = sales.reduce<Record<string, { count: number; total: number }>>(
    (acc, s) => {
      const name = s.services?.name || "기타";
      if (!acc[name]) acc[name] = { count: 0, total: 0 };
      acc[name].count++;
      acc[name].total += s.price;
      return acc;
    },
    {}
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">매출 통계</h2>
        <input
          type="month" aria-label="월 선택"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted">이번 달 매출</p>
          <p className="text-2xl font-bold mt-1">
            {loading ? "-" : `₩${totalAmount.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted">완료 건수</p>
          <p className="text-2xl font-bold mt-1">
            {loading ? "-" : `${sales.length}건`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted">건당 평균</p>
          <p className="text-2xl font-bold mt-1">
            {loading ? "-" : `₩${avgAmount.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* 서비스별 통계 */}
      {Object.keys(serviceStats).length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm mb-8">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">서비스별 매출</h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(serviceStats)
              .sort(([, a], [, b]) => b.total - a.total)
              .map(([name, stat]) => (
                <div key={name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted">{stat.count}건</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₩{stat.total.toLocaleString()}</p>
                    <p className="text-xs text-muted">
                      {totalAmount > 0
                        ? `${Math.round((stat.total / totalAmount) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 매출 내역 */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">매출 내역</h3>
        </div>
        {loading ? (
          <p className="text-muted text-center py-8">불러오는 중...</p>
        ) : sales.length === 0 ? (
          <p className="text-muted text-center py-8">매출 내역이 없습니다</p>
        ) : (
          <div className="divide-y divide-border">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {sale.customers?.name} / {sale.pets?.name}
                  </p>
                  <p className="text-sm text-muted">
                    {sale.date} · {sale.services?.name}
                  </p>
                </div>
                <p className="font-semibold">₩{sale.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
