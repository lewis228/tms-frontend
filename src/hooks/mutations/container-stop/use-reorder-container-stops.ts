import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  reorderContainerStops,
  type ContainerStopReorderItem,
} from "@/api/container-v3";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { containerId: number; items: ContainerStopReorderItem[] };

export function useReorderContainerStops(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ containerId, items }: Args) =>
      reorderContainerStops(containerId, items),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.stops(vars.containerId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.full(vars.containerId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
