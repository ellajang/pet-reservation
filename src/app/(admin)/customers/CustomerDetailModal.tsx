"use client";

import { useReducer, useEffect } from "react";
import { X, Save, Clock, Scissors } from "lucide-react";
import { useCustomerDetail, useUpdateCustomer } from "@/hooks/useCustomers";

interface Reservation {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  services: { name: string } | null;
}

const statusLabels: Record<string, string> = {
  pending: "승인 대기", confirmed: "확정", completed: "완료",
  cancelled: "취소", noshow: "노쇼",
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-100", confirmed: "text-blue-700 bg-blue-100",
  completed: "text-green-700 bg-green-100", cancelled: "text-gray-500 bg-gray-100",
  noshow: "text-red-700 bg-red-100",
};

const sizeOptions = [
  { value: "small", label: "소형견" },
  { value: "medium", label: "중형견" },
  { value: "large", label: "대형견" },
  { value: "special", label: "특수견" },
];

// === State & Actions ===

interface ModalState {
  tab: "info" | "history";
  saving: boolean;
  editName: string;
  editPhone: string;
  editMemo: string;
  editPet: {
    id: string;
    name: string;
    breed: string;
    weight: string;
    gender: string;
    neutered: boolean;
    specialNotes: string;
    sizeCategory: string;
  } | null;
}

type ModalAction =
  | { type: "SET_TAB"; tab: "info" | "history" }
  | { type: "SET_SAVING"; value: boolean }
  | { type: "SET_FIELD"; field: "editName" | "editPhone" | "editMemo"; value: string }
  | { type: "SET_PET_FIELD"; field: string; value: string | boolean }
  | { type: "LOAD_DATA"; name: string; phone: string; memo: string; pet: ModalState["editPet"] };

const initialState: ModalState = {
  tab: "info", saving: false,
  editName: "", editPhone: "", editMemo: "", editPet: null,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, tab: action.tab };
    case "SET_SAVING":
      return { ...state, saving: action.value };
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_PET_FIELD":
      return state.editPet
        ? { ...state, editPet: { ...state.editPet, [action.field]: action.value } }
        : state;
    case "LOAD_DATA":
      return { ...state, editName: action.name, editPhone: action.phone, editMemo: action.memo, editPet: action.pet };
  }
}

// === Component ===

