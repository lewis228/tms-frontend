import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addContainerEvent,
  type ContainerEventCreatePayload,
} from "@/api/container";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useAddContainerEvent(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      containerId,
      payload,
    }: {
      containerId: number;
      payload: ContainerEventCreatePayload;
    }) => addContainerEvent(containerId, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.container.events(data.containerId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
