import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type RateSettingUpdatePayload,
  updateRateSetting,
} from "@/api/rate-setting";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: number; payload: RateSettingUpdatePayload };

export function useUpdateRateSetting(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateRateSetting(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateSetting.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
