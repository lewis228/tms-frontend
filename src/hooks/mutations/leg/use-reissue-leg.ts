import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reissueLeg } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

// containerId 는 캐시 무효화용 — 새 leg 가 container-full 에 반영되도록.
type Vars = { id: number; containerId: number; reason?: string };

export function useReissueLeg(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: Vars) => reissueLeg(id, { reason }),
    onSuccess: (_data, vars) => {
      qc.resetQueries({
        queryKey: QUERY_KEYS.containerV3.full(vars.containerId),
      });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
