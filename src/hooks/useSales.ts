import { useQuery } from "@tanstack/react-query";
import { salesAPI } from "@/services/salesAPI";

export function useSales(month: string) {
  return useQuery({
    queryKey: ["sales", month],
    queryFn: () => salesAPI.getByMonth(month),
  });
}
