"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useServices } from "@/hooks/useSettings";
import { useCreateReservation } from "@/hooks/useReservations";

interface ReservationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationModal({ onClose, onSuccess }: ReservationModalProps) {
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    petName: "",
    breed: "",
    serviceId: "",
    date: "",
    startTime: "",
    memo: "",
  });

  const { data: services = [] } = useServices() as { data: { id: string; name: string; duration: number; price: number }[] };
  const createReservation = useCreateReservation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReservation.mutate(form, {
      onSuccess: () => { onSuccess(); onClose(); },
      onError: (err: Error) => alert(err.message || "예약 등록에 실패했습니다"),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">새 예약 등록</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="res-name" className="block text-sm font-medium mb-1">보호자 이름</label>
              <input id="res-name" aria-label="보호자 이름" type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="res-phone" className="block text-sm font-medium mb-1">연락처</label>
              <input id="res-phone" aria-label="연락처" type="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="010-0000-0000" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="res-pet" className="block text-sm font-medium mb-1">반려견 이름</label>
              <input id="res-pet" aria-label="반려견 이름" type="text" value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="res-breed" className="block text-sm font-medium mb-1">견종</label>
              <input id="res-breed" aria-label="견종" type="text" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="예: 말티즈, 푸들" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
          </div>

          <div>
            <label htmlFor="res-service" className="block text-sm font-medium mb-1">서비스</label>
            <select id="res-service" aria-label="서비스" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
              <option value="">선택하세요</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration}분 / ₩{s.price.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="res-date" className="block text-sm font-medium mb-1">날짜</label>
              <input id="res-date" aria-label="날짜" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label htmlFor="res-time" className="block text-sm font-medium mb-1">시간</label>
              <select id="res-time" aria-label="시간" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                <option value="">선택하세요</option>
                {Array.from({ length: 19 }, (_, i) => {
                  const hour = Math.floor(i / 2) + 9;
                  const min = i % 2 === 0 ? "00" : "30";
                  const time = `${hour.toString().padStart(2, "0")}:${min}`;
                  return <option key={time} value={time}>{time}</option>;
                })}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="res-memo" className="block text-sm font-medium mb-1">메모</label>
            <textarea id="res-memo" aria-label="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={3} placeholder="특이사항을 입력하세요" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50 transition-colors">취소</button>
            <button type="submit" disabled={createReservation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors disabled:opacity-50">
              {createReservation.isPending ? "등록 중..." : "예약 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
