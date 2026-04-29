import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateContainerStop,
  type ContainerStopUpdatePayload,
} from "@/api/container-v3";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { stopId: number; payload: ContainerStopUpdatePayload };

export function useUpdateContainerStop(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, payload }: Args) =>
      updateContainerStop(stopId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.stops(data.containerId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.full(data.containerId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
