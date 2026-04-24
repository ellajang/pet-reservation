import { fetchJSON } from "@/shared/lib/api";

export const salesAPI = {
  getByMonth: (month: string) =>
    fetchJSON(`/api/sales?month=${month}`),
};
