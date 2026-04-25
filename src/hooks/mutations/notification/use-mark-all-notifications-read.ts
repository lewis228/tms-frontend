// 전체 read mark — optimistic update. 실패 시 rollback.
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markAllNotificationsRead } from "@/api/notification";
import { QUERY_KEYS } from "@/lib/constants";
import type {
  NotificationEntity,
  PagedResponse,
  UseMutationCallback,
} from "@/types";

type ListCacheEntry = [
  readonly unknown[],
  PagedResponse<NotificationEntity> | undefined,
];

type Ctx = {
  prevLists: ListCacheEntry[];
  prevCount: number | undefined;
};

export function useMarkAllNotificationsRead(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation<number, Error, void, Ctx>({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.notification.all });

      const prevLists = qc.getQueriesData<PagedResponse<NotificationEntity>>({
        queryKey: ["notification", "list"],
      });
      const prevCount = qc.getQueryData<number>(
        QUERY_KEYS.notification.unreadCount,
      );

      const now = new Date().toISOString();
      qc.setQueriesData<PagedResponse<NotificationEntity>>(
        { queryKey: ["notification", "list"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((it) =>
              it.isRead ? it : { ...it, isRead: true, readAt: now },
            ),
          };
        },
      );
      qc.setQueryData<number>(QUERY_KEYS.notification.unreadCount, 0);

      return { prevLists, prevCount };
    },
    onError: (err, _vars, ctx) => {
      if (ctx) {
        ctx.prevLists.forEach(([key, data]) => qc.setQueryData(key, data));
        if (ctx.prevCount !== undefined) {
          qc.setQueryData(QUERY_KEYS.notification.unreadCount, ctx.prevCount);
        }
      }
      callbacks?.onError?.(err);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notification.all });
      callbacks?.onSuccess?.();
    },
  });
}
