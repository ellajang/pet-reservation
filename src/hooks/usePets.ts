import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petAPI } from "@/services/petAPI";
import { queryKeys } from "@/queries/queryKeys";

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => petAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}
