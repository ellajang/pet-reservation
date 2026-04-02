"use client";

import { Clock, User, Check, X, Ban } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export interface ReservationItem {
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

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  noshow: "bg-red-100 text-red-800 border-red-200",
};

const statusOptions = [
  { value: "pending", label: "승인 대기" },
  { value: "confirmed", label: "확정" },
  { value: "completed", label: "완료" },
  { value: "noshow", label: "노쇼" },
  { value: "cancelled", label: "취소" },
];

export default function ReservationCard({
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
        <select
          value={r.status}
          onChange={(e) => {
            const newStatus = e.target.value;
            if (newStatus === r.status) return;
            const label = statusOptions.find((o) => o.value === newStatus)?.label;
            if (!confirm(`상태를 "${label}"(으)로 변경하시겠습니까?`)) {
              e.target.value = r.status;
              return;
            }
            onUpdateStatus(r.id, newStatus);
          }}
          className="text-xs font-medium bg-transparent border border-current/20 rounded px-1.5 py-0.5 cursor-pointer focus:outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
    </div>
  );
}
