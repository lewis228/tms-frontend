// 단건 read mark — optimistic update 로 즉시 UI 반영. 실패 시 rollback.
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markNotificationRead } from "@/api/notification";
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

export function useMarkNotificationRead(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation<NotificationEntity, Error, string, Ctx>({
    mutationFn: (id) => markNotificationRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.notification.all });

      const prevLists = qc.getQueriesData<PagedResponse<NotificationEntity>>({
        queryKey: ["notification", "list"],
      });
      const prevCount = qc.getQueryData<number>(
        QUERY_KEYS.notification.unreadCount,
      );

      // list 캐시 — 해당 id 의 isRead=true 로 변경
      qc.setQueriesData<PagedResponse<NotificationEntity>>(
        { queryKey: ["notification", "list"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((it) =>
              it.id === id
                ? { ...it, isRead: true, readAt: new Date().toISOString() }
                : it,
            ),
          };
        },
      );

      // unread count — 1 감소 (음수 방지)
      qc.setQueryData<number>(
        QUERY_KEYS.notification.unreadCount,
        (old) => (typeof old === "number" ? Math.max(0, old - 1) : old),
      );

      return { prevLists, prevCount };
    },
    onError: (err, _id, ctx) => {
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
