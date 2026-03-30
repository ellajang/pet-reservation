"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Check, User, Dog } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ExistingPet {
  id: string;
  name: string;
  breed: string;
}

interface ExistingCustomer {
  id: string;
  name: string;
  phone: string;
  pets: ExistingPet[];
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00",
];

// 단계: 1=연락처 확인, 2=고객정보(신규만), 3=서비스선택, 4=날짜시간, 5=확인
type Step = 1 | 2 | 3 | 4 | 5;

export default function BookingPage() {
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [checking, setChecking] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<ExistingCustomer | null>(null);
  const [selectedPetId, setSelectedPetId] = useState("");

  const [form, setForm] = useState({
    phone: "",
    name: "",
    petName: "",
    breed: "",
    weight: "",
    gender: "male",
    neutered: false,
    specialNotes: "",
    serviceId: "",
    date: "",
    time: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices);
  }, []);

  const selectedService = services.find((s) => s.id === form.serviceId);

  // 1단계: 연락처로 기존 고객 확인
  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);

    const res = await fetch(`/api/customers/check?phone=${encodeURIComponent(form.phone)}`);
    const data = await res.json();

    if (data.exists) {
      setIsNewCustomer(false);
      setExistingCustomer(data.customer);
      setForm((f) => ({ ...f, name: data.customer.name }));
      if (data.customer.pets?.length === 1) {
        setSelectedPetId(data.customer.pets[0].id);
      }
      setStep(3); // 바로 서비스 선택으로
    } else {
      setIsNewCustomer(true);
      setStep(2); // 고객 정보 입력으로
    }
    setChecking(false);
  };

  // 2단계: 신규 고객 정보 입력 후 서비스 선택으로
  const handleNewCustomerNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  // 예약 제출
  const handleSubmit = async () => {
    setSubmitting(true);

    const body: Record<string, string | undefined> = {
      customerPhone: form.phone,
      customerName: form.name,
      serviceId: form.serviceId,
      date: form.date,
      startTime: form.time,
    };

    if (existingCustomer) {
      body.customerId = existingCustomer.id;
      if (selectedPetId) {
        body.petId = selectedPetId;
      }
    }

    if (isNewCustomer || !selectedPetId) {
      body.petName = form.petName;
      body.breed = form.breed;
    }

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("예약에 실패했습니다. 다시 시도해주세요.");
    }
    setSubmitting(false);
  };

  const petDisplayName = existingCustomer && selectedPetId
    ? existingCustomer.pets.find((p) => p.id === selectedPetId)?.name || form.petName
    : form.petName;

  const petDisplayBreed = existingCustomer && selectedPetId
    ? existingCustomer.pets.find((p) => p.id === selectedPetId)?.breed || form.breed
    : form.breed;

  // 현재 총 단계 수 (기존 고객은 4단계, 신규는 5단계)
  const totalSteps = isNewCustomer ? 5 : 4;
  const stepLabels = isNewCustomer
    ? ["연락처", "고객정보", "서비스", "날짜/시간", "확인"]
    : ["연락처", "서비스", "날짜/시간", "확인"];
  const displayStep = isNewCustomer
    ? step
    : step <= 1 ? 1 : step - 1; // 기존 고객은 2단계 건너뜀

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
                {petDisplayName} ({petDisplayBreed})
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
      <div className="flex items-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  displayStep >= s
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-muted"
                }`}
              >
                {displayStep > s ? "✓" : s}
              </div>
              <span className="text-xs text-muted mt-1 whitespace-nowrap">
                {stepLabels[s - 1]}
              </span>
            </div>
            {s < totalSteps && (
              <div
                className={`h-0.5 flex-1 mx-2 mb-5 ${
                  displayStep > s ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: 연락처 확인 */}
      {step === 1 && (
        <form onSubmit={handleCheckPhone} className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-sm text-indigo-700">
            먼저 연락처를 입력해주세요. 이전에 방문하신 적이 있다면 정보를 불러옵니다.
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

          <button
            type="submit"
            disabled={checking}
            className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
          >
            {checking ? "확인 중..." : "다음"}
          </button>
        </form>
      )}

      {/* Step 2: 신규 고객 정보 입력 */}
      {step === 2 && (
        <form onSubmit={handleNewCustomerNext} className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700">
            처음 방문이시네요! 간단한 정보를 입력해주세요.
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              <User className="w-4 h-4 inline mr-1" />
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

          <hr className="border-border" />

          <div>
            <label className="block text-sm font-medium mb-1">
              <Dog className="w-4 h-4 inline mr-1" />
              반려견 이름
            </label>
            <input
              type="text"
              value={form.petName}
              onChange={(e) => setForm({ ...form, petName: e.target.value })}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-1">
                몸무게 (kg)
              </label>
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                step="0.1"
                placeholder="선택사항"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="male">남아</option>
                <option value="female">여아</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.neutered}
                  onChange={(e) =>
                    setForm({ ...form, neutered: e.target.checked })
                  }
                  className="rounded"
                />
                중성화 여부
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              특이사항 (선택)
            </label>
            <textarea
              value={form.specialNotes}
              onChange={(e) =>
                setForm({ ...form, specialNotes: e.target.value })
              }
              rows={2}
              placeholder="공격성, 알러지, 주의사항 등"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-sm hover:bg-gray-50"
            >
              이전
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover"
            >
              다음
            </button>
          </div>
        </form>
      )}

      {/* Step 3: 서비스 선택 */}
      {step === 3 && (
        <div className="space-y-3">
          {/* 기존 고객 환영 메시지 */}
          {existingCustomer && (
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700 mb-4">
              <p className="font-medium">{existingCustomer.name}님, 다시 찾아주셨군요!</p>
              {existingCustomer.pets.length > 1 && (
                <div className="mt-2">
                  <p className="text-xs mb-1">반려견을 선택해주세요:</p>
                  <div className="flex gap-2">
                    {existingCustomer.pets.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setSelectedPetId(pet.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          selectedPetId === pet.id
                            ? "bg-green-600 text-white"
                            : "bg-white border border-green-200"
                        }`}
                      >
                        {pet.name} ({pet.breed})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setForm({ ...form, serviceId: s.id });
                setStep(4);
              }}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                form.serviceId === s.id
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

          <button
            type="button"
            onClick={() => setStep(isNewCustomer ? 2 : 1)}
            className="text-sm text-muted hover:text-foreground"
          >
            ← 이전
          </button>
        </div>
      )}

      {/* Step 4: 날짜/시간 선택 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-3 text-sm">
            <span className="font-medium">{selectedService?.name}</span>
            {" · "}
            ₩{selectedService?.price.toLocaleString()}
          </div>

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
                      setStep(5);
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
            onClick={() => setStep(3)}
            className="text-sm text-muted hover:text-foreground"
          >
            ← 이전
          </button>
        </div>
      )}

      {/* Step 5: 최종 확인 */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3">예약 정보 확인</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">보호자</span>
                <span className="font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">연락처</span>
                <span className="font-medium">{form.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">반려견</span>
                <span className="font-medium">
                  {petDisplayName} ({petDisplayBreed})
                </span>
              </div>
              <hr className="border-border" />
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
                <span className="text-muted">예상 금액</span>
                <span className="font-bold text-primary">
                  ₩{selectedService?.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 px-4 py-3 border border-border rounded-xl text-sm hover:bg-gray-50"
            >
              이전
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "예약 중..." : "예약 확정"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
