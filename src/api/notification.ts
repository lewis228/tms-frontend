// /api/v1/notifications/* 매핑.
import api from "@/lib/axios";
import type { NotificationEntity, PagedResponse } from "@/types";

export async function listNotifications(params: {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
}): Promise<PagedResponse<NotificationEntity>> {
  const { data } = await api.get<PagedResponse<NotificationEntity>>(
    "/notifications",
    { params },
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
