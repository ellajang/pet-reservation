"use client";

import { Calendar, Users, DollarSign, AlertTriangle } from "lucide-react";

const stats = [
  {
    label: "오늘 예약",
    value: "3건",
    icon: Calendar,
    color: "text-primary",
    bg: "bg-indigo-50",
  },
  {
    label: "전체 고객",
    value: "0명",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "이번 달 매출",
    value: "₩0",
    icon: DollarSign,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "노쇼 횟수",
    value: "0건",
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 border border-border shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 오늘의 예약 */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">오늘의 예약</h3>
        </div>
        <div className="p-6">
          <p className="text-muted text-center py-8">
            아직 등록된 예약이 없습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
