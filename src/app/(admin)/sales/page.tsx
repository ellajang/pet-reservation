"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, CreditCard, Banknote } from "lucide-react";

const monthlySales = [
  { month: "1월", amount: 0 },
  { month: "2월", amount: 0 },
  { month: "3월", amount: 850000 },
];

const recentSales = [
  {
    id: "1",
    date: "2026-03-28",
    customerName: "김민지",
    petName: "초코",
    service: "전체미용",
    amount: 50000,
    method: "card" as const,
  },
  {
    id: "2",
    date: "2026-03-27",
    customerName: "이수진",
    petName: "몽이",
    service: "목욕",
    amount: 30000,
    method: "cash" as const,
  },
  {
    id: "3",
    date: "2026-03-25",
    customerName: "박지혜",
    petName: "뭉치",
    service: "전체미용",
    amount: 55000,
    method: "transfer" as const,
  },
];

const methodLabels = {
  cash: "현금",
  card: "카드",
  transfer: "계좌이체",
  other: "기타",
};

const methodIcons = {
  cash: Banknote,
  card: CreditCard,
  transfer: TrendingUp,
  other: DollarSign,
};

export default function SalesPage() {
  const [period, setPeriod] = useState<"daily" | "monthly">("monthly");

  const totalThisMonth = recentSales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">매출 통계</h2>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted">이번 달 매출</p>
          <p className="text-2xl font-bold mt-1">
            ₩{totalThisMonth.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted">이번 달 건수</p>
          <p className="text-2xl font-bold mt-1">{recentSales.length}건</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm">
          <p className="text-sm text-muted">건당 평균</p>
          <p className="text-2xl font-bold mt-1">
            ₩
            {recentSales.length > 0
              ? Math.round(totalThisMonth / recentSales.length).toLocaleString()
              : 0}
          </p>
        </div>
      </div>

      {/* 월별 매출 차트 (간단한 바 차트) */}
      <div className="bg-white rounded-xl border border-border shadow-sm mb-8">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">매출 추이</h3>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setPeriod("daily")}
              className={`px-3 py-1 text-sm rounded-md ${
                period === "daily"
                  ? "bg-white shadow-sm font-medium"
                  : "text-muted"
              }`}
            >
              일별
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-3 py-1 text-sm rounded-md ${
                period === "monthly"
                  ? "bg-white shadow-sm font-medium"
                  : "text-muted"
              }`}
            >
              월별
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-4 h-48">
            {monthlySales.map((m) => {
              const maxAmount = Math.max(
                ...monthlySales.map((s) => s.amount),
                1
              );
              const height = (m.amount / maxAmount) * 100;
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-muted">
                    {m.amount > 0
                      ? `₩${(m.amount / 10000).toFixed(0)}만`
                      : "-"}
                  </span>
                  <div
                    className="w-full bg-primary/20 rounded-t-lg relative"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                      style={{ height: "100%" }}
                    />
                  </div>
                  <span className="text-xs font-medium">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 최근 매출 내역 */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">최근 매출 내역</h3>
        </div>
        <div className="divide-y divide-border">
          {recentSales.map((sale) => {
            const MethodIcon = methodIcons[sale.method];
            return (
              <div
                key={sale.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {sale.customerName} / {sale.petName}
                  </p>
                  <p className="text-sm text-muted">
                    {sale.date} · {sale.service}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₩{sale.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted flex items-center gap-1 justify-end">
                    <MethodIcon className="w-3.5 h-3.5" />
                    {methodLabels[sale.method]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
