// 헤더 우측 Bell — 미확인 카운트 + 클릭 시 popover 로 최근 알림.
//
// 서버 inbox 사용 (api/v1/notifications). WS event 가 도착하면 캐시 invalidate.
// 성능 최적화: list 쿼리는 popover 가 열렸을 때만 fetch (lazy). 미확인 카운트만 상시 폴.
import { useState } from "react";
import { Link } from "react-router-dom";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMarkAllNotificationsRead } from "@/hooks/mutations/notification/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "@/hooks/mutations/notification/use-mark-notification-read";
import { useNotificationsData } from "@/hooks/queries/use-notifications-data";
import { useUnreadNotificationCountData } from "@/hooks/queries/use-unread-notification-count-data";
import { notificationLinkFor } from "@/lib/notification-link";

import { formatDateTime } from "@/lib/format";
const PREVIEW_LIMIT = 8;

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { data: page, isPending: isListPending } = useNotificationsData(
    1,
    false,
    { enabled: open },
  );
  const { data: unread = 0 } = useUnreadNotificationCountData();

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkAllPending } =
    useMarkAllNotificationsRead();

  const preview = (page?.items ?? []).slice(0, PREVIEW_LIMIT);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative rounded-md px-2 py-1 text-sm hover:bg-accent"
          title={unread > 0 ? `${unread} 건 미확인` : "알림"}
        >
          <span aria-hidden>🔔</span>
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">알림</span>
          <Button
            variant="ghost"
            size="sm"
            disabled={unread === 0 || isMarkAllPending}
            onClick={() => markAll()}
            className="h-auto px-2 py-1 text-xs"
          >
            모두 읽음
          </Button>
        </div>

        {open && isListPending ? (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        ) : preview.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            새 알림이 없습니다.
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {preview.map((n) => {
              const link = notificationLinkFor(n);
              const inner = (
                <div className="flex w-full flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <span className="truncate text-sm">{n.title}</span>
                  </div>
                  {n.body && (
                    <span className="truncate text-xs text-muted-foreground">
                      {n.body}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              );

              const className =
                "block w-full px-3 py-2 text-left transition-colors hover:bg-accent/50 " +
                (n.isRead ? "" : "bg-blue-50/40");

              if (link) {
                return (
                  <li key={n.id}>
                    <Link
                      to={link}
                      onClick={() => !n.isRead && markRead(n.id)}
                      className={className}
                    >
                      {inner}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={className}
                  >
                    {inner}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t px-3 py-2 text-right">
          <Link
            to="/app/notifications"
            className="text-xs text-primary hover:underline"
          >
            전체 보기 →
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
