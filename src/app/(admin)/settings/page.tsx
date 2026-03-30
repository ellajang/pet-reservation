"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Copy, Check, Plus, Pencil, Trash2, X } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
}

export default function SettingsPage() {
  const [shopName, setShopName] = useState("펫살롱");
  const [businessHours, setBusinessHours] = useState({
    start: "09:00",
    end: "18:00",
  });
  const [closedDays, setClosedDays] = useState([0]);
  const [copied, setCopied] = useState(false);

  // 서비스 관리
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = useCallback(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/book/demo`
      : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const openAddService = () => {
    setEditingService(null);
    setServiceForm({ name: "", duration: "", price: "", description: "" });
    setShowServiceForm(true);
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      duration: String(service.duration),
      price: String(service.price),
      description: service.description || "",
    });
    setShowServiceForm(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const body = {
      name: serviceForm.name,
      duration: parseInt(serviceForm.duration),
      price: parseInt(serviceForm.price),
      description: serviceForm.description || null,
    };

    if (editingService) {
      await fetch(`/api/services/${editingService.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setShowServiceForm(false);
    fetchServices();
    setSubmitting(false);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("이 서비스를 삭제하시겠습니까?")) return;

    await fetch(`/api/services/${id}`, { method: "DELETE" });
    fetchServices();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">설정</h2>

      <div className="space-y-6">
        {/* 서비스 관리 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">서비스 관리</h3>
            <button
              onClick={openAddService}
              className="flex items-center gap-1 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              서비스 추가
            </button>
          </div>

          {services.length === 0 ? (
            <p className="text-muted text-center py-6 text-sm">
              등록된 서비스가 없습니다. 서비스를 추가해주세요.
            </p>
          ) : (
            <div className="space-y-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted">
                      {service.duration}분 · ₩
                      {service.price.toLocaleString()}
                      {service.description && ` · ${service.description}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditService(service)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-muted hover:text-foreground"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-muted hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 매장 정보 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">매장 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">매장명</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full max-w-md border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 영업 시간 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">영업 시간</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">시작</label>
              <input
                type="time"
                value={businessHours.start}
                onChange={(e) =>
                  setBusinessHours({ ...businessHours, start: e.target.value })
                }
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="mt-6">~</span>
            <div>
              <label className="block text-sm font-medium mb-1">종료</label>
              <input
                type="time"
                value={businessHours.end}
                onChange={(e) =>
                  setBusinessHours({ ...businessHours, end: e.target.value })
                }
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">휴무일</label>
            <div className="flex gap-2">
              {dayNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setClosedDays(
                      closedDays.includes(i)
                        ? closedDays.filter((d) => d !== i)
                        : [...closedDays, i]
                    )
                  }
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    closedDays.includes(i)
                      ? "bg-red-100 text-red-600 border-red-200 border"
                      : "bg-gray-50 text-foreground border border-border hover:bg-gray-100"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 예약 링크 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">고객 예약 링크</h3>
          <p className="text-sm text-muted mb-3">
            이 링크를 카카오톡으로 고객에게 보내면, 고객이 직접 예약할 수
            있습니다.
          </p>
          <div className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={bookingUrl}
              readOnly
              className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors">
          <Save className="w-4 h-4" />
          설정 저장
        </button>
      </div>

      {/* 서비스 추가/수정 모달 */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">
                {editingService ? "서비스 수정" : "서비스 추가"}
              </h3>
              <button
                onClick={() => setShowServiceForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  서비스명
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, name: e.target.value })
                  }
                  placeholder="예: 전체미용"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    소요시간 (분)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        duration: e.target.value,
                      })
                    }
                    placeholder="120"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        price: e.target.value,
                      })
                    }
                    placeholder="50000"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  설명 (선택)
                </label>
                <input
                  type="text"
                  value={serviceForm.description}
                  onChange={(e) =>
                    setServiceForm({
                      ...serviceForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="예: 목욕 + 전체 커트"
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting
                    ? "저장 중..."
                    : editingService
                    ? "수정"
                    : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
