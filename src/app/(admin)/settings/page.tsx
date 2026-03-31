"use client";

import { useReducer, useEffect } from "react";
import { Save, Copy, Check, Plus, Pencil, Trash2, X } from "lucide-react";
import { useServices, useSettings } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";

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

// === State & Actions ===

interface SettingsState {
  shopName: string;
  businessHours: { start: string; end: string };
  closedDays: number[];
  bookingUrl: string;
  copied: boolean;
  saving: boolean;
  saveMessage: string;
  showServiceForm: boolean;
  editingService: Service | null;
  serviceForm: {
    name: string;
    duration: string;
    price: string;
    description: string;
    size_category: string;
  };
  submitting: boolean;
}

type SettingsAction =
  | { type: "LOAD_SETTINGS"; data: { shop_name: string; business_hours_start: string; business_hours_end: string; closed_days: number[] } }
  | { type: "SET_SHOP_NAME"; value: string }
  | { type: "SET_HOURS_START"; value: string }
  | { type: "SET_HOURS_END"; value: string }
  | { type: "TOGGLE_CLOSED_DAY"; day: number }
  | { type: "SET_BOOKING_URL"; url: string }
  | { type: "SET_COPIED"; value: boolean }
  | { type: "SET_SAVING"; value: boolean }
  | { type: "SET_SAVE_MESSAGE"; message: string }
  | { type: "OPEN_ADD_SERVICE" }
  | { type: "OPEN_EDIT_SERVICE"; service: Service }
  | { type: "CLOSE_SERVICE_FORM" }
  | { type: "UPDATE_SERVICE_FORM"; field: string; value: string }
  | { type: "SET_SUBMITTING"; value: boolean };

const initialState: SettingsState = {
  shopName: "펫살롱",
  businessHours: { start: "09:00", end: "18:00" },
  closedDays: [0],
  bookingUrl: "",
  copied: false,
  saving: false,
  saveMessage: "",
  showServiceForm: false,
  editingService: null,
  serviceForm: { name: "", duration: "", price: "", description: "", size_category: "small" },
  submitting: false,
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "LOAD_SETTINGS":
      return {
        ...state,
        shopName: action.data.shop_name || "펫살롱",
        businessHours: {
          start: action.data.business_hours_start?.slice(0, 5) || "09:00",
          end: action.data.business_hours_end?.slice(0, 5) || "18:00",
        },
        closedDays: action.data.closed_days || [0],
      };
    case "SET_SHOP_NAME":
      return { ...state, shopName: action.value };
    case "SET_HOURS_START":
      return { ...state, businessHours: { ...state.businessHours, start: action.value } };
    case "SET_HOURS_END":
      return { ...state, businessHours: { ...state.businessHours, end: action.value } };
    case "TOGGLE_CLOSED_DAY":
      return {
        ...state,
        closedDays: state.closedDays.includes(action.day)
          ? state.closedDays.filter((d) => d !== action.day)
          : [...state.closedDays, action.day],
      };
    case "SET_BOOKING_URL":
      return { ...state, bookingUrl: action.url };
    case "SET_COPIED":
      return { ...state, copied: action.value };
    case "SET_SAVING":
      return { ...state, saving: action.value };
    case "SET_SAVE_MESSAGE":
      return { ...state, saveMessage: action.message };
    case "OPEN_ADD_SERVICE":
      return {
        ...state,
        editingService: null,
        serviceForm: { name: "", duration: "", price: "", description: "", size_category: "small" },
        showServiceForm: true,
      };
    case "OPEN_EDIT_SERVICE":
      return {
        ...state,
        editingService: action.service,
        serviceForm: {
          name: action.service.name,
          duration: String(action.service.duration),
          price: String(action.service.price),
          description: action.service.description || "",
          size_category: action.service.size_category || "small",
        },
        showServiceForm: true,
      };
    case "CLOSE_SERVICE_FORM":
      return { ...state, showServiceForm: false };
    case "UPDATE_SERVICE_FORM":
      return { ...state, serviceForm: { ...state.serviceForm, [action.field]: action.value } };
    case "SET_SUBMITTING":
      return { ...state, submitting: action.value };
  }
}

// === Component ===

