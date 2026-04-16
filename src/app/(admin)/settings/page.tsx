"use client";

import { useState, useEffect } from "react";
import { Save, Copy, Check, Plus, Pencil, Trash2, X } from "lucide-react";
import {
  useServices, useSettings, useSaveSettings,
  useCreateService, useUpdateService, useDeleteService,
} from "@/hooks/useSettings";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  size_category: string;
}

const sizeCategories = [
  { value: "small", label: "소형견" },
  { value: "medium", label: "중형견" },
  { value: "large", label: "대형견" },
  { value: "special", label: "특수견" },
];

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

const emptyServiceForm = { name: "", duration: "", price: "", description: "", size_category: "small" };

// === Component ===

export default function SettingsPage() {
  // 매장 설정
  const [shopSettings, setShopSettings] = useState({
    shopName: "펫살롱",
    hoursStart: "09:00",
    hoursEnd: "18:00",
    closedDays: [0] as number[],
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // 서비스 관리 모달
  const [serviceModal, setServiceModal] = useState<{
    open: boolean;
    editing: Service | null;
    form: typeof emptyServiceForm;
    submitting: boolean;
  }>({ open: false, editing: null, form: emptyServiceForm, submitting: false });

  const { data: services = [] } = useServices() as { data: Service[] };
  const { data: settingsData } = useSettings() as { data: Record<string, unknown> | undefined };
  const saveSettings = useSaveSettings();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  // 설정 데이터 로드
  useEffect(() => {
    if (settingsData && !("error" in settingsData)) {
      setShopSettings({
        shopName: (settingsData.shop_name as string) || "펫살롱",
        hoursStart: (settingsData.business_hours_start as string)?.slice(0, 5) || "09:00",
        hoursEnd: (settingsData.business_hours_end as string)?.slice(0, 5) || "18:00",
        closedDays: (settingsData.closed_days as number[]) || [0],
      });
    }
  }, [settingsData]);

  useEffect(() => {
    setBookingUrl(`${window.location.origin}/booking/new`);
  }, []);

  const handleSaveSettings = () => {
    setSaving(true);
    saveSettings.mutate(
      {
        shopName: shopSettings.shopName,
        businessHoursStart: shopSettings.hoursStart,
        businessHoursEnd: shopSettings.hoursEnd,
        closedDays: shopSettings.closedDays,
      },
      {
        onSuccess: () => setSaveMessage("저장되었습니다!"),
        onError: () => setSaveMessage("저장에 실패했습니다"),
        onSettled: () => {
          setTimeout(() => setSaveMessage(""), 2000);
          setSaving(false);
        },
      }
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleClosedDay = (day: number) => {
    setShopSettings((s) => ({
      ...s,
      closedDays: s.closedDays.includes(day)
        ? s.closedDays.filter((d) => d !== day)
        : [...s.closedDays, day],
    }));
  };

  const openAddService = () => {
    setServiceModal({ open: true, editing: null, form: emptyServiceForm, submitting: false });
  };

  const openEditService = (service: Service) => {
    setServiceModal({
      open: true,
      editing: service,
      form: {
        name: service.name,
        duration: String(service.duration),
        price: String(service.price),
        description: service.description || "",
        size_category: service.size_category || "small",
      },
      submitting: false,
    });
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServiceModal((m) => ({ ...m, submitting: true }));

    const body = {
      name: serviceModal.form.name,
      duration: parseInt(serviceModal.form.duration),
      price: parseInt(serviceModal.form.price),
      description: serviceModal.form.description || null,
      size_category: serviceModal.form.size_category,
    };

    const onDone = {
      onSuccess: () => setServiceModal((m) => ({ ...m, open: false, submitting: false })),
      onError: () => setServiceModal((m) => ({ ...m, submitting: false })),
    };

    if (serviceModal.editing) {
      updateService.mutate({ id: serviceModal.editing.id, body }, onDone);
    } else {
      createService.mutate(body, onDone);
    }
  };

  const handleDeleteService = (id: string) => {
    if (!confirm("이 서비스를 삭제하시겠습니까?")) return;
    deleteService.mutate(id);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">설정</h2>

      <div className="space-y-6">
        {/* 서비스 관리 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">서비스 관리</h3>
            <button onClick={openAddService} className="flex items-center gap-1 text-sm bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors">
              <Plus className="w-4 h-4" />
              서비스 추가
            </button>
          </div>

          {services.length === 0 ? (
            <p className="text-muted text-center py-6 text-sm">등록된 서비스가 없습니다. 서비스를 추가해주세요.</p>
          ) : (
            <div className="space-y-4">
              {sizeCategories.map((cat) => {
                const catServices = services.filter((s) => (s.size_category || "small") === cat.value);
                if (catServices.length === 0) return null;
                return (
                  <div key={cat.value}>
                    <h4 className="text-sm font-medium text-muted mb-2">{cat.label}</h4>
                    <div className="space-y-2">
                      {catServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted">
                              {service.duration}분 · ₩{service.price.toLocaleString()}
                              {service.description && ` · ${service.description}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditService(service)} className="p-2 hover:bg-gray-100 rounded-lg text-muted hover:text-foreground">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteService(service.id)} className="p-2 hover:bg-red-50 rounded-lg text-muted hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 매장 정보 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">매장 정보</h3>
          <div>
            <label className="block text-sm font-medium mb-1">매장명</label>
            <input
              type="text"
              value={shopSettings.shopName}
              onChange={(e) => setShopSettings((s) => ({ ...s, shopName: e.target.value }))}
              className="w-full max-w-md border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* 영업 시간 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">영업 시간</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">시작</label>
              <input type="time" aria-label="영업시작시간" value={shopSettings.hoursStart} onChange={(e) => setShopSettings((s) => ({ ...s, hoursStart: e.target.value }))} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <span className="mt-6">~</span>
            <div>
              <label className="block text-sm font-medium mb-1">종료</label>
              <input type="time" aria-label="영업종료시간" value={shopSettings.hoursEnd} onChange={(e) => setShopSettings((s) => ({ ...s, hoursEnd: e.target.value }))} className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">휴무일</label>
            <div className="flex gap-2">
              {dayNames.map((name, i) => (
                <button key={i} onClick={() => toggleClosedDay(i)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${shopSettings.closedDays.includes(i) ? "bg-red-100 text-red-600 border-red-200 border" : "bg-gray-50 text-foreground border border-border hover:bg-gray-100"}`}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 예약 링크 */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold mb-4">고객 예약 링크</h3>
          <p className="text-sm text-muted mb-3">이 링크를 카카오톡으로 고객에게 보내면, 고객이 직접 예약할 수 있습니다.</p>
          <div className="flex gap-2 max-w-lg">
            <input type="text" aria-label="예약링크" value={bookingUrl} readOnly className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-gray-50" />
            <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "저장 중..." : "설정 저장"}
          </button>
          {saveMessage && <span className="text-sm text-green-600 font-medium">{saveMessage}</span>}
        </div>
      </div>

      {/* 서비스 추가/수정 모달 */}
      {serviceModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{serviceModal.editing ? "서비스 수정" : "서비스 추가"}</h3>
              <button onClick={() => setServiceModal((m) => ({ ...m, open: false }))} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">견종 크기</label>
                <div className="grid grid-cols-4 gap-2">
                  {sizeCategories.map((cat) => (
                    <button key={cat.value} type="button" onClick={() => setServiceModal((m) => ({ ...m, form: { ...m.form, size_category: cat.value } }))} className={`py-2 rounded-lg text-sm font-medium transition-colors ${serviceModal.form.size_category === cat.value ? "bg-primary text-white" : "bg-gray-50 border border-border hover:border-primary/30"}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">서비스명</label>
                <input type="text" aria-label="서비스명" value={serviceModal.form.name} onChange={(e) => setServiceModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))} placeholder="예: 전체미용" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">소요시간 (분)</label>
                  <input type="number" aria-label="소요시간" value={serviceModal.form.duration} onChange={(e) => setServiceModal((m) => ({ ...m, form: { ...m.form, duration: e.target.value } }))} placeholder="120" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">가격 (원)</label>
                  <input type="number" aria-label="가격" value={serviceModal.form.price} onChange={(e) => setServiceModal((m) => ({ ...m, form: { ...m.form, price: e.target.value } }))} placeholder="50000" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명 (선택)</label>
                <input type="text" aria-label="설명" value={serviceModal.form.description} onChange={(e) => setServiceModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))} placeholder="예: 목욕 + 전체 커트" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setServiceModal((m) => ({ ...m, open: false }))} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50">취소</button>
                <button type="submit" disabled={serviceModal.submitting} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50">
                  {serviceModal.submitting ? "저장 중..." : serviceModal.editing ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
