import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type SettlementUnapprovePayload,
  unapproveSettlement,
} from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: string; payload: SettlementUnapprovePayload };

export function useUnapproveSettlement(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => unapproveSettlement(id, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settlement.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.settlement.byId(vars.id) });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.settlement.auditLogs(vars.id),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
