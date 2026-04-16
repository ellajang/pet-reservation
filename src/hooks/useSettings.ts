import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJSON, postJSON, patchJSON, deleteJSON } from "@/shared/lib/api";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchJSON("/api/settings"),
  });
}

export function useSaveSettings() {
  return useMutation({
    mutationFn: (body: unknown) => patchJSON("/api/settings", body),
  });
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => fetchJSON("/api/services"),
    staleTime: 60 * 1000,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => postJSON("/api/services", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      patchJSON(`/api/services/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteJSON(`/api/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
