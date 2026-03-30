"use client";

import { useState } from "react";
import { Plus, Search, Phone, Dog, ChevronRight } from "lucide-react";

interface CustomerDisplay {
  id: string;
  name: string;
  phone: string;
  pets: { name: string; breed: string }[];
  visitCount: number;
  lastVisit: string;
  noShowCount: number;
}

const sampleCustomers: CustomerDisplay[] = [
  {
    id: "1",
    name: "김민지",
    phone: "010-1234-5678",
    pets: [{ name: "초코", breed: "말티즈" }],
    visitCount: 5,
    lastVisit: "2026-03-25",
    noShowCount: 0,
  },
  {
    id: "2",
    name: "이수진",
    phone: "010-9876-5432",
    pets: [
      { name: "몽이", breed: "푸들" },
      { name: "콩이", breed: "비숑" },
    ],
    visitCount: 3,
    lastVisit: "2026-03-20",
    noShowCount: 1,
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
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

  const filtered = sampleCustomers.filter(
    (c) =>
      c.name.includes(search) ||
      c.phone.includes(search) ||
      c.pets.some((p) => p.name.includes(search))
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase에 저장
    console.log("고객 등록:", newCustomer);
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

      {/* 검색 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="고객명, 연락처, 반려견 이름으로 검색"
          className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* 고객 목록 */}
      <div className="space-y-3">
        {filtered.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-xl border border-border shadow-sm p-4 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  {customer.noShowCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      노쇼 {customer.noShowCount}회
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {customer.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Dog className="w-3.5 h-3.5" />
                    {customer.pets.map((p) => `${p.name}(${p.breed})`).join(", ")}
                  </span>
                </div>

                <div className="flex gap-4 mt-2 text-xs text-muted">
                  <span>방문 {customer.visitCount}회</span>
                  <span>마지막 방문: {customer.lastVisit}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* 고객 등록 모달 */}
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
                  <label className="block text-sm font-medium mb-1">이름</label>
                  <input
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
                  <label className="block text-sm font-medium mb-1">
                    연락처
                  </label>
                  <input
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
                  <label className="block text-sm font-medium mb-1">
                    반려견 이름
                  </label>
                  <input
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
                  <label className="block text-sm font-medium mb-1">견종</label>
                  <input
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
                  <label className="block text-sm font-medium mb-1">
                    몸무게 (kg)
                  </label>
                  <input
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
                  <label className="block text-sm font-medium mb-1">성별</label>
                  <select
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
                      checked={newCustomer.neutered}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
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
                  value={newCustomer.specialNotes}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      specialNotes: e.target.value,
                    })
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
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