export default function SettingsPage() {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { data: services = [] } = useServices() as { data: Service[] };
  const { data: settingsData } = useSettings() as { data: Record<string, unknown> | undefined };
  const queryClient = useQueryClient();

  // 설정 데이터 로드
  useEffect(() => {
    if (settingsData && !("error" in settingsData)) {
      dispatch({ type: "LOAD_SETTINGS", data: settingsData as SettingsState["businessHours"] & { shop_name: string; business_hours_start: string; business_hours_end: string; closed_days: number[] } });
    }
  }, [settingsData]);

  useEffect(() => {
    dispatch({ type: "SET_BOOKING_URL", url: `${window.location.origin}/booking/new` });
  }, []);

  const handleSaveSettings = async () => {
    dispatch({ type: "SET_SAVING", value: true });
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopName: state.shopName,
        businessHoursStart: state.businessHours.start,
        businessHoursEnd: state.businessHours.end,
        closedDays: state.closedDays,
      }),
    });

    dispatch({ type: "SET_SAVE_MESSAGE", message: res.ok ? "저장되었습니다!" : "저장에 실패했습니다" });
    setTimeout(() => dispatch({ type: "SET_SAVE_MESSAGE", message: "" }), 2000);
    dispatch({ type: "SET_SAVING", value: false });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(state.bookingUrl);
    dispatch({ type: "SET_COPIED", value: true });
    setTimeout(() => dispatch({ type: "SET_COPIED", value: false }), 2000);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_SUBMITTING", value: true });

    const body = {
      name: state.serviceForm.name,
      duration: parseInt(state.serviceForm.duration),
      price: parseInt(state.serviceForm.price),
      description: state.serviceForm.description || null,
      size_category: state.serviceForm.size_category,
    };

    if (state.editingService) {
      await fetch(`/api/services/${state.editingService.id}`, {
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

    dispatch({ type: "CLOSE_SERVICE_FORM" });
    dispatch({ type: "SET_SUBMITTING", value: false });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("이 서비스를 삭제하시겠습니까?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["services"] });
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
              onClick={() => dispatch({ type: "OPEN_ADD_SERVICE" })}
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
            <div className="space-y-4">
              {sizeCategories.map((cat) => {
                const catServices = services.filter(
                  (s) => (s.size_category || "small") === cat.value
                );
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
                            <button onClick={() => dispatch({ type: "OPEN_EDIT_SERVICE", service })} className="p-2 hover:bg-gray-100 rounded-lg text-muted hover:text-foreground">
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
              value={state.shopName}
              onChange={(e) => dispatch({ type: "SET_SHOP_NAME", value: e.target.value })}
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
              <input
                type="time"
                value={state.businessHours.start}
                onChange={(e) => dispatch({ type: "SET_HOURS_START", value: e.target.value })}
                className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="mt-6">~</span>
            <div>
              <label className="block text-sm font-medium mb-1">종료</label>
              <input
                type="time"
                value={state.businessHours.end}
                onChange={(e) => dispatch({ type: "SET_HOURS_END", value: e.target.value })}
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
                  onClick={() => dispatch({ type: "TOGGLE_CLOSED_DAY", day: i })}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    state.closedDays.includes(i)
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
            이 링크를 카카오톡으로 고객에게 보내면, 고객이 직접 예약할 수 있습니다.
          </p>
          <div className="flex gap-2 max-w-lg">
            <input type="text" value={state.bookingUrl} readOnly className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-gray-50" />
            <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors">
              {state.copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {state.copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSaveSettings} disabled={state.saving} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {state.saving ? "저장 중..." : "설정 저장"}
          </button>
          {state.saveMessage && <span className="text-sm text-green-600 font-medium">{state.saveMessage}</span>}
        </div>
      </div>

      {/* 서비스 추가/수정 모달 */}
      {state.showServiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">{state.editingService ? "서비스 수정" : "서비스 추가"}</h3>
              <button onClick={() => dispatch({ type: "CLOSE_SERVICE_FORM" })} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleServiceSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">견종 크기</label>
                <div className="grid grid-cols-4 gap-2">
                  {sizeCategories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => dispatch({ type: "UPDATE_SERVICE_FORM", field: "size_category", value: cat.value })}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        state.serviceForm.size_category === cat.value
                          ? "bg-primary text-white"
                          : "bg-gray-50 border border-border hover:border-primary/30"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">서비스명</label>
                <input type="text" value={state.serviceForm.name} onChange={(e) => dispatch({ type: "UPDATE_SERVICE_FORM", field: "name", value: e.target.value })} placeholder="예: 전체미용" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">소요시간 (분)</label>
                  <input type="number" value={state.serviceForm.duration} onChange={(e) => dispatch({ type: "UPDATE_SERVICE_FORM", field: "duration", value: e.target.value })} placeholder="120" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">가격 (원)</label>
                  <input type="number" value={state.serviceForm.price} onChange={(e) => dispatch({ type: "UPDATE_SERVICE_FORM", field: "price", value: e.target.value })} placeholder="50000" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">설명 (선택)</label>
                <input type="text" value={state.serviceForm.description} onChange={(e) => dispatch({ type: "UPDATE_SERVICE_FORM", field: "description", value: e.target.value })} placeholder="예: 목욕 + 전체 커트" className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => dispatch({ type: "CLOSE_SERVICE_FORM" })} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-gray-50">
                  취소
                </button>
                <button type="submit" disabled={state.submitting} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover disabled:opacity-50">
                  {state.submitting ? "저장 중..." : state.editingService ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
