import { fetchJSON, postJSON, patchJSON } from "@/shared/lib/api";

export const customerAPI = {
  getAll: (search: string) =>
    fetchJSON(`/api/customers?search=${encodeURIComponent(search)}`),
  getDetail: (id: string) =>
    fetchJSON(`/api/customers/${id}`),
  create: (body: unknown) =>
    postJSON("/api/customers", body),
  update: (id: string, body: unknown) =>
    patchJSON(`/api/customers/${id}`, body),
  block: (id: string, blocked: boolean, reason: string | null) =>
    patchJSON(`/api/customers/${id}/block`, { blocked, reason }),
  check: (phone: string) =>
    fetchJSON(`/api/customers/check?phone=${encodeURIComponent(phone)}`),
  analytics: () =>
    fetchJSON("/api/customers/analytics"),
};
