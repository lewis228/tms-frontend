import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createContainerStop,
  type ContainerStopCreatePayload,
} from "@/api/container-v3";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { containerId: number } & Omit<
  ContainerStopCreatePayload,
  "containerId"
>;

export function useCreateContainerStop(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ containerId, ...payload }: Args) =>
      createContainerStop(containerId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.stops(data.containerId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.full(data.containerId),
      });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.containerV3.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
