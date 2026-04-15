import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJSON, postJSON, patchJSON } from "@/shared/lib/api";

export function useCustomers(search: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () =>
      fetchJSON(`/api/customers?search=${encodeURIComponent(search)}`),
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => fetchJSON(`/api/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => postJSON("/api/customers", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      patchJSON(`/api/customers/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer"] });
    },
  });
}

export function useBlockCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blocked, reason }: { id: string; blocked: boolean; reason: string | null }) =>
      patchJSON(`/api/customers/${id}/block`, { blocked, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: ["customer-analytics"],
    queryFn: () => fetchJSON("/api/customers/analytics"),
    staleTime: 60 * 1000,
  });
}
