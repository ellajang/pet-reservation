import { useQuery } from "@tanstack/react-query";
import { fetchJSON } from "@/shared/lib/api";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJSON("/api/settings"),
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => fetchJSON("/api/services"),
    staleTime: 60 * 1000,
  });
}
