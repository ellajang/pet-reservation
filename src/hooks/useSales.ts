import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "@/shared/lib/api";

export function useSales(month: string) {
  return useQuery({
    queryKey: ["sales", month],
    queryFn: () => fetchJSON(`/api/sales?month=${month}`),
  });
}
