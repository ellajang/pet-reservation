"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock, Scissors, Plus, Dog, X } from "lucide-react";
import { useCustomerDetail, useUpdateCustomer } from "@/hooks/useCustomers";
import { useCreatePet } from "@/hooks/usePets";

interface Reservation {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  services: { name: string } | null;
}

interface PetData {
  id: string;
  name: string;
  breed: string;
  weight: string;
  gender: string;
  neutered: boolean;
  specialNotes: string;
  sizeCategory: string;
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

const emptyPet: PetData = {
  id: "",
  name: "",
  breed: "",
  weight: "",
  gender: "male",
  neutered: false,
  specialNotes: "",
  sizeCategory: "small",
};

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: customerId } = use(params);
  const router = useRouter();

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [pets, setPets] = useState<PetData[]>([]);
  const [selectedPetIdx, setSelectedPetIdx] = useState(0);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState<PetData>(emptyPet);

  const { data, isLoading: loading } = useCustomerDetail(customerId) as {
    data: { customer: Record<string, unknown>; reservations: Reservation[] } | undefined;
    isLoading: boolean;
  };
  const updateCustomer = useUpdateCustomer();
  const createPet = useCreatePet();

  const customer = data?.customer;
  const reservations = (data?.reservations || []) as Reservation[];

  useEffect(() => {
    if (!customer) return;
    setEditName((customer.name as string) || "");
    setEditPhone((customer.phone as string) || "");
    setEditMemo((customer.memo as string) || "");
    const petsArr = (customer.pets as Array<Record<string, unknown>>) || [];
    setPets(
      petsArr.map((p) => ({
        id: p.id as string,
        name: p.name as string,
        breed: p.breed as string,
        weight: p.weight ? String(p.weight) : "",
        gender: (p.gender as string) || "male",
        neutered: (p.neutered as boolean) || false,
        specialNotes: (p.special_notes as string) || "",
        sizeCategory: (p.size_category as string) || "small",
      }))
    );
  }, [customer]);

  const updatePetField = (field: keyof PetData, value: string | boolean) => {
    setPets((prev) =>
      prev.map((p, i) =>
        i === selectedPetIdx ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSave = () => {
    const selectedPet = pets[selectedPetIdx];
    const body = {
      customer: { name: editName, phone: editPhone, memo: editMemo },
      pet: selectedPet
        ? { ...selectedPet, weight: selectedPet.weight ? parseFloat(selectedPet.weight) : null }
        : undefined,
    };

    updateCustomer.mutate({ id: customerId, body }, {
      onSuccess: () => alert("저장되었습니다"),
      onError: (err: Error) => alert(err.message || "저장에 실패했습니다"),
    });
  };

  const handleAddPet = () => {
    if (!newPet.name || !newPet.breed) {
      alert("반려견 이름과 견종을 입력해주세요");
      return;
    }
    createPet.mutate(
      {
        customerId,
        name: newPet.name,
        breed: newPet.breed,
        weight: newPet.weight ? parseFloat(newPet.weight) : null,
        gender: newPet.gender,
        neutered: newPet.neutered,
        specialNotes: newPet.specialNotes,
        sizeCategory: newPet.sizeCategory,
      },
      {
        onSuccess: () => {
          setShowAddPet(false);
          setNewPet(emptyPet);
        },
        onError: (err: Error) => alert(err.message || "반려견 추가에 실패했습니다"),
      }
    );
  };

  if (loading) {
    return <p className="text-muted text-center py-16">불러오는 중...</p>;
  }

  if (!customer) {
    return <p className="text-muted text-center py-16">고객을 찾을 수 없습니다</p>;
  }

  const completedCount = reservations.filter((r) => r.status === "completed").length;
  const cancelledCount = reservations.filter((r) => r.status === "cancelled").length;
  const totalSpent = reservations.filter((r) => r.status === "completed").reduce((sum, r) => sum + r.price, 0);
  const currentPet = pets[selectedPetIdx];

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/customers")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            {customer.name as string}
            {Boolean(customer.is_blocked) && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                차단됨
              </span>
            )}
          </h2>
          <p className="text-sm text-muted">{customer.phone as string}</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted">방문</p>
          <p className="text-2xl font-bold mt-1">{completedCount}회</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted">누적 매출</p>
          <p className="text-2xl font-bold mt-1">₩{totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted">취소</p>
          <p className={`text-2xl font-bold mt-1 ${cancelledCount > 0 ? "text-gray-500" : ""}`}>
            {cancelledCount}회
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <p className="text-sm text-muted">노쇼</p>
          <p className={`text-2xl font-bold mt-1 ${(customer.no_show_count as number) > 0 ? "text-red-500" : ""}`}>
            {customer.no_show_count as number}회
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 정보 수정 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 보호자 정보 */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h3 className="font-semibold mb-4">보호자 정보</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium mb-1">이름</label>
                  <input id="edit-name" aria-label="이름" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">연락처</label>
                  <input id="edit-phone" aria-label="연락처" type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label htmlFor="edit-memo" className="block text-sm font-medium mb-1">메모</label>
                <textarea id="edit-memo" aria-label="메모" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} rows={2} placeholder="고객 관련 메모" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
            </div>
          </div>

          {/* 반려견 정보 */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">반려견 ({pets.length}마리)</h3>
              <button
                onClick={() => setShowAddPet(true)}
                className="flex items-center gap-1 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover"
              >
                <Plus className="w-4 h-4" /> 반려견 추가
              </button>
            </div>

            {/* 반려견 탭 */}
            {pets.length > 1 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {pets.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPetIdx(i)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedPetIdx === i
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-foreground hover:bg-gray-200"
                    }`}
                  >
                    <Dog className="w-3.5 h-3.5" />
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {currentPet && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">크기</label>
                  <div className="grid grid-cols-4 gap-2">
                    {sizeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updatePetField("sizeCategory", opt.value)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPet.sizeCategory === opt.value
                            ? "bg-primary text-white"
                            : "bg-gray-50 border border-border hover:border-primary/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-pet-name" className="block text-sm font-medium mb-1">반려견 이름</label>
                    <input id="edit-pet-name" aria-label="반려견 이름" type="text" value={currentPet.name} onChange={(e) => updatePetField("name", e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="edit-pet-breed" className="block text-sm font-medium mb-1">견종</label>
                    <input id="edit-pet-breed" aria-label="견종" type="text" value={currentPet.breed} onChange={(e) => updatePetField("breed", e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="edit-pet-weight" className="block text-sm font-medium mb-1">몸무게 (kg)</label>
                    <input id="edit-pet-weight" aria-label="몸무게" type="number" value={currentPet.weight} onChange={(e) => updatePetField("weight", e.target.value)} step="0.1" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label htmlFor="edit-pet-gender" className="block text-sm font-medium mb-1">성별</label>
                    <select id="edit-pet-gender" aria-label="성별" value={currentPet.gender} onChange={(e) => updatePetField("gender", e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="male">남아</option>
                      <option value="female">여아</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input id="edit-pet-neutered" aria-label="중성화" type="checkbox" checked={currentPet.neutered} onChange={(e) => updatePetField("neutered", e.target.checked)} className="rounded" />
                      중성화
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="edit-pet-notes" className="block text-sm font-medium mb-1">특이사항</label>
                  <textarea id="edit-pet-notes" aria-label="특이사항" value={currentPet.specialNotes} onChange={(e) => updatePetField("specialNotes", e.target.value)} rows={2} placeholder="공격성, 알러지, 주의사항 등" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={updateCustomer.isPending}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {updateCustomer.isPending ? "저장 중..." : "저장"}
          </button>
        </div>

        {/* 오른쪽: 예약 이력 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">예약 이력 ({reservations.length})</h3>
          {reservations.length === 0 ? (
            <p className="text-muted text-center py-8 text-sm">예약 이력이 없습니다</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {reservations.map((r) => (
                <div key={r.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Scissors className="w-3.5 h-3.5 text-muted" />
                    <span className="text-sm font-medium">{r.services?.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    {r.date} {r.start_time.slice(0, 5)}-{r.end_time.slice(0, 5)}
                  </div>
                  <div className="text-sm font-medium mt-1">₩{r.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 반려견 추가 모달 */}
      {showAddPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">반려견 추가</h3>
              <button onClick={() => setShowAddPet(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">크기</label>
                <div className="grid grid-cols-4 gap-2">
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewPet({ ...newPet, sizeCategory: opt.value })}
                      className={`py-1.5 rounded-lg text-xs font-medium ${
                        newPet.sizeCategory === opt.value
                          ? "bg-primary text-white"
                          : "bg-gray-50 border border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="add-pet-name" className="block text-sm font-medium mb-1">이름</label>
                  <input id="add-pet-name" aria-label="반려견 이름" type="text" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="add-pet-breed" className="block text-sm font-medium mb-1">견종</label>
                  <input id="add-pet-breed" aria-label="견종" type="text" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} placeholder="예: 말티즈" className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="add-pet-weight" className="block text-sm font-medium mb-1">몸무게</label>
                  <input id="add-pet-weight" aria-label="몸무게" type="number" value={newPet.weight} onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })} step="0.1" className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="add-pet-gender" className="block text-sm font-medium mb-1">성별</label>
                  <select id="add-pet-gender" aria-label="성별" value={newPet.gender} onChange={(e) => setNewPet({ ...newPet, gender: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm">
                    <option value="male">남아</option>
                    <option value="female">여아</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input id="add-pet-neutered" aria-label="중성화" type="checkbox" checked={newPet.neutered} onChange={(e) => setNewPet({ ...newPet, neutered: e.target.checked })} className="rounded" />
                    중성화
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="add-pet-notes" className="block text-sm font-medium mb-1">특이사항</label>
                <textarea id="add-pet-notes" aria-label="특이사항" value={newPet.specialNotes} onChange={(e) => setNewPet({ ...newPet, specialNotes: e.target.value })} rows={2} className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddPet(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm">취소</button>
                <button onClick={handleAddPet} disabled={createPet.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50">
                  {createPet.isPending ? "추가 중..." : "추가"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
