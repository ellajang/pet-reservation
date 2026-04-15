"use client";

import { useReducer } from "react";
import { Plus } from "lucide-react";
import { format, startOfWeek } from "date-fns";
import ReservationModal from "./components/ReservationModal";
import DayView from "./components/DayView";
import WeekView from "./components/WeekView";
import MonthView from "./components/MonthView";
import type { ReservationItem } from "./components/ReservationCard";
import { useReservations, useUpdateReservationStatus } from "@/hooks/useReservations";
import { useBlockCustomer } from "@/hooks/useCustomers";

// === State & Actions ===

type ViewMode = "day" | "week" | "month";

interface ViewState {
  mode: ViewMode;
  currentMonth: Date;
  selectedDate: Date;
  weekStart: Date;
  showModal: boolean;
}

type ViewAction =
  | { type: "SET_MODE"; mode: ViewMode }
  | { type: "SET_MONTH"; date: Date }
  | { type: "SELECT_DATE"; date: Date }
  | { type: "SET_WEEK"; date: Date }
  | { type: "OPEN_MODAL" }
  | { type: "CLOSE_MODAL" };

function viewReducer(state: ViewState, action: ViewAction): ViewState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_MONTH":
      return { ...state, currentMonth: action.date };
    case "SELECT_DATE":
      return { ...state, selectedDate: action.date };
    case "SET_WEEK":
      return { ...state, weekStart: action.date };
    case "OPEN_MODAL":
      return { ...state, showModal: true };
    case "CLOSE_MODAL":
      return { ...state, showModal: false };
  }
}

const initialState: ViewState = {
  mode: "day",
  currentMonth: new Date(),
  selectedDate: new Date(),
  weekStart: startOfWeek(new Date(), { weekStartsOn: 0 }),
  showModal: false,
};

// === Component ===

export default function ReservationsPage() {
  const [view, dispatch] = useReducer(viewReducer, initialState);

  const month = format(view.currentMonth, "yyyy-MM");
  const { data: reservations = [], isLoading: loading } = useReservations(month) as {
    data: ReservationItem[];
    isLoading: boolean;
  };
  const updateStatusMutation = useUpdateReservationStatus();
  const blockCustomerMutation = useBlockCustomer();

  const updateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const blockCustomer = (customerId: string, customerName: string) => {
    const reason = prompt(`${customerName}님을 차단하시겠습니까?\n차단 사유를 입력하세요:`);
    if (reason === null) return;

    blockCustomerMutation.mutate({ id: customerId, blocked: true, reason });

    const pendingRes = reservations.filter(
      (r) => r.customer_id === customerId && r.status === "pending"
    );
    for (const r of pendingRes) {
      updateStatusMutation.mutate({ id: r.id, status: "cancelled" });
    }

    alert(`${customerName}님이 차단되었습니다. 앞으로 예약이 불가합니다.`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">예약 관리</h2>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["day", "week", "month"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => dispatch({ type: "SET_MODE", mode })}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  view.mode === mode
                    ? "bg-white shadow-sm font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {mode === "day" ? "일별" : mode === "week" ? "주별" : "월별"}
              </button>
            ))}
          </div>
          <button
            onClick={() => dispatch({ type: "OPEN_MODAL" })}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 예약
          </button>
        </div>
      </div>

      {view.mode === "day" && (
        <DayView
          currentMonth={view.currentMonth}
          setCurrentMonth={(d) => dispatch({ type: "SET_MONTH", date: d })}
          selectedDate={view.selectedDate}
          setSelectedDate={(d) => dispatch({ type: "SELECT_DATE", date: d })}
          reservations={reservations}
          loading={loading}
          onUpdateStatus={updateStatus}
          onBlockCustomer={blockCustomer}
        />
      )}

      {view.mode === "week" && (
        <WeekView
          currentWeekStart={view.weekStart}
          setCurrentWeekStart={(d) => dispatch({ type: "SET_WEEK", date: d })}
          reservations={reservations}
          onUpdateStatus={updateStatus}
          onBlockCustomer={blockCustomer}
        />
      )}

      {view.mode === "month" && (
        <MonthView
          currentMonth={view.currentMonth}
          setCurrentMonth={(d) => dispatch({ type: "SET_MONTH", date: d })}
          reservations={reservations}
          loading={loading}
          onUpdateStatus={updateStatus}
          onBlockCustomer={blockCustomer}
        />
      )}

      {view.showModal && (
        <ReservationModal
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
