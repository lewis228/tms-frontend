import { resubmitOceanShipment } from "@/api/ocean-shipment";
import { QUERY_KEYS } from "@/lib/constants";
import type { OceanShipmentEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useResubmitOceanShipment(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resubmitOceanShipment,
    onSuccess: (updated) => {
      // Server flipped status back to "pending" and re-dispatched the scrape
      // task. The WebSocket will push scraping events shortly — update the
      // byId cache immediately so the UI reflects the transition without a
      // refetch round-trip.
      queryClient.setQueryData<OceanShipmentEntity>(
        QUERY_KEYS.oceanShipment.byId(updated.id),
        (prev) => (prev ? { ...prev, ...updated } : updated),
      );
      // Any list view needs to know the status changed — invalidate list
      // queries so they pick up the transition on next focus.
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oceanShipment.all,
      });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
