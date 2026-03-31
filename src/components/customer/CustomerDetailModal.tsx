"use client";

import { useState, useEffect } from "react";
import { X, Save, Clock, Scissors } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: number | null;
  gender: string | null;
  neutered: boolean;
  special_notes: string | null;
}

interface Reservation {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  services: { name: string } | null;
}

interface CustomerDetail {
  id: string;
  name: string;
  phone: string;
  memo: string | null;
  no_show_count: number;
  is_blocked: boolean;
  block_reason: string | null;
  created_at: string;
  pets: Pet[];
}

const statusLabels: Record<string, string> = {
  pending: "승인 대기",
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
  noshow: "노쇼",
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-100",
  confirmed: "text-blue-700 bg-blue-100",
  completed: "text-green-700 bg-green-100",
  cancelled: "text-gray-500 bg-gray-100",
  noshow: "text-red-700 bg-red-100",
};

export default function CustomerDetailModal({
  customerId,
  onClose,
  onUpdated,
}: {
  customerId: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"info" | "history">("info");

  // 편집 폼
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editPet, setEditPet] = useState<{
    id: string;
    name: string;
    breed: string;
    weight: string;
    gender: string;
    neutered: boolean;
    specialNotes: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/customers/${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomer(data.customer);
        setReservations(data.reservations || []);
        setEditName(data.customer.name);
        setEditPhone(data.customer.phone);
        setEditMemo(data.customer.memo || "");
        if (data.customer.pets?.length > 0) {
          const p = data.customer.pets[0];
          setEditPet({
            id: p.id,
            name: p.name,
            breed: p.breed,
            weight: p.weight ? String(p.weight) : "",
            gender: p.gender || "male",
            neutered: p.neutered || false,
            specialNotes: p.special_notes || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: editName,
          phone: editPhone,
          memo: editMemo,
        },
        pet: editPet
          ? {
              id: editPet.id,
              name: editPet.name,
              breed: editPet.breed,
              weight: editPet.weight ? parseFloat(editPet.weight) : null,
              gender: editPet.gender,
              neutered: editPet.neutered,
              specialNotes: editPet.specialNotes,
            }
          : undefined,
      }),
    });

    if (res.ok) {
      onUpdated();
      onClose();
    } else {
      const err = await res.json();
      alert(err.error || "저장에 실패했습니다");
    }
    setSaving(false);
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

  const completedCount = reservations.filter(
    (r) => r.status === "completed"
  ).length;
  const cancelledCount = reservations.filter(
    (r) => r.status === "cancelled"
  ).length;
  const totalSpent = reservations
    .filter((r) => r.status === "completed")
    .reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold">고객 상세</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 요약 */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-xl font-bold">{customer.name}</h4>
            {customer.is_blocked && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                차단됨
              </span>
            )}
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
              <p className={`text-lg font-bold ${cancelledCount > 0 ? "text-gray-500" : ""}`}>
                {cancelledCount}회
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted">노쇼</p>
              <p className={`text-lg font-bold ${customer.no_show_count > 0 ? "text-red-500" : ""}`}>
                {customer.no_show_count}회
              </p>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-border mx-4 mt-2">
          <button
            onClick={() => setTab("info")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === "info"
                ? "border-primary text-primary"
                : "border-transparent text-muted"
            }`}
          >
            정보 수정
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === "history"
                ? "border-primary text-primary"
                : "border-transparent text-muted"
            }`}
          >
            예약 이력 ({reservations.length})
          </button>
        </div>

        {/* 정보 수정 탭 */}
        {tab === "info" && (
          <div className="p-4 space-y-4">
            <h5 className="text-sm font-medium text-muted">보호자 정보</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">연락처</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">메모</label>
              <textarea
                value={editMemo}
                onChange={(e) => setEditMemo(e.target.value)}
                rows={2}
                placeholder="고객 관련 메모"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {editPet && (
              <>
                <hr className="border-border" />
                <h5 className="text-sm font-medium text-muted">반려견 정보</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      반려견 이름
                    </label>
                    <input
                      type="text"
                      value={editPet.name}
                      onChange={(e) =>
                        setEditPet({ ...editPet, name: e.target.value })
                      }
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      견종
                    </label>
                    <input
                      type="text"
                      value={editPet.breed}
                      onChange={(e) =>
                        setEditPet({ ...editPet, breed: e.target.value })
                      }
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      몸무게 (kg)
                    </label>
                    <input
                      type="number"
                      value={editPet.weight}
                      onChange={(e) =>
                        setEditPet({ ...editPet, weight: e.target.value })
                      }
                      step="0.1"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      성별
                    </label>
                    <select
                      value={editPet.gender}
                      onChange={(e) =>
                        setEditPet({ ...editPet, gender: e.target.value })
                      }
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="male">남아</option>
                      <option value="female">여아</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editPet.neutered}
                        onChange={(e) =>
                          setEditPet({
                            ...editPet,
                            neutered: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      중성화
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    특이사항
                  </label>
                  <textarea
                    value={editPet.specialNotes}
                    onChange={(e) =>
                      setEditPet({
                        ...editPet,
                        specialNotes: e.target.value,
                      })
                    }
                    rows={2}
                    placeholder="공격성, 알러지, 주의사항 등"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        )}

        {/* 예약 이력 탭 */}
        {tab === "history" && (
          <div className="p-4">
            {reservations.length === 0 ? (
              <p className="text-muted text-center py-8 text-sm">
                예약 이력이 없습니다
              </p>
            ) : (
              <div className="space-y-2">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Scissors className="w-3.5 h-3.5 text-muted" />
                          <span className="text-sm font-medium">
                            {r.services?.name}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}
                          >
                            {statusLabels[r.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted mt-1">
                          <Clock className="w-3 h-3" />
                          {r.date} {r.start_time.slice(0, 5)}-
                          {r.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      ₩{r.price.toLocaleString()}
                    </span>
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
