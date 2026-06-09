// D/O Activity timeline — 감사 로그를 최신순 세로 리스트로.
// action 은 deliveryOrder.activity.<action> 으로 i18n (없으면 raw action), summary + 시각 표시.
import { useTranslation } from "react-i18next";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useDeliveryOrderActivityData } from "@/hooks/queries/use-delivery-order-activity-data";
import { formatDateTime } from "@/lib/format";

export default function ActivityTimeline({
  deliveryOrderId,
}: {
  deliveryOrderId: number;
}) {
  const { t } = useTranslation();
  const { data, isPending, error } =
    useDeliveryOrderActivityData(deliveryOrderId);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        {t("deliveryOrder.activity.empty")}
      </p>
    );
  }

  const logs = [...data].sort((a, b) => b.id - a.id);

  return (
    <ol className="flex flex-col gap-3">
      {logs.map((log) => (
        <li key={log.id} className="flex gap-3">
          <div className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground/40" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              {t(`deliveryOrder.activity.${log.action}`, {
                defaultValue: log.action,
              })}
            </span>
            {log.summary && (
              <span className="text-xs text-foreground/70">{log.summary}</span>
            )}
            {log.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDateTime(log.createdAt)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
