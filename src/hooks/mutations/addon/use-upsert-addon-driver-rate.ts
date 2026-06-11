import { useMutation, useQueryClient } from "@tanstack/react-query";

import { upsertAddonDriverRate } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useUpsertAddonDriverRate(
  addonId: number,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: {
      driverId: number;
      amount?: string | null;
      percent?: string | null;
      note?: string | null;
    }) =>
      upsertAddonDriverRate(addonId, vars.driverId, {
        amount: vars.amount,
        percent: vars.percent,
        note: vars.note,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.driverRates(addonId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
