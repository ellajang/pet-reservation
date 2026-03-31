"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, addWeeks, subWeeks, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import ReservationCard, { ReservationItem, statusColors } from "./ReservationCard";

export default function WeekView({
  currentWeekStart,
  setCurrentWeekStart,
  reservations,
  onUpdateStatus,
  onBlockCustomer,
}: {
  currentWeekStart: Date;
  setCurrentWeekStart: (d: Date) => void;
  reservations: ReservationItem[];
  onUpdateStatus: (id: string, status: string) => void;
  onBlockCustomer: (customerId: string, customerName: string) => void;
}) {
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const weekReservations = reservations.filter((r) => {
    const rDate = new Date(r.date + "T00:00:00");
    return rDate >= currentWeekStart && rDate < addDays(currentWeekStart, 7);
  });

  const activeWeekRes = weekReservations.filter((r) => r.status !== "cancelled");

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {format(currentWeekStart, "M월 d일", { locale: ko })} ~{" "}
          {format(addDays(currentWeekStart, 6), "M월 d일", { locale: ko })}
        </h3>
        <button
          onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 divide-x divide-border">
        {weekDays.map((wd) => {
          const dateStr = format(wd, "yyyy-MM-dd");
          const dayRes = weekReservations.filter(
            (r) => r.date === dateStr && r.status !== "cancelled"
          );

          return (
            <div key={dateStr} className="min-h-[200px]">
              <div
                className={`p-2 text-center border-b border-border ${
                  isToday(wd) ? "bg-indigo-50" : ""
                }`}
              >
                <p className="text-xs text-muted">
                  {format(wd, "EEE", { locale: ko })}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    isToday(wd) ? "text-primary" : ""
                  }`}
                >
                  {format(wd, "d")}
                </p>
              </div>
              <div className="p-1.5 space-y-1.5">
                {dayRes.map((r) => (
                  <div
                    key={r.id}
                    className={`p-1.5 rounded text-xs border ${statusColors[r.status]}`}
                  >
                    <p className="font-medium">{r.start_time.slice(0, 5)}</p>
                    <p className="truncate">{r.customers?.name}</p>
                    <p className="truncate text-[10px]">{r.services?.name}</p>
                  </div>
                ))}
                {dayRes.length === 0 && (
                  <p className="text-[10px] text-muted text-center py-4">-</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeWeekRes.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="font-semibold mb-3">
            이번 주 예약 ({activeWeekRes.length}건)
          </h4>
          <div className="space-y-2">
            {activeWeekRes.map((r) => (
              <ReservationCard
                key={r.id}
                r={r}
                showDate
                onUpdateStatus={onUpdateStatus}
                onBlockCustomer={onBlockCustomer}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
