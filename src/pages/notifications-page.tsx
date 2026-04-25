import { useState } from "react";
import { Link } from "react-router-dom";

import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useMarkAllNotificationsRead } from "@/hooks/mutations/notification/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "@/hooks/mutations/notification/use-mark-notification-read";
import { useNotificationsData } from "@/hooks/queries/use-notifications-data";
import { useUnreadNotificationCountData } from "@/hooks/queries/use-unread-notification-count-data";
import { notificationLinkFor } from "@/lib/notification-link";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    data,
    isPending,
    error,
  } = useNotificationsData(page, unreadOnly);
  const { data: unread = 0 } = useUnreadNotificationCountData();

  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll, isPending: isMarkAllPending } =
    useMarkAllNotificationsRead();

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">알림 (Notifications)</h1>
          <p className="text-xs text-muted-foreground">
            서버 inbox. 도메인 이벤트 발생 시 본인 inbox 에 누적됨.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked);
                setPage(1);
              }}
            />
            미확인만
          </label>
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0 || isMarkAllPending}
            onClick={() => markAll()}
          >
            모두 읽음
          </Button>
        </div>
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : data.items.length === 0 ? (
        <div className="rounded-md border bg-background p-12 text-center text-sm text-muted-foreground">
          {unreadOnly ? "미확인 알림이 없습니다." : "알림이 없습니다."}
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y rounded-md border bg-background">
            {data.items.map((n) => {
              const link = notificationLinkFor(n);
              const inner = (
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="size-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <span className="font-medium">{n.title}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {n.eventType}
                    </span>
                  </div>
                  {n.body && (
                    <span className="text-sm text-muted-foreground">
                      {n.body}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("ko-KR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              );

              const className =
                "block px-4 py-3 transition-colors hover:bg-accent/40 " +
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
                    className={"w-full text-left " + className}
                  >
                    {inner}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              전체 {data.total}건 · {data.page}/{Math.max(1, data.pages)} 페이지
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
