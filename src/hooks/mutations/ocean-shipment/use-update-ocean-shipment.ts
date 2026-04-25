import { updateOceanShipment } from "@/api/ocean-shipment";
import { QUERY_KEYS } from "@/lib/constants";
import type { OceanShipmentEntity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Surfaces the refreshed shipment so the detail page can stitch updated
// tags/customer into its view without a round-trip refetch. Same pattern as
// useCreateOceanShipment's typed onSuccess.
type Callbacks = {
  onSuccess?: (updated: OceanShipmentEntity) => void;
  onError?: (error: Error) => void;
};

export function useUpdateOceanShipment(callbacks?: Callbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOceanShipment,
    onSuccess: (updated) => {
      // Patch the single-row detail cache directly so the UI reflects the
      // change before the invalidation round-trip finishes.
      queryClient.setQueryData<OceanShipmentEntity>(
        QUERY_KEYS.oceanShipment.byId(updated.id),
        (prev) => (prev ? { ...prev, ...updated } : updated),
      );
      // Lists may change columns (tag chips, customer) on any row — blow
      // the whole list namespace.
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oceanShipment.all,
      });
      if (callbacks?.onSuccess) callbacks.onSuccess(updated);
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
