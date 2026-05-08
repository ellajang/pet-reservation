import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/services/settingsAPI";
import { queryKeys } from "@/queries/queryKeys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => dashboardAPI.get(),
  });
}
