"use client";

import { useEffect } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  User,
  Check,
  X,
  Ban,
  Dog,
  Phone,
} from "lucide-react";
import {
  useDashboard,
  useAutoComplete,
  useUpdateReservationStatus,
} from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";

interface Reservation {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  customer_id: string;
  customers: { name: string; phone: string };
  pets: { name: string; breed: string };
  services: { name: string };
}

interface DashboardData {
  todayReservations: Reservation[];
  pendingReservations: Reservation[];
  totalCustomers: number;
  monthlyRevenue: number;
  monthlyNoshow: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
  noshow: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "승인 대기",
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
  noshow: "노쇼",
};

export default function DashboardPage() {
  const { data, isLoading: loading } = useDashboard() as {
    data: DashboardData | undefined;
    isLoading: boolean;
  };
  const autoComplete = useAutoComplete();
  const updateStatus = useUpdateReservationStatus();
  const queryClient = useQueryClient();

  // 페이지 로드 시 자동 완료 처리
  useEffect(() => {
    autoComplete.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const blockCustomer = async (customerId: string, customerName: string) => {
    const reason = prompt(
      `${customerName}님을 차단하시겠습니까?\n차단 사유를 입력하세요:`
    );
    if (reason === null) return;

    await fetch(`/api/customers/${customerId}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: true, reason }),
    });

    const pending =
      data?.pendingReservations.filter(
        (r) => r.customer_id === customerId
      ) || [];
    for (const r of pending) {
      await fetch(`/api/reservations/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
    }

    alert(`${customerName}님이 차단되었습니다.`);
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const pendingCount = data?.pendingReservations?.length || 0;

  const stats = [
    {
      label: "승인 대기",
      value: loading ? "-" : `${pendingCount}건`,
      icon: Clock,
      color: pendingCount > 0 ? "text-yellow-600" : "text-muted",
      bg: pendingCount > 0 ? "bg-yellow-50" : "bg-gray-50",
    },
    {
      label: "오늘 예약",
      value: loading ? "-" : `${data?.todayReservations?.length || 0}건`,
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
  ];

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

      {pendingCount > 0 && (
        <div className="bg-white rounded-xl border-2 border-yellow-300 shadow-sm mb-6">
          <div className="p-6 border-b border-yellow-200 bg-yellow-50/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold">
                승인 대기 중인 예약 ({pendingCount}건)
              </h3>
            </div>
            <p className="text-sm text-muted mt-1">
              새로 들어온 예약을 확인하고 승인 또는 거절해주세요
            </p>
          </div>
          <div className="divide-y divide-border">
            {data?.pendingReservations?.map((r) => (
              <div key={r.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                        승인 대기
                      </span>
                      <span className="text-sm font-medium">
                        {r.services?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        {r.date}
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}
                      </span>
                      <span className="font-medium">
                        ₩{r.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-muted" />
                        {r.customers?.name}
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <Phone className="w-3.5 h-3.5" />
                        {r.customers?.phone}
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <Dog className="w-3.5 h-3.5" />
                        {r.pets?.name} ({r.pets?.breed})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleUpdateStatus(r.id, "confirmed")}
                    className="flex items-center gap-1 text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    <Check className="w-4 h-4" /> 승인
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(r.id, "cancelled")}
                    className="flex items-center gap-1 text-sm bg-gray-100 text-foreground px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" /> 거절
                  </button>
                  <button
                    onClick={() =>
                      blockCustomer(r.customer_id, r.customers?.name)
                    }
                    className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> 차단
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold">오늘의 예약</h3>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-muted text-center py-8">불러오는 중...</p>
          ) : !data?.todayReservations?.length ? (
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
