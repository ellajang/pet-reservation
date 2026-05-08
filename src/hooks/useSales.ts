import { useQuery } from "@tanstack/react-query";
import { salesAPI } from "@/services/salesAPI";
import { queryKeys } from "@/queries/queryKeys";

export function useSales(month: string) {
  return useQuery({
    queryKey: queryKeys.sales.byMonth(month),
    queryFn: () => salesAPI.getByMonth(month),
  });
}
