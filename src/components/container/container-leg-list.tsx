// Container drawer [Legs] 탭 — 컨테이너에 매달린 leg 들 + 추가 버튼.
//
// H-1 단계에선 leg 추가/편집 풀폼은 dispatch 화면을 재사용하지 않고,
// 간단한 "leg 추가" 버튼만 제공해서 leg 1건을 빈 폼으로 생성. 디테일 편집은
// 향후 dispatch board 와 연동.
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import LegStopList from "@/components/container/leg-stop-list";
import { useLegsByDoData } from "@/hooks/queries/use-legs-by-do-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useCreateLeg } from "@/hooks/mutations/leg/use-create-leg";
import { useDeleteLeg } from "@/hooks/mutations/leg/use-delete-leg";
import { generateErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";
import type { ContainerEntity, LegEntity } from "@/types";

export default function ContainerLegList({
  container,
}: {
  container: ContainerEntity;
}) {
  const { t } = useTranslation();
  const { data: legs, isPending, error } = useLegsByDoData(container.deliveryOrderId);
  const { data: driversData } = useDriversData(1);
  const { data: locationsData } = useLocationsData(1);

  const { mutate: createLeg, isPending: isCreateLegPending } = useCreateLeg({
    onSuccess: () =>
      toast.success(t("container.legs.addedToast"), { position: "top-center" }),
    onError: (e) =>
      toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  const { mutate: deleteLeg, isPending: isDeleteLegPending } = useDeleteLeg({
    onSuccess: () =>
      toast.success(t("container.legs.deletedToast"), { position: "top-center" }),
    onError: (e) =>
      toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const containerLegs: LegEntity[] = (legs ?? []).filter(
    (l) => l.containerId === container.id,
  );

  const handleAddLeg = () => {
    createLeg({
      deliveryOrderId: container.deliveryOrderId,
      containerId: container.id,
      step: container.status,
      moveType: "LOADED",
      serviceType: container.serviceType ?? "DROP",
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm(t("container.legs.deleteConfirm"))) return;
    deleteLeg({ id, deliveryOrderId: container.deliveryOrderId });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("container.legs.count", { count: containerLegs.length })}
        </span>
        <Button
          size="sm"
          onClick={handleAddLeg}
          disabled={isCreateLegPending || isDeleteLegPending}
        >
          + {t("container.legs.add")}
        </Button>
      </div>

      {containerLegs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {t("container.legs.empty")}
        </p>
      )}

      {containerLegs.map((leg) => {
        const driverName =
          leg.driverId
            ? (driversData?.items.find((d) => d.id === leg.driverId)?.name ?? "—")
            : "—";
        const pickupName =
          leg.pickupLocationId
            ? (locationsData?.items.find((l) => l.id === leg.pickupLocationId)?.name ?? "—")
            : "—";
        const deliveryName =
          leg.deliveryLocationId
            ? (locationsData?.items.find((l) => l.id === leg.deliveryLocationId)?.name ?? "—")
            : "—";
        return (
          <div key={leg.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">#{leg.id}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {leg.step}
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                  {leg.moveType} / {leg.serviceType}
                </span>
                <span className="rounded border px-1.5 py-0.5 text-xs">
                  {leg.status}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(leg.id)}
                disabled={isCreateLegPending || isDeleteLegPending}
              >
                {t("common.delete")}
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <div>{t("leg.field.driver")}: {driverName}</div>
              <div>{t("leg.field.pickup")}: {pickupName}</div>
              <div>{t("leg.field.delivery")}: {deliveryName}</div>
              <div>
                {t("leg.field.pickupDate")}:{" "}
                {leg.pickupDate ? formatDateTime(leg.pickupDate) : "—"}
              </div>
            </div>
            {leg.remarks && (
              <p className="mt-1 text-xs text-foreground/70">📝 {leg.remarks}</p>
            )}
            <LegStopList legId={leg.id} />
          </div>
        );
      })}
    </div>
  );
}
