// 본인 미확인 알림 개수 — Bell 뱃지용.
import { useQuery } from "@tanstack/react-query";

import { fetchUnreadCount } from "@/api/notification";
import { QUERY_KEYS } from "@/lib/constants";

export function useUnreadNotificationCountData() {
  return useQuery({
    queryKey: QUERY_KEYS.notification.unreadCount,
    queryFn: () => fetchUnreadCount(),
  });
}
