// TanStack Query 키 중앙 관리
// queryKey 오타 방지 + 일관된 무효화

export const queryKeys = {
  // 고객
  customers: {
    all: ["customers"] as const,
    list: (search: string) => [...queryKeys.customers.all, "list", search] as const,
    detail: (id: string | null) => [...queryKeys.customers.all, "detail", id] as const,
    analytics: () => [...queryKeys.customers.all, "analytics"] as const,
  },

  // 예약
  reservations: {
    all: ["reservations"] as const,
    byMonth: (month: string) => [...queryKeys.reservations.all, "month", month] as const,
  },

  // 매출
  sales: {
    all: ["sales"] as const,
    byMonth: (month: string) => [...queryKeys.sales.all, "month", month] as const,
  },

  // 설정/서비스
  settings: {
    all: ["settings"] as const,
  },
  services: {
    all: ["services"] as const,
  },

  // 대시보드
  dashboard: {
    all: ["dashboard"] as const,
  },
};
