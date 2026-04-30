import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petAPI } from "@/services/petAPI";

export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => petAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
