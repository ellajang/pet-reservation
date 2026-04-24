import { fetchJSON, postJSON, patchJSON } from "@/shared/lib/api";

export const reservationAPI = {
  getByMonth: async (month: string) => {
    const data = await fetchJSON<unknown[]>(`/api/reservations?month=${month}`);
    return Array.isArray(data) ? data : [];
  },
  create: (body: unknown) =>
    postJSON("/api/reservations", body),
  updateStatus: (id: string, status: string) =>
    patchJSON(`/api/reservations/${id}`, { status }),
  getAvailable: (date: string, duration: number) =>
    fetchJSON(`/api/reservations/available?date=${date}&duration=${duration}`),
  autoComplete: () =>
    postJSON("/api/reservations/auto-complete", {}),
};
