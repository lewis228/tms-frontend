import { createOceanShipment } from "@/api/ocean-shipment";
import { QUERY_KEYS } from "@/lib/constants";
import type { OceanShipmentEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Mutation carries the newly created shipment forward — the Track page uses
// it to navigate directly into the detail view. Since the generic
// UseMutationCallback's onSuccess is parameterless, we define a tighter
// local type (same pattern as api-key creation).
type Callbacks = {
  onSuccess?: (created: OceanShipmentEntity) => void;
  onError?: (error: Error) => void;
};

export function useCreateOceanShipment(callbacks?: Callbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOceanShipment,
    onSuccess: (created) => {
      // Any cached list view is now stale — blow them all away so the new
      // row appears wherever it belongs (filters on the other tab will
      // re-materialise on next visit).
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oceanShipment.all,
      });
      if (callbacks?.onSuccess) callbacks.onSuccess(created);
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}

// Re-export the generic callback shape so callers that don't need the
// response payload can keep their import surface minimal.
export type { UseMutationCallback };
