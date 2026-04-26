import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useMarkAllNotificationsRead } from "@/hooks/mutations/notification/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "@/hooks/mutations/notification/use-mark-notification-read";
import { useNotificationsData } from "@/hooks/queries/use-notifications-data";
import { useUnreadNotificationCountData } from "@/hooks/queries/use-unread-notification-count-data";
import { notificationLinkFor } from "@/lib/notification-link";

import { formatDateTime } from "@/lib/format";
export default function NotificationsPage() {
  const { t } = useTranslation();
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
          <h1 className="text-2xl font-semibold">
            {t("notification.pageTitle")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("notification.subtitle")}
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
            {t("notification.unreadOnly")}
          </label>
          <Button
            variant="outline"
            size="sm"
            disabled={unread === 0 || isMarkAllPending}
            onClick={() => markAll()}
          >
            {t("notification.markAllRead")}
          </Button>
        </div>
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : data.items.length === 0 ? (
        <div className="rounded-md border bg-background p-12 text-center text-sm text-muted-foreground">
          {unreadOnly
            ? t("notification.unreadEmpty")
            : t("notification.empty")}
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
                    {formatDateTime(n.createdAt)}
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
              {t("common.totalCount", { count: data.total })} ·{" "}
              {t("common.pageOf", {
                page: data.page,
                pages: Math.max(1, data.pages),
              })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("common.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
