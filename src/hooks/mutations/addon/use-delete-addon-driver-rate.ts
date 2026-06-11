import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAddonDriverRate } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeleteAddonDriverRate(
  addonId: number,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (driverId: number) => deleteAddonDriverRate(addonId, driverId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.driverRates(addonId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
