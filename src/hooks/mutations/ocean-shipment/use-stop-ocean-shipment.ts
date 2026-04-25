import { stopOceanShipment } from "@/api/ocean-shipment";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useStopOceanShipment(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopOceanShipment,
    onSuccess: (result) => {
      // Status transitions to "stopped" on the server. Refresh both the
      // relevant detail cache and any list views so the new state lights up
      // in the table tabs.
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oceanShipment.byId(result.id),
      });
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
