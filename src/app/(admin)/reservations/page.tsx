"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Check,
  X,
  AlertTriangle,
  Ban,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import ReservationModal from "@/components/reservation/ReservationModal";

interface ReservationItem {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  memo: string | null;
  customer_id: string;
  customers: { name: string; phone: string; is_blocked?: boolean };
  pets: { name: string; breed: string };
  services: { name: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  noshow: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "승인 대기",
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
  noshow: "노쇼",
};

type ViewMode = "day" | "week" | "month";

function ReservationCard({
  r,
  showDate,
  onUpdateStatus,
  onBlockCustomer,
}: {
  r: ReservationItem;
  showDate?: boolean;
  onUpdateStatus: (id: string, status: string) => void;
  onBlockCustomer: (customerId: string, customerName: string) => void;
}) {
  return (
    <div className={`p-3 rounded-lg border ${statusColors[r.status]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{statusLabels[r.status]}</span>
        <span className="text-xs">{r.services?.name}</span>
      </div>
      {showDate && (
        <div className="text-xs font-medium mb-1">
          {format(new Date(r.date + "T00:00:00"), "M/d (EEE)", { locale: ko })}
        </div>
      )}
      <div className="flex items-center gap-1 text-sm">
        <Clock className="w-3.5 h-3.5" />
        {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}
      </div>
      <div className="flex items-center gap-1 text-sm mt-1">
        <User className="w-3.5 h-3.5" />
        {r.customers?.name} / {r.pets?.name}
      </div>
      <div className="text-xs mt-1">₩{r.price.toLocaleString()}</div>

      {/* 승인 대기 상태 - 승인/거절 */}
      {r.status === "pending" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdateStatus(r.id, "confirmed")}
            className="flex items-center gap-1 text-xs bg-primary text-white px-2 py-1 rounded"
          >
            <Check className="w-3 h-3" /> 승인
          </button>
          <button
            onClick={() => onUpdateStatus(r.id, "cancelled")}
            className="flex items-center gap-1 text-xs bg-gray-400 text-white px-2 py-1 rounded"
          >
            <X className="w-3 h-3" /> 거절
          </button>
          <button
            onClick={() => onBlockCustomer(r.customer_id, r.customers?.name)}
            className="flex items-center gap-1 text-xs bg-red-600 text-white px-2 py-1 rounded"
          >
            <Ban className="w-3 h-3" /> 차단
          </button>
        </div>
      )}

      {/* 확정 상태 - 완료/노쇼/취소 */}
      {r.status === "confirmed" && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdateStatus(r.id, "completed")}
            className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded"
          >
            <Check className="w-3 h-3" /> 완료
          </button>
          <button
            onClick={() => onUpdateStatus(r.id, "noshow")}
            className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            <AlertTriangle className="w-3 h-3" /> 노쇼
          </button>
          <button
            onClick={() => onUpdateStatus(r.id, "cancelled")}
            className="flex items-center gap-1 text-xs bg-gray-400 text-white px-2 py-1 rounded"
          >
            <X className="w-3 h-3" /> 취소
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReservationsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [showModal, setShowModal] = useState(false);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = useCallback(() => {
    const month = format(currentMonth, "yyyy-MM");
    setLoading(true);
    fetch(`/api/reservations?month=${month}`)
      .then((res) => res.json())
      .then(setReservations)
      .finally(() => setLoading(false));
  }, [currentMonth]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 캘린더 날짜 계산
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

  // 주간 날짜
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // 선택된 날짜/기간의 예약 필터
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayReservations = reservations.filter(
    (r) => r.date === selectedDateStr
  );

  const weekReservations = reservations.filter((r) => {
    const rDate = new Date(r.date + "T00:00:00");
    return rDate >= currentWeekStart && rDate < addDays(currentWeekStart, 7);
  });

  const monthReservations = reservations.filter(
    (r) => r.status !== "cancelled"
  );

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "상태 변경에 실패했습니다");
      return;
    }

    fetchReservations();
  };

  const blockCustomer = async (customerId: string, customerName: string) => {
    const reason = prompt(`${customerName}님을 차단하시겠습니까?\n차단 사유를 입력하세요:`);
    if (reason === null) return; // 취소

    await fetch(`/api/customers/${customerId}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: true, reason }),
    });

    // 해당 고객의 대기 중인 예약 모두 취소
    const pendingRes = reservations.filter(
      (r) => r.customer_id === customerId && r.status === "pending"
    );
    for (const r of pendingRes) {
      await fetch(`/api/reservations/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
    }

    alert(`${customerName}님이 차단되었습니다. 앞으로 예약이 불가합니다.`);
    fetchReservations();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">예약 관리</h2>
        <div className="flex items-center gap-3">
          {/* 뷰 모드 토글 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-white shadow-sm font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {mode === "day" ? "일별" : mode === "week" ? "주별" : "월별"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 예약
          </button>
        </div>
      </div>

      {/* ===== 일별 뷰 ===== */}
      {viewMode === "day" && (
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
                  const dayCount = reservations.filter(
                    (r) => r.date === dateStr && r.status !== "cancelled"
                  ).length;
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
                      {dayCount > 0 && !isSelected && (
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
              {loading ? (
                <p className="text-muted text-center py-8 text-sm">
                  불러오는 중...
                </p>
              ) : dayReservations.length === 0 ? (
                <p className="text-muted text-center py-8 text-sm">
                  예약이 없습니다
                </p>
              ) : (
                dayReservations.map((r) => (
                  <ReservationCard
                    key={r.id}
                    r={r}
                    onUpdateStatus={updateStatus}
                    onBlockCustomer={blockCustomer}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 주별 뷰 ===== */}
      {viewMode === "week" && (
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
                      isToday(wd)
                        ? "bg-indigo-50"
                        : ""
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
                        <p className="font-medium">
                          {r.start_time.slice(0, 5)}
                        </p>
                        <p className="truncate">{r.customers?.name}</p>
                        <p className="truncate text-[10px]">
                          {r.services?.name}
                        </p>
                      </div>
                    ))}
                    {dayRes.length === 0 && (
                      <p className="text-[10px] text-muted text-center py-4">
                        -
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 주간 예약 상세 */}
          {weekReservations.filter((r) => r.status !== "cancelled").length >
            0 && (
            <div className="p-4 border-t border-border">
              <h4 className="font-semibold mb-3">
                이번 주 예약 ({weekReservations.filter((r) => r.status !== "cancelled").length}건)
              </h4>
              <div className="space-y-2">
                {weekReservations
                  .filter((r) => r.status !== "cancelled")
                  .map((r) => (
                    <ReservationCard
                      key={r.id}
                      r={r}
                      showDate
                      onUpdateStatus={updateStatus}
                      onBlockCustomer={blockCustomer}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 월별 뷰 ===== */}
      {viewMode === "month" && (
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
                <div
                  key={d}
                  className="text-center text-sm font-medium text-muted py-1"
                >
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
              <p className="text-muted text-center py-4 text-sm">
                불러오는 중...
              </p>
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
                    onUpdateStatus={updateStatus}
                    onBlockCustomer={blockCustomer}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <ReservationModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchReservations}
        />
      )}
    </div>
  );
}
