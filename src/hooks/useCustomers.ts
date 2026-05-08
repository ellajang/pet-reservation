import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerAPI } from "@/services/customerAPI";
import { queryKeys } from "@/queries/queryKeys";

export function useCustomers(search: string) {
  return useQuery({
    queryKey: queryKeys.customers.list(search),
    queryFn: () => customerAPI.getAll(search),
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customerAPI.getDetail(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => customerAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      customerAPI.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useBlockCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, blocked, reason }: { id: string; blocked: boolean; reason: string | null }) =>
      customerAPI.block(id, blocked, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

export function useCustomerAnalytics() {
  return useQuery({
    queryKey: queryKeys.customers.analytics(),
    queryFn: () => customerAPI.analytics(),
    staleTime: 60 * 1000,
  });
}
