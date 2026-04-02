"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import ReservationCard, { ReservationItem, statusColors } from "./ReservationCard";

export default function MonthView({
  currentMonth,
  setCurrentMonth,
  reservations,
  loading,
  onUpdateStatus,
  onBlockCustomer,
}: {
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;
  reservations: ReservationItem[];
  loading: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onBlockCustomer: (customerId: string, customerName: string) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const monthReservations = reservations.filter((r) => r.status !== "cancelled");

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 월간 요약 */}
      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        <div className="p-4 text-center">
          <p className="text-sm text-muted">전체</p>
          <p className="text-2xl font-bold">{monthReservations.length}</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-muted">확정</p>
          <p className="text-2xl font-bold text-blue-600">
            {monthReservations.filter((r) => r.status === "confirmed").length}
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-muted">완료</p>
          <p className="text-2xl font-bold text-green-600">
            {monthReservations.filter((r) => r.status === "completed").length}
          </p>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-muted">노쇼</p>
          <p className="text-2xl font-bold text-red-500">
            {monthReservations.filter((r) => r.status === "noshow").length}
          </p>
        </div>
      </div>

      {/* 월간 캘린더 그리드 */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <div key={d} className="text-center text-sm font-medium text-muted py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const dateStr = format(d, "yyyy-MM-dd");
            const dayRes = reservations.filter(
              (r) => r.date === dateStr && r.status !== "cancelled"
            );

            return (
              <div
                key={i}
                className={`min-h-[80px] p-1 rounded-lg border text-xs ${
                  !isSameMonth(d, currentMonth)
                    ? "bg-gray-50 border-transparent"
                    : isToday(d)
                    ? "border-primary bg-indigo-50/50"
                    : "border-border"
                }`}
              >
                <p
                  className={`text-right text-xs mb-0.5 ${
                    !isSameMonth(d, currentMonth)
                      ? "text-gray-300"
                      : isToday(d)
                      ? "text-primary font-bold"
                      : "text-foreground"
                  }`}
                >
                  {format(d, "d")}
                </p>
                {dayRes.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className={`px-1 py-0.5 rounded mb-0.5 truncate text-[10px] ${statusColors[r.status]}`}
                  >
                    {r.start_time.slice(0, 5)} {r.customers?.name}
                  </div>
                ))}
                {dayRes.length > 3 && (
                  <p className="text-[10px] text-muted text-center">
                    +{dayRes.length - 3}건 더
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 월간 전체 목록 */}
      <div className="p-4 border-t border-border">
        <h4 className="font-semibold mb-3">전체 예약 목록</h4>
        {loading ? (
          <p className="text-muted text-center py-4 text-sm">불러오는 중...</p>
        ) : monthReservations.length === 0 ? (
          <p className="text-muted text-center py-4 text-sm">
            이번 달 예약이 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {monthReservations.map((r) => (
              <ReservationCard
                key={r.id}
                r={r}
                showDate
                onUpdateStatus={onUpdateStatus}
                onBlockCustomer={onBlockCustomer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
