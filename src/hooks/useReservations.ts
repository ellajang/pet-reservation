import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationAPI } from "@/services/reservationAPI";
import { queryKeys } from "@/queries/queryKeys";

export function useReservations(month: string) {
  return useQuery({
    queryKey: queryKeys.reservations.byMonth(month),
    queryFn: () => reservationAPI.getByMonth(month),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      reservationAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useAutoComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reservationAPI.autoComplete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
