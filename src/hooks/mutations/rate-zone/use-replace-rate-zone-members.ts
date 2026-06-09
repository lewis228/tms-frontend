import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  replaceRateZoneMembers,
  type RateZoneMemberInput,
} from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  members: RateZoneMemberInput[];
};

export function useReplaceRateZoneMembers(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, members }: Vars) => replaceRateZoneMembers(id, members),
    onSuccess: (_data, { id }) => {
      qc.resetQueries({ queryKey: QUERY_KEYS.rateZone.members(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateZone.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
