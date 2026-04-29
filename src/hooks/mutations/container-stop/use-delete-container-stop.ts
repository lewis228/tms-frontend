import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteContainerStop } from "@/api/container-v3";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Args = { stopId: number; containerId: number };

export function useDeleteContainerStop(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId }: Args) => deleteContainerStop(stopId),
    onSuccess: (_data, { containerId }) => {
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.stops(containerId),
      });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.containerV3.full(containerId),
      });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
