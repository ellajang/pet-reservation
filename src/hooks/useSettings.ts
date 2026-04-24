import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAPI, serviceAPI } from "@/services/settingsAPI";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsAPI.get(),
  });
}

export function useSaveSettings() {
  return useMutation({
    mutationFn: (body: unknown) => settingsAPI.save(body),
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => serviceAPI.getAll(),
    staleTime: 60 * 1000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => serviceAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      serviceAPI.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
