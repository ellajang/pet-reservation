import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// === fetch 헬퍼 ===
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("데이터를 불러오는데 실패했습니다");
  const data = await res.json();
  return data;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "요청에 실패했습니다");
  }
  return res.json();
}

async function patchJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "요청에 실패했습니다");
  }
  return res.json();
}

// === 대시보드 ===
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchJSON("/api/dashboard"),
  });
}

export function useAutoComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postJSON("/api/reservations/auto-complete", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// === 예약 ===
export function useReservations(month: string) {
  return useQuery({
    queryKey: ["reservations", month],
    queryFn: async () => {
      const data = await fetchJSON<unknown[]>(`/api/reservations?month=${month}`);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      patchJSON(`/api/reservations/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });
}

// === 고객 ===
export function useCustomers(search: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () =>
      fetchJSON(`/api/customers?search=${encodeURIComponent(search)}`),
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => fetchJSON(`/api/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => postJSON("/api/customers", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      patchJSON(`/api/customers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}

// === 서비스 ===
export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => fetchJSON("/api/services"),
    staleTime: 60 * 1000, // 서비스 목록은 1분 캐시
  });
}

// === 매출 ===
export function useSales(month: string) {
  return useQuery({
    queryKey: ["sales", month],
    queryFn: () => fetchJSON(`/api/sales?month=${month}`),
  });
}

// === 설정 ===
export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJSON("/api/settings"),
  });
}

// === 고객 분석 ===
export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ["customer-analytics"],
    queryFn: () => fetchJSON("/api/customers/analytics"),
    staleTime: 60 * 1000,
  });
}
