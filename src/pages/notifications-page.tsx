import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  useClearNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/store/notifications";

export default function NotificationsPage() {
  const items = useNotifications();
  const unread = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const clear = useClearNotifications();

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">알림 (Notifications)</h1>
          <p className="text-xs text-muted-foreground">
            실시간 이벤트 누적. 새로고침 시 초기화 (백엔드 inbox 추후 도입).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0}
            onClick={() => markAllRead()}
          >
            모두 읽음
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={items.length === 0}
            onClick={() => clear()}
            className="text-destructive"
          >
            전체 삭제
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border bg-background p-12 text-center text-sm text-muted-foreground">
          새 알림이 없습니다.
        </div>
      ) : (
        <ul className="flex flex-col divide-y rounded-md border bg-background">
          {items.map((n) => {
            const inner = (
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                  <span className="font-medium">{n.title}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {n.type}
                  </span>
                </div>
                {n.description && (
                  <span className="text-sm text-muted-foreground">
                    {n.description}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(n.occurredAt).toLocaleString("ko-KR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            );

            const className =
              "block px-4 py-3 transition-colors hover:bg-accent/40 " +
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
                  className={"w-full text-left " + className}
                >
                  {inner}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