export default function CustomerDetailModal({
  customerId,
  onClose,
  onUpdated,
}: {
  customerId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  const { data, isLoading: loading } = useCustomerDetail(customerId) as {
    data: { customer: Record<string, unknown>; reservations: Reservation[] } | undefined;
    isLoading: boolean;
  };
  const updateCustomer = useUpdateCustomer();

  const customer = data?.customer;
  const reservations = (data?.reservations || []) as Reservation[];

  // 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (!customer) return;
    const pets = customer.pets as Array<Record<string, unknown>> | undefined;
    const p = pets?.[0];
    dispatch({
      type: "LOAD_DATA",
      name: (customer.name as string) || "",
      phone: (customer.phone as string) || "",
      memo: (customer.memo as string) || "",
      pet: p ? {
        id: p.id as string,
        name: p.name as string,
        breed: p.breed as string,
        weight: p.weight ? String(p.weight) : "",
        gender: (p.gender as string) || "male",
        neutered: (p.neutered as boolean) || false,
        specialNotes: (p.special_notes as string) || "",
        sizeCategory: (p.size_category as string) || "small",
      } : null,
    });
  }, [customer]);

  const handleSave = () => {
    dispatch({ type: "SET_SAVING", value: true });

    const body = {
      customer: { name: state.editName, phone: state.editPhone, memo: state.editMemo },
      pet: state.editPet
        ? { ...state.editPet, weight: state.editPet.weight ? parseFloat(state.editPet.weight) : null }
        : undefined,
    };

    updateCustomer.mutate({ id: customerId, body }, {
      onSuccess: () => { onUpdated(); onClose(); },
      onError: (err: Error) => {
        alert(err.message || "저장에 실패했습니다");
        dispatch({ type: "SET_SAVING", value: false });
      },
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-8 text-center">
          <p className="text-muted">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const completedCount = reservations.filter((r) => r.status === "completed").length;
  const cancelledCount = reservations.filter((r) => r.status === "cancelled").length;
  const totalSpent = reservations.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">고객 상세</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {/* 요약 */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-xl font-bold">{customer.name as string}</h4>
            {Boolean(customer.is_blocked) && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">차단됨</span>}
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted">방문</p>
              <p className="text-lg font-bold">{completedCount}회</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted">누적 매출</p>
              <p className="text-lg font-bold">₩{totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted">취소</p>
              <p className={`text-lg font-bold ${cancelledCount > 0 ? "text-gray-500" : ""}`}>{cancelledCount}회</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted">노쇼</p>
              <p className={`text-lg font-bold ${(customer.no_show_count as number) > 0 ? "text-red-500" : ""}`}>{customer.no_show_count as number}회</p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-border mx-4 mt-2">
          {(["info", "history"] as const).map((t) => (
            <button key={t} onClick={() => dispatch({ type: "SET_TAB", tab: t })} className={`px-4 py-2 text-sm font-medium border-b-2 ${state.tab === t ? "border-primary text-primary" : "border-transparent text-muted"}`}>
              {t === "info" ? "정보 수정" : `예약 이력 (${reservations.length})`}
            </button>
          ))}
        </div>

        {/* 정보 수정 탭 */}
        {state.tab === "info" && (
          <div className="p-4 space-y-4">
            <h5 className="text-sm font-medium text-muted">보호자 정보</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium mb-1">이름</label>
                <input id="edit-name" aria-label="이름" type="text" value={state.editName} onChange={(e) => dispatch({ type: "SET_FIELD", field: "editName", value: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">연락처</label>
                <input id="edit-phone" aria-label="연락처" type="tel" value={state.editPhone} onChange={(e) => dispatch({ type: "SET_FIELD", field: "editPhone", value: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label htmlFor="edit-memo" className="block text-sm font-medium mb-1">메모</label>
              <textarea id="edit-memo" aria-label="메모" value={state.editMemo} onChange={(e) => dispatch({ type: "SET_FIELD", field: "editMemo", value: e.target.value })} rows={2} placeholder="고객 관련 메모" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>

            {state.editPet && (
              <>
                <hr className="border-border" />
                <h5 className="text-sm font-medium text-muted">반려견 정보</h5>
                <div>
                  <label className="block text-sm font-medium mb-1">크기</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sizeOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => dispatch({ type: "SET_PET_FIELD", field: "sizeCategory", value: opt.value })} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${state.editPet?.sizeCategory === opt.value ? "bg-primary text-white" : "bg-gray-50 border border-border hover:border-primary/30"}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-pet-name" className="block text-sm font-medium mb-1">반려견 이름</label>
                    <input id="edit-pet-name" aria-label="반려견 이름" type="text" value={state.editPet.name} onChange={(e) => dispatch({ type: "SET_PET_FIELD", field: "name", value: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="edit-pet-breed" className="block text-sm font-medium mb-1">견종</label>
                    <input id="edit-pet-breed" aria-label="견종" type="text" value={state.editPet.breed} onChange={(e) => dispatch({ type: "SET_PET_FIELD", field: "breed", value: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edit-pet-weight" className="block text-sm font-medium mb-1">몸무게 (kg)</label>
                    <input id="edit-pet-weight" aria-label="몸무게" type="number" value={state.editPet.weight} onChange={(e) => dispatch({ type: "SET_PET_FIELD", field: "weight", value: e.target.value })} step="0.1" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="edit-pet-gender" className="block text-sm font-medium mb-1">성별</label>
                    <select id="edit-pet-gender" aria-label="성별" value={state.editPet.gender} onChange={(e) => dispatch({ type: "SET_PET_FIELD", field: "gender", value: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="male">남아</option>
                      <option value="female">여아</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input id="edit-pet-neutered" aria-label="중성화" type="checkbox" checked={state.editPet.neutered} onChange={(e) => dispatch({ type: "SET_PET_FIELD", field: "neutered", value: e.target.checked })} className="rounded" />
                      중성화
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-pet-notes" className="block text-sm font-medium mb-1">특이사항</label>
                  <textarea id="edit-pet-notes" aria-label="특이사항" value={state.editPet.specialNotes} onChange={(e) => dispatch({ type: "SET_PET_FIELD", field: "specialNotes", value: e.target.value })} rows={2} placeholder="공격성, 알러지, 주의사항 등" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
              </>
            )}

            <button onClick={handleSave} disabled={state.saving} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50">
              <Save className="w-4 h-4" />
              {state.saving ? "저장 중..." : "저장"}
            </button>
          </div>
        )}

        {/* 예약 이력 탭 */}
        {state.tab === "history" && (
          <div className="p-4">
            {reservations.length === 0 ? (
              <p className="text-muted text-center py-8 text-sm">예약 이력이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Scissors className="w-3.5 h-3.5 text-muted" />
                          <span className="text-sm font-medium">{r.services?.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{statusLabels[r.status]}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted mt-1">
                          <Clock className="w-3 h-3" />
                          {r.date} {r.start_time.slice(0, 5)}-{r.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">₩{r.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
