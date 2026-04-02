import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "@/shared/lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchJSON("/api/dashboard"),
  });
}
