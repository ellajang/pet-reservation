"use client";

import { useReducer, useEffect } from "react";
import { Calendar, Clock, Check, User, Dog } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  size_category: string;
}

const sizeCategoryLabel: Record<string, string> = {
  small: "소형견",
  medium: "중형견",
  large: "대형견",
  special: "특수견",
};

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ExistingPet {
  id: string;
  name: string;
  breed: string;
  size_category: string;
}

interface ExistingCustomer {
  id: string;
  name: string;
  phone: string;
  pets: ExistingPet[];
}

const sizeOptions = [
  { value: "small", label: "소형견", desc: "5kg 미만" },
  { value: "medium", label: "중형견", desc: "5~15kg" },
  { value: "large", label: "대형견", desc: "15kg 이상" },
  { value: "special", label: "특수견", desc: "특수 견종" },
];

import { TIME_SLOTS as DEFAULT_SLOTS } from "@/shared/lib/constants";

// === State & Actions ===

type Step = 1 | 2 | 3 | 4 | 5;

interface BookingState {
  step: Step;
  services: Service[];
  checking: boolean;
  isNewCustomer: boolean;
  existingCustomer: ExistingCustomer | null;
  selectedPetId: string;
  form: {
    phone: string;
    name: string;
    petName: string;
    breed: string;
    weight: string;
    gender: string;
    neutered: boolean;
    specialNotes: string;
    sizeCategory: string;
    serviceId: string;
    date: string;
    time: string;
  };
  submitted: boolean;
  submitting: boolean;
  timeSlots: TimeSlot[];
  loadingSlots: boolean;
}

type BookingAction =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_SERVICES"; services: Service[] }
  | { type: "SET_CHECKING"; value: boolean }
  | { type: "SET_EXISTING_CUSTOMER"; customer: ExistingCustomer; petId?: string; sizeCategory?: string }
  | { type: "SET_NEW_CUSTOMER" }
  | { type: "UPDATE_FORM"; field: string; value: string | boolean }
  | { type: "SELECT_PET"; petId: string; sizeCategory: string }
  | { type: "SELECT_SERVICE"; serviceId: string }
  | { type: "SELECT_TIME"; time: string }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_SUBMITTED" }
  | { type: "SET_TIME_SLOTS"; slots: TimeSlot[] }
  | { type: "SET_LOADING_SLOTS"; value: boolean };

const initialState: BookingState = {
  step: 1,
  services: [],
  checking: false,
  isNewCustomer: false,
  existingCustomer: null,
  selectedPetId: "",
  form: {
    phone: "", name: "", petName: "", breed: "", weight: "",
    gender: "male", neutered: false, specialNotes: "",
    sizeCategory: "small", serviceId: "", date: "", time: "",
  },
  submitted: false,
  submitting: false,
  timeSlots: DEFAULT_SLOTS.map((t) => ({ time: t, available: true })),
  loadingSlots: false,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_SERVICES":
      return { ...state, services: action.services };
    case "SET_CHECKING":
      return { ...state, checking: action.value };
    case "SET_EXISTING_CUSTOMER":
      return {
        ...state,
        isNewCustomer: false,
        existingCustomer: action.customer,
        selectedPetId: action.petId || "",
        form: {
          ...state.form,
          name: action.customer.name,
          sizeCategory: action.sizeCategory || "small",
        },
        step: 3,
        checking: false,
      };
    case "SET_NEW_CUSTOMER":
      return { ...state, isNewCustomer: true, step: 2, checking: false };
    case "UPDATE_FORM":
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case "SELECT_PET":
      return {
        ...state,
        selectedPetId: action.petId,
        form: { ...state.form, sizeCategory: action.sizeCategory },
      };
    case "SELECT_SERVICE":
      return { ...state, form: { ...state.form, serviceId: action.serviceId }, step: 4 };
    case "SELECT_TIME":
      return { ...state, form: { ...state.form, time: action.time }, step: 5 };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };
    case "SET_SUBMITTED":
      return { ...state, submitted: true, submitting: false };
    case "SET_TIME_SLOTS":
      return { ...state, timeSlots: action.slots, loadingSlots: false };
    case "SET_LOADING_SLOTS":
      return { ...state, loadingSlots: action.value };
  }
}

