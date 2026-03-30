"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Check } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    petName: "",
    breed: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices);
  }, []);

  const selectedService = services.find((s) => s.id === form.service);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.name,
        customerPhone: form.phone,
        petName: form.petName,
        breed: form.breed,
        serviceId: form.service,
        date: form.date,
        startTime: form.time,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("예약에 실패했습니다. 다시 시도해주세요.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">예약 요청 완료!</h2>
        <p className="text-muted text-sm">
          예약 확정 후 카카오톡으로 안내드리겠습니다.
        </p>
        <div className="bg-white rounded-xl border border-border p-4 mt-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">서비스</span>
              <span className="font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">날짜</span>
              <span className="font-medium">{form.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">시간</span>
              <span className="font-medium">{form.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">보호자</span>
              <span className="font-medium">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">반려견</span>
              <span className="font-medium">
                {form.petName} ({form.breed})
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">예약하기</h2>
      <p className="text-sm text-muted mb-6">
        원하시는 서비스와 시간을 선택해주세요
      </p>

      {/* 단계 표시 */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-muted"
              }`}
            >
              {s}
            </div>
            <span className="text-xs text-muted hidden sm:block">
              {s === 1 ? "서비스" : s === 2 ? "날짜/시간" : "정보입력"}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-3">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setForm({ ...form, service: s.id });
                  setStep(2);
                }}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  form.service === s.id
                    ? "border-primary bg-indigo-50"
                    : "border-border bg-white hover:border-primary/30"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted">약 {s.duration}분</p>
                  </div>
                  <p className="font-semibold">₩{s.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                날짜 선택
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {form.date && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  시간 선택
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, time: t });
                        setStep(3);
                      }}
                      className={`py-3 rounded-lg text-sm font-medium transition-colors ${
                        form.time === t
                          ? "bg-primary text-white"
                          : "bg-white border border-border hover:border-primary/30"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-muted hover:text-foreground"
            >
              ← 이전
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-3 text-sm">
              <span className="font-medium">{selectedService?.name}</span>
              {" · "}
              {form.date} {form.time}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                보호자 이름
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">연락처</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  반려견 이름
                </label>
                <input
                  type="text"
                  value={form.petName}
                  onChange={(e) =>
                    setForm({ ...form, petName: e.target.value })
                  }
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">견종</label>
                <input
                  type="text"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="예: 말티즈"
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 border border-border rounded-xl text-sm hover:bg-gray-50"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
              >
                {submitting ? "예약 중..." : "예약하기"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
