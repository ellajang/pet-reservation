"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
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
import ReservationModal from "@/components/reservation/ReservationModal";

// 임시 데이터
const sampleReservations = [
  {
    id: "1",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "12:00",
    customerName: "김민지",
    petName: "초코",
    serviceName: "전체미용",
    status: "confirmed" as const,
  },
  {
    id: "2",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "14:00",
    endTime: "15:00",
    customerName: "이수진",
    petName: "몽이",
    serviceName: "목욕",
    status: "confirmed" as const,
  },
];

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  noshow: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
  noshow: "노쇼",
};

export default function ReservationsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

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

  const dayReservations = sampleReservations.filter(
    (r) => r.date === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">예약 관리</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          새 예약
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
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
                <div
                  key={d}
                  className="text-center text-sm font-medium text-muted py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const hasReservation = sampleReservations.some(
                  (r) => r.date === dateStr
                );
                const isSelected = isSameDay(d, selectedDate);

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(d)}
                    className={`relative p-2 h-12 rounded-lg text-sm transition-colors ${
                      !isSameMonth(d, currentMonth)
                        ? "text-gray-300"
                        : isSelected
                        ? "bg-primary text-white"
                        : isToday(d)
                        ? "bg-indigo-50 text-primary font-bold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {format(d, "d")}
                    {hasReservation && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 선택된 날짜의 예약 목록 */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">
              {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
            </h3>
            <p className="text-sm text-muted">
              {dayReservations.length}건의 예약
            </p>
          </div>

          <div className="p-4 space-y-3">
            {dayReservations.length === 0 ? (
              <p className="text-muted text-center py-8 text-sm">
                예약이 없습니다
              </p>
            ) : (
              dayReservations.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border ${statusColors[r.status]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {statusLabels[r.status]}
                    </span>
                    <span className="text-xs">{r.serviceName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {r.startTime} - {r.endTime}
                  </div>
                  <div className="flex items-center gap-1 text-sm mt-1">
                    <User className="w-3.5 h-3.5" />
                    {r.customerName} / {r.petName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ReservationModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