// === Component ===

export default function BookingPage() {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { step, services, form, existingCustomer, submitted, timeSlots } = state;

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "SET_SERVICES", services: data }));
  }, []);

  const selectedService = services.find((s) => s.id === form.serviceId);

  // 시간 선택 단계에서 예약 가능 시간 조회
  useEffect(() => {
    if (step !== 4 || !form.date || !selectedService) return;
    dispatch({ type: "SET_LOADING_SLOTS", value: true });
    fetch(`/api/reservations/available?date=${form.date}&duration=${selectedService.duration}`)
      .then((res) => res.json())
      .then((slots) => dispatch({ type: "SET_TIME_SLOTS", slots }));
  }, [step, form.date, selectedService]);

  const handleCheckPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_CHECKING", value: true });

    const res = await fetch(`/api/customers/check?phone=${encodeURIComponent(form.phone)}`);
    const data = await res.json();

    if (data.exists) {
      const pet = data.customer.pets?.[0];
      dispatch({
        type: "SET_EXISTING_CUSTOMER",
        customer: data.customer,
        petId: data.customer.pets?.length === 1 ? pet?.id : undefined,
        sizeCategory: data.customer.pets?.length === 1 ? pet?.size_category : undefined,
      });
    } else {
      dispatch({ type: "SET_NEW_CUSTOMER" });
    }
  };

  const handleSubmit = async () => {
    dispatch({ type: "SET_SUBMITTING", value: true });

    const body: Record<string, string | undefined> = {
      customerPhone: form.phone,
      customerName: form.name,
      serviceId: form.serviceId,
      date: form.date,
      startTime: form.time,
    };

    if (existingCustomer) {
      body.customerId = existingCustomer.id;
      if (state.selectedPetId) body.petId = state.selectedPetId;
    }

    if (state.isNewCustomer || !state.selectedPetId) {
      body.petName = form.petName;
      body.breed = form.breed;
      body.weight = form.weight ? parseFloat(form.weight).toString() : undefined;
      body.gender = form.gender;
      body.neutered = form.neutered.toString();
      body.specialNotes = form.specialNotes;
      body.sizeCategory = form.sizeCategory;
    }

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      dispatch({ type: "SET_SUBMITTED" });
    } else {
      const err = await res.json();
      alert(err.error || "예약에 실패했습니다. 다시 시도해주세요.");
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const petDisplayName = existingCustomer && state.selectedPetId
    ? existingCustomer.pets.find((p) => p.id === state.selectedPetId)?.name || form.petName
    : form.petName;
  const petDisplayBreed = existingCustomer && state.selectedPetId
    ? existingCustomer.pets.find((p) => p.id === state.selectedPetId)?.breed || form.breed
    : form.breed;

  const totalSteps = state.isNewCustomer ? 5 : 4;
  const stepLabels = state.isNewCustomer
    ? ["연락처", "고객정보", "서비스", "날짜/시간", "확인"]
    : ["연락처", "서비스", "날짜/시간", "확인"];
  const displayStep = state.isNewCustomer ? step : step <= 1 ? 1 : step - 1;

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">예약 요청 완료!</h2>
        <p className="text-muted text-sm">예약 확정 후 카카오톡으로 안내드리겠습니다.</p>
        <div className="bg-white rounded-xl border border-border p-4 mt-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">서비스</span><span className="font-medium">{selectedService?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted">날짜</span><span className="font-medium">{form.date}</span></div>
            <div className="flex justify-between"><span className="text-muted">시간</span><span className="font-medium">{form.time}</span></div>
            <div className="flex justify-between"><span className="text-muted">보호자</span><span className="font-medium">{form.name}</span></div>
            <div className="flex justify-between"><span className="text-muted">반려견</span><span className="font-medium">{petDisplayName} ({petDisplayBreed})</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">예약하기</h2>
      <p className="text-sm text-muted mb-6">원하시는 서비스와 시간을 선택해주세요</p>

      {/* 단계 표시 */}
      <div className="flex items-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${displayStep >= s ? "bg-primary text-white" : "bg-gray-200 text-muted"}`}>
                {displayStep > s ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className="text-xs text-muted mt-1 whitespace-nowrap">{stepLabels[s - 1]}</span>
            </div>
            {s < totalSteps && <div className={`h-0.5 flex-1 mx-2 mb-5 ${displayStep > s ? "bg-primary" : "bg-gray-200"}`} />}
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
            <input type="tel" aria-label="연락처" value={form.phone} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "phone", value: e.target.value })} placeholder="010-0000-0000" className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <button type="submit" disabled={state.checking} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
            {state.checking ? "확인 중..." : "다음"}
          </button>
        </form>
      )}

      {/* Step 2: 신규 고객 정보 OR 기존 고객의 새 반려견 추가 */}
      {step === 2 && (
        <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: "SET_STEP", step: 3 }); }} className="space-y-4">
          {existingCustomer ? (
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700">
              {existingCustomer.name}님의 새 반려견 정보를 입력해주세요.
            </div>
          ) : (
            <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700">처음 방문이시네요! 간단한 정보를 입력해주세요.</div>
          )}

          {!existingCustomer && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1"><User className="w-4 h-4 inline mr-1" />보호자 이름</label>
                <input type="text" aria-label="보호자 이름" value={form.name} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "name", value: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>

              <hr className="border-border" />
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1"><Dog className="w-4 h-4 inline mr-1" />반려견 이름</label>
            <input type="text" aria-label="반려견 이름" value={form.petName} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "petName", value: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">크기</label>
            <div className="grid grid-cols-4 gap-2">
              {sizeOptions.map((opt) => (
                <button key={opt.value} type="button" onClick={() => dispatch({ type: "UPDATE_FORM", field: "sizeCategory", value: opt.value })} className={`py-2.5 rounded-xl text-center transition-colors ${form.sizeCategory === opt.value ? "bg-primary text-white" : "bg-white border border-border hover:border-primary/30"}`}>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className={`text-[10px] ${form.sizeCategory === opt.value ? "text-white/70" : "text-muted"}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">견종</label>
              <input type="text" aria-label="견종" value={form.breed} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "breed", value: e.target.value })} placeholder="예: 말티즈" className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">몸무게 (kg)</label>
              <input type="number" aria-label="몸무게" value={form.weight} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "weight", value: e.target.value })} step="0.1" placeholder="선택사항" className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">성별</label>
              <select aria-label="성별" value={form.gender} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "gender", value: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="male">남아</option>
                <option value="female">여아</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" aria-label="중성화" checked={form.neutered} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "neutered", value: e.target.checked })} className="rounded" />
                중성화 여부
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">특이사항 (선택)</label>
            <textarea aria-label="특이사항" value={form.specialNotes} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "specialNotes", value: e.target.value })} rows={2} placeholder="공격성, 알러지, 주의사항 등" className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => dispatch({ type: "SET_STEP", step: existingCustomer ? 3 : 1 })} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm hover:bg-gray-50">이전</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover">다음</button>
          </div>
        </form>
      )}

      {/* Step 3: 서비스 선택 */}
      {step === 3 && (
        <div className="space-y-3">
          {existingCustomer && (
            <div className="bg-green-50 rounded-xl p-4 text-sm text-green-700 mb-4">
              <p className="font-medium">{existingCustomer.name}님, 다시 찾아주셨군요!</p>
              <div className="mt-2">
                <p className="text-xs mb-1">반려견을 선택해주세요:</p>
                <div className="flex gap-2 flex-wrap">
                  {existingCustomer.pets.map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => dispatch({ type: "SELECT_PET", petId: pet.id, sizeCategory: pet.size_category || "small" })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${state.selectedPetId === pet.id ? "bg-green-600 text-white" : "bg-white border border-green-200"}`}
                    >
                      {pet.name} ({pet.breed})
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_STEP", step: 2 })}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-white border border-green-200 hover:bg-green-100"
                  >
                    + 새 반려견 추가
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm font-medium text-primary mb-3">{sizeCategoryLabel[form.sizeCategory]} 서비스</p>
          {services.filter((s) => (s.size_category || "small") === form.sizeCategory).map((s) => (
            <button key={s.id} type="button" onClick={() => dispatch({ type: "SELECT_SERVICE", serviceId: s.id })} className={`w-full text-left p-4 rounded-xl border transition-colors ${form.serviceId === s.id ? "border-primary bg-indigo-50" : "border-border bg-white hover:border-primary/30"}`}>
              <div className="flex justify-between items-center">
                <div><p className="font-medium">{s.name}</p><p className="text-sm text-muted">약 {s.duration}분</p></div>
                <p className="font-semibold">₩{s.price.toLocaleString()}</p>
              </div>
            </button>
          ))}
          {services.filter((s) => (s.size_category || "small") === form.sizeCategory).length === 0 && (
            <p className="text-muted text-center py-6 text-sm">해당 크기의 서비스가 없습니다. 매장에 문의해주세요.</p>
          )}

          <button type="button" onClick={() => dispatch({ type: "SET_STEP", step: state.isNewCustomer ? 2 : 1 })} className="text-sm text-muted hover:text-foreground">← 이전</button>
        </div>
      )}

      {/* Step 4: 날짜/시간 선택 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-3 text-sm">
            <span className="font-medium">{selectedService?.name}</span> · ₩{selectedService?.price.toLocaleString()}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2"><Calendar className="w-4 h-4 inline mr-1" />날짜 선택</label>
            <input type="date" aria-label="날짜" value={form.date} onChange={(e) => dispatch({ type: "UPDATE_FORM", field: "date", value: e.target.value })} min={new Date().toISOString().split("T")[0]} className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>

          {form.date && (
            <div>
              <label className="block text-sm font-medium mb-2"><Clock className="w-4 h-4 inline mr-1" />시간 선택</label>
              {state.loadingSlots ? (
                <p className="text-muted text-center py-4 text-sm">예약 가능 시간 확인 중...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button key={slot.time} type="button" disabled={!slot.available} onClick={() => slot.available && dispatch({ type: "SELECT_TIME", time: slot.time })} className={`py-3 rounded-lg text-sm font-medium transition-colors ${!slot.available ? "bg-gray-100 text-gray-300 cursor-not-allowed line-through" : form.time === slot.time ? "bg-primary text-white" : "bg-white border border-border hover:border-primary/30"}`}>
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
              {timeSlots.every((s) => !s.available) && !state.loadingSlots && (
                <p className="text-red-500 text-center text-sm mt-2">이 날짜는 예약이 모두 찼습니다. 다른 날짜를 선택해주세요.</p>
              )}
            </div>
          )}

          <button type="button" onClick={() => dispatch({ type: "SET_STEP", step: 3 })} className="text-sm text-muted hover:text-foreground">← 이전</button>
        </div>
      )}

      {/* Step 5: 최종 확인 */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3">예약 정보 확인</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">보호자</span><span className="font-medium">{form.name}</span></div>
              <div className="flex justify-between"><span className="text-muted">연락처</span><span className="font-medium">{form.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted">반려견</span><span className="font-medium">{petDisplayName} ({petDisplayBreed})</span></div>
              <hr className="border-border" />
              <div className="flex justify-between"><span className="text-muted">서비스</span><span className="font-medium">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted">날짜</span><span className="font-medium">{form.date}</span></div>
              <div className="flex justify-between"><span className="text-muted">시간</span><span className="font-medium">{form.time}</span></div>
              <div className="flex justify-between"><span className="text-muted">예상 금액</span><span className="font-bold text-primary">₩{selectedService?.price.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => dispatch({ type: "SET_STEP", step: 4 })} className="flex-1 px-4 py-3 border border-border rounded-xl text-sm hover:bg-gray-50">이전</button>
            <button type="button" onClick={handleSubmit} disabled={state.submitting} className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
              {state.submitting ? "예약 중..." : "예약 확정"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
