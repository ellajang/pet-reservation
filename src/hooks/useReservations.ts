import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJSON, patchJSON, postJSON } from "@/shared/lib/api";

export function useReservations(month: string) {
  return useQuery({
    queryKey: ["reservations", month],
    queryFn: async () => {
      const data = await fetchJSON<unknown[]>(`/api/reservations?month=${month}`);
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      patchJSON(`/api/reservations/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => postJSON("/api/reservations", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAutoComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => postJSON("/api/reservations/auto-complete", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
