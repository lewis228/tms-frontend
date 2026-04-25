import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type SettlementAdjustPayload,
  adjustSettlement,
} from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: string; payload: SettlementAdjustPayload };

export function useAdjustSettlement(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => adjustSettlement(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settlement.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settlement.byId(vars.id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settlement.extras(vars.id) });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.settlement.auditLogs(vars.id),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
