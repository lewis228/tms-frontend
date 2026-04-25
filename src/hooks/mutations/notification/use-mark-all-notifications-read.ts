import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markAllNotificationsRead } from "@/api/notification";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useMarkAllNotificationsRead(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notification.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
