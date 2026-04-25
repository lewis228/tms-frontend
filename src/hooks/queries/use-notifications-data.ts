// 인증 사용자 본인 알림 목록 (paged).
import { useQuery } from "@tanstack/react-query";

import { listNotifications } from "@/api/notification";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";

export function useNotificationsData(
  page: number = 1,
  unreadOnly: boolean = false,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: QUERY_KEYS.notification.list({
      page,
      size: PAGE_SIZE,
      unreadOnly,
    }),
    queryFn: () => listNotifications({ page, size: PAGE_SIZE, unreadOnly }),
    enabled: options.enabled ?? true,
  });
}
