// 컨테이너 sub-table — D/O Detail 안에서 컨테이너 N개를 한 줄씩 표시.
// row 클릭 시 onOpenContainer 콜백 → URL ?container={id} → ContainerDrawer 열림.
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useLegsByDoData } from "@/hooks/queries/use-legs-by-do-data";
import { formatDate } from "@/lib/format";
import type { ContainerEntity, LegEntity } from "@/types";

export default function ContainerSubTable({
  containers,
  onOpenContainer,
}: {
  containers: ContainerEntity[];
  onOpenContainer: (containerId: number) => void;
}) {
  const { t } = useTranslation();
  const { data: locationsData } = useLocationsData(1);

  // 첫 컨테이너의 D/O 로 leg 카운트 일괄 fetch
  const deliveryOrderId = containers[0]?.deliveryOrderId;
  const { data: legs } = useLegsByDoData(deliveryOrderId ?? null);

  if (containers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("container.empty")}</p>
    );
  }

  const legsByContainer = new Map<number, LegEntity[]>();
  for (const leg of legs ?? []) {
    if (leg.containerId == null) continue;
    const arr = legsByContainer.get(leg.containerId) ?? [];
    arr.push(leg);
    legsByContainer.set(leg.containerId, arr);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-medium">#</th>
            <th className="px-2 py-1.5 text-left font-medium">
              {t("container.field.containerNumber")}
            </th>
            <th className="px-2 py-1.5 text-left font-medium">
              {t("container.field.size")}
            </th>
            <th className="px-2 py-1.5 text-left font-medium">
              {t("container.field.sealNo")}
            </th>
            <th className="px-2 py-1.5 text-left font-medium">
              {t("container.field.deliveryLocation")}
            </th>
            <th className="px-2 py-1.5 text-left font-medium">
              {t("container.field.demurrageLfd")}
            </th>
            <th className="px-2 py-1.5 text-right font-medium">
              {t("container.field.legCount")}
            </th>
            <th className="px-2 py-1.5"></th>
          </tr>
        </thead>
        <tbody>
          {containers.map((c) => {
            const deliveryLoc = c.deliveryLocationId
              ? (locationsData?.items.find(
                  (l) => l.id === c.deliveryLocationId,
                )?.name ?? "—")
              : "—";
            const legCount = legsByContainer.get(c.id)?.length ?? 0;
            const dispatched = legCount === 0 && c.status !== "PLANNING";

            return (
              <tr
                key={c.id}
                onClick={() => onOpenContainer(c.id)}
                className="cursor-pointer border-b hover:bg-accent"
              >
                <td className="px-2 py-2 text-muted-foreground">{c.sequenceNo}</td>
                <td className="px-2 py-2 font-mono">
                  {c.containerNumber || "—"}
                </td>
                <td className="px-2 py-2">{c.size || "—"}</td>
                <td className="px-2 py-2 font-mono text-xs">
                  {c.sealNo || "—"}
                </td>
                <td className="px-2 py-2">{deliveryLoc}</td>
                <td className="px-2 py-2">
                  {c.demurrageLfd ? formatDate(c.demurrageLfd, c.demurrageLfd) : "—"}
                </td>
                <td className="px-2 py-2 text-right">
                  {legCount}
                  {dispatched && (
                    <span className="ml-1 text-amber-600" title={t("container.unassignedWarning")}>
                      ⚠
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right text-muted-foreground">
                  <ChevronRight className="ml-auto h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
