// 헤더 우측 Bell — 미확인 카운트 + 클릭 시 popover 로 최근 알림.
//
// store/notifications 가 WebSocketProvider 로부터 push 받음.
// 백엔드 알림 inbox 도메인 추후 도입 시 이 위젯이 fetch 로 전환.
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/store/notifications";

const PREVIEW_LIMIT = 8;

export default function NotificationsBell() {
  const items = useNotifications();
  const unread = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const preview = items.slice(0, PREVIEW_LIMIT);

  return (
    <Popover>
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
            disabled={unread === 0}
            onClick={() => markAllRead()}
            className="h-auto px-2 py-1 text-xs"
          >
            모두 읽음
          </Button>
        </div>

        {preview.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            새 알림이 없습니다.
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto py-1">
            {preview.map((n) => {
              const inner = (
                <div className="flex w-full flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <span className="truncate text-sm">{n.title}</span>
                  </div>
                  {n.description && (
                    <span className="truncate text-xs text-muted-foreground">
                      {n.description}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.occurredAt).toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              );

              const className =
                "block w-full px-3 py-2 text-left transition-colors hover:bg-accent/50 " +
                (n.read ? "" : "bg-blue-50/40");

              if (n.link) {
                return (
                  <li key={n.id}>
                    <Link
                      to={n.link}
                      onClick={() => markRead(n.id)}
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
                    onClick={() => markRead(n.id)}
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
