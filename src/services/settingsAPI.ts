import { fetchJSON, postJSON, patchJSON, deleteJSON } from "@/shared/lib/api";

export const settingsAPI = {
  get: () => fetchJSON("/api/settings"),
  save: (body: unknown) => patchJSON("/api/settings", body),
};

export const serviceAPI = {
  getAll: () => fetchJSON("/api/services"),
  create: (body: unknown) => postJSON("/api/services", body),
  update: (id: string, body: unknown) => patchJSON(`/api/services/${id}`, body),
  delete: (id: string) => deleteJSON(`/api/services/${id}`),
};

export const dashboardAPI = {
  get: () => fetchJSON("/api/dashboard"),
};
