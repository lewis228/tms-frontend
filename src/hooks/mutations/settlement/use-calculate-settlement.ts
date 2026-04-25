import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type SettlementCalculatePayload,
  calculateSettlement,
} from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: string; payload: SettlementCalculatePayload };

export function useCalculateSettlement(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => calculateSettlement(id, payload),
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
