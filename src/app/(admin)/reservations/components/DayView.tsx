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
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import ReservationCard, { ReservationItem } from "./ReservationCard";

export default function DayView({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  reservations,
  loading,
  onUpdateStatus,
  onBlockCustomer,
}: {
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
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

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayReservations = reservations.filter((r) => r.date === selectedDateStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm">
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

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="text-center text-sm font-medium text-muted py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const dateStr = format(d, "yyyy-MM-dd");
              const dayItems = reservations.filter(
                (r) => r.date === dateStr && r.status !== "cancelled"
              );
              const dayCount = dayItems.length;
              const hasPending = dayItems.some((r) => r.status === "pending");
              const isSelected = isSameDay(d, selectedDate);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  className={`relative flex flex-col items-center justify-between py-2 h-16 rounded-lg text-sm transition-colors ${
                    !isSameMonth(d, currentMonth)
                      ? "text-gray-300"
                      : isSelected
                      ? "bg-primary text-white"
                      : isToday(d)
                      ? "bg-indigo-50 text-primary font-bold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span>{format(d, "d")}</span>
                  {dayCount > 0 ? (
                    <span
                      className={`min-w-[20px] h-[20px] text-[10px] font-bold rounded-full flex items-center justify-center ${
                        isSelected
                          ? "bg-white text-primary"
                          : hasPending
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-primary text-white"
                      }`}
                    >
                      {dayCount}
                    </span>
                  ) : (
                    <span className="h-[20px]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 bg-white rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">
            {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
          </h3>
          <p className="text-sm text-muted">{dayReservations.length}건의 예약</p>
        </div>
        <div className="p-4 space-y-3">
          {loading ? (
            <p className="text-muted text-center py-8 text-sm">불러오는 중...</p>
          ) : dayReservations.length === 0 ? (
            <p className="text-muted text-center py-8 text-sm">예약이 없습니다</p>
          ) : (
            dayReservations.map((r) => (
              <ReservationCard
                key={r.id}
                r={r}
                onUpdateStatus={onUpdateStatus}
                onBlockCustomer={onBlockCustomer}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
