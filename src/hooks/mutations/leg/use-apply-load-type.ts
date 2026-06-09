import { useMutation, useQueryClient } from "@tanstack/react-query";

import { applyLoadType } from "@/api/leg";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  containerId: number;
  templateId: number;
  replaceExisting?: boolean;
};

export function useApplyLoadType(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: Vars) => applyLoadType(vars),
    onSuccess: (_data, vars) => {
      // 새 leg 가 생겼으니 container-full 과 leg 목록을 다시 로드.
      qc.resetQueries({
        queryKey: QUERY_KEYS.containerV3.full(vars.containerId),
      });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leg.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
