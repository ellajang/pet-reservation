"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";

interface DashboardData {
  todayReservations: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    customers: { name: string };
    pets: { name: string };
    services: { name: string };
  }>;
  totalCustomers: number;
  monthlyRevenue: number;
  monthlyNoshow: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "오늘 예약",
      value: loading ? "-" : `${data?.todayReservations.length || 0}건`,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-indigo-50",
    },
    {
      label: "전체 고객",
      value: loading ? "-" : `${data?.totalCustomers || 0}명`,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "이번 달 매출",
      value: loading
        ? "-"
        : `₩${(data?.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "이번 달 노쇼",
      value: loading ? "-" : `${data?.monthlyNoshow || 0}건`,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
    noshow: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    confirmed: "확정",
    completed: "완료",
    cancelled: "취소",
    noshow: "노쇼",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>

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

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">오늘의 예약</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-muted text-center py-8">불러오는 중...</p>
          ) : !data?.todayReservations.length ? (
            <p className="text-muted text-center py-8">
              오늘 예약이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {data.todayReservations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <Clock className="w-4 h-4" />
                      {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {r.customers?.name} / {r.pets?.name}
                      </p>
                      <p className="text-sm text-muted">
                        {r.services?.name}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status]}`}
                  >
                    {statusLabels[r.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
