import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/services/settingsAPI";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardAPI.get(),
  });
}
