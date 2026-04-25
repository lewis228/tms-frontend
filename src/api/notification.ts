// /api/v1/notifications/* 매핑.
import api from "@/lib/axios";
import type { NotificationEntity, PagedResponse } from "@/types";

export async function listNotifications(params: {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}): Promise<PagedResponse<NotificationEntity>> {
  // FastAPI Query(bool) 가 axios 의 boolean 직렬화 ("true"/"false") 를 파싱 가능하지만,
  // false 일 땐 query string 자체를 생략해 백엔드 default 와 일치시킨다 (명시성 + URL 짧게).
  const queryParams: Record<string, number | string> = {};
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.size !== undefined) queryParams.size = params.size;
  if (params.unreadOnly) queryParams.unreadOnly = "true";
  const { data } = await api.get<PagedResponse<NotificationEntity>>(
    "/notifications",
    { params: queryParams },
  );
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>(
    "/notifications/unread-count",
  );
  return data.count;
}

export async function markNotificationRead(
  id: string,
): Promise<NotificationEntity> {
  const { data } = await api.post<NotificationEntity>(
    `/notifications/${id}/read`,
  );
  return data;
}

export async function markAllNotificationsRead(): Promise<number> {
  const { data } = await api.post<{ updated: number }>(
    "/notifications/read-all",
  );
  return data.updated;
}
