"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Phone, Dog } from "lucide-react";
import CustomerDetailModal from "./CustomerDetailModal";
import { useCustomers, useCreateCustomer, useBlockCustomer } from "@/hooks/useCustomers";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  no_show_count: number;
  is_blocked: boolean;
  block_reason: string | null;
  created_at: string;
  pets: { id: string; name: string; breed: string; weight: number | null }[];
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    petName: "",
    breed: "",
    weight: "",
    gender: "male",
    neutered: false,
    specialNotes: "",
  });

  const { data: customers = [], isLoading: loading } = useCustomers(debouncedSearch) as {
    data: CustomerData[];
    isLoading: boolean;
  };
  const createCustomer = useCreateCustomer();
  const blockCustomer = useBlockCustomer();

  const handleToggleBlock = (e: React.MouseEvent, customer: CustomerData) => {
    e.stopPropagation();
    if (!customer.is_blocked) {
      const reason = prompt(`${customer.name}님을 차단하시겠습니까?\n차단 사유:`);
      if (reason === null) return;
      blockCustomer.mutate({ id: customer.id, blocked: true, reason });
    } else {
      if (!confirm(`${customer.name}님의 차단을 해제하시겠습니까?`)) return;
      blockCustomer.mutate({ id: customer.id, blocked: false, reason: null });
    }
  };

  // 검색 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    createCustomer.mutate(
      {
        customer: {
          name: newCustomer.name,
          phone: newCustomer.phone,
        },
        pet: {
          name: newCustomer.petName,
          breed: newCustomer.breed,
          weight: newCustomer.weight ? parseFloat(newCustomer.weight) : null,
          gender: newCustomer.gender,
          neutered: newCustomer.neutered,
          specialNotes: newCustomer.specialNotes,
        },
      },
      {
        onSuccess: () => {
          setShowAddForm(false);
          setNewCustomer({
            name: "",
            phone: "",
            petName: "",
            breed: "",
            weight: "",
            gender: "male",
            neutered: false,
            specialNotes: "",
          });
        },
        onError: (err: Error) => {
          alert(err.message || "고객 등록에 실패했습니다");
        },
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">고객 관리</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          고객 등록
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="customer-search"
          aria-label="고객 검색"
          placeholder="고객명, 연락처로 검색"
          className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-muted text-center py-8">불러오는 중...</p>
        ) : customers.length === 0 ? (
          <p className="text-muted text-center py-8">
            {search ? "검색 결과가 없습니다" : "등록된 고객이 없습니다"}
          </p>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomerId(customer.id)}
              className="bg-white rounded-xl border border-border shadow-sm p-4 hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    {customer.is_blocked && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        차단됨
                      </span>
                    )}
                    {customer.no_show_count > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        노쇼 {customer.no_show_count}회
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {customer.phone}
                    </span>
                    {customer.pets.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Dog className="w-3.5 h-3.5" />
                        {customer.pets
                          .map((p) => `${p.name}(${p.breed})`)
                          .join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleBlock(e, customer)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    customer.is_blocked
                      ? "bg-gray-100 text-foreground hover:bg-gray-200"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                  }`}
                >
                  {customer.is_blocked ? "차단 해제" : "차단"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">새 고객 등록</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-4 space-y-4">
              <h4 className="font-medium text-sm text-muted">보호자 정보</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-name" className="block text-sm font-medium mb-1">이름</label>
                  <input
                    id="new-name" aria-label="이름"
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-phone" className="block text-sm font-medium mb-1">연락처</label>
                  <input
                    id="new-phone" aria-label="연락처"
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    placeholder="010-0000-0000"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <hr className="border-border" />
              <h4 className="font-medium text-sm text-muted">반려견 정보</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-pet-name" className="block text-sm font-medium mb-1">반려견 이름</label>
                  <input
                    id="new-pet-name" aria-label="반려견 이름"
                    type="text"
                    value={newCustomer.petName}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, petName: e.target.value })
                    }
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-breed" className="block text-sm font-medium mb-1">견종</label>
                  <input
                    id="new-breed" aria-label="견종"
                    type="text"
                    value={newCustomer.breed}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, breed: e.target.value })
                    }
                    placeholder="예: 말티즈"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="new-weight" className="block text-sm font-medium mb-1">몸무게 (kg)</label>
                  <input
                    id="new-weight" aria-label="몸무게"
                    type="number"
                    value={newCustomer.weight}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, weight: e.target.value })
                    }
                    step="0.1"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="new-gender" className="block text-sm font-medium mb-1">성별</label>
                  <select
                    id="new-gender" aria-label="성별"
                    value={newCustomer.gender}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, gender: e.target.value })
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
                      id="new-neutered" aria-label="중성화"
                      checked={newCustomer.neutered}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, neutered: e.target.checked })
                      }
                      className="rounded"
                    />
                    중성화
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="new-notes" className="block text-sm font-medium mb-1">특이사항</label>
                <textarea
                  id="new-notes" aria-label="특이사항"
                  value={newCustomer.specialNotes}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, specialNotes: e.target.value })
                  }
                  rows={3}
                  placeholder="공격성, 알러지, 주의사항 등"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createCustomer.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50"
                >
                  {createCustomer.isPending ? "등록 중..." : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomerId && (
        <CustomerDetailModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
}
