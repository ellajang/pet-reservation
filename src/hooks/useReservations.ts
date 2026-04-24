import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationAPI } from "@/services/reservationAPI";

export function useReservations(month: string) {
  return useQuery({
    queryKey: ["reservations", month],
    queryFn: () => reservationAPI.getByMonth(month),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reservationAPI.updateStatus(id, status),
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
    mutationFn: (body: unknown) => reservationAPI.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAutoComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reservationAPI.autoComplete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
