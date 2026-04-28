// leg 카드 안의 stop sub-list. 다중 stop 표현 + Add Stop 버튼.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLegStopsByLegData } from "@/hooks/queries/use-leg-stops-by-leg-data";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useCreateLegStop } from "@/hooks/mutations/leg-stop/use-create-leg-stop";
import { useDeleteLegStop } from "@/hooks/mutations/leg-stop/use-delete-leg-stop";
import { generateErrorMessage } from "@/lib/error";
import type { StopKind } from "@/types";

const STOP_KINDS: StopKind[] = [
  "PICKUP_FULL", "DROP_FULL", "PICKUP_EMPTY", "DROP_EMPTY",
  "CHASSIS_GET", "CHASSIS_RETURN", "WAIT", "FUEL", "SCALE", "OTHER",
];

export default function LegStopList({ legId }: { legId: number }) {
  const { t } = useTranslation();
  const { data: stops, isPending } = useLegStopsByLegData(legId);
  const { data: locationsData } = useLocationsData(1);
  const [adding, setAdding] = useState(false);
  const [stopKind, setStopKind] = useState<StopKind>("PICKUP_FULL");
  const [locationId, setLocationId] = useState<number | null>(null);

  const { mutate: createStop, isPending: isCreatePending } = useCreateLegStop({
    onSuccess: () => {
      setAdding(false);
      setLocationId(null);
      toast.success(t("legStop.addedToast"), { position: "top-center" });
    },
    onError: (e) =>
      toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: deleteStop, isPending: isDeletePending } = useDeleteLegStop(
    legId,
    {
      onSuccess: () => toast.success(t("legStop.deletedToast"), { position: "top-center" }),
      onError: (e) =>
        toast.error(generateErrorMessage(e), { position: "top-center" }),
    },
  );

  return (
    <div className="mt-3 rounded border bg-muted/20 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("legStop.stopsLabel", { count: stops?.length ?? 0 })}
        </span>
        {!adding && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            disabled={isPending}
          >
            + {t("legStop.add")}
          </Button>
        )}
      </div>

      {(stops ?? []).length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">{t("legStop.empty")}</p>
      )}

      {(stops ?? []).map((s) => {
        const locName = s.locationId
          ? (locationsData?.items.find((l) => l.id === s.locationId)?.name ?? `loc#${s.locationId}`)
          : "—";
        return (
          <div
            key={s.id}
            className="flex items-center justify-between gap-2 border-b py-1 text-xs last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">#{s.sequenceNo}</span>
              <span className="rounded bg-background px-1.5 py-0.5">{s.stopKind}</span>
              <span>{locName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeletePending}
              onClick={() => {
                if (window.confirm(t("legStop.deleteConfirm"))) deleteStop(s.id);
              }}
            >
              ×
            </Button>
          </div>
        );
      })}

      {adding && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select
            value={stopKind}
            onChange={(e) => setStopKind(e.target.value as StopKind)}
            disabled={isCreatePending}
            className="h-8 rounded-md border bg-background px-2 text-xs"
          >
            {STOP_KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select
            value={locationId ?? ""}
            onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : null)}
            disabled={isCreatePending}
            className="h-8 rounded-md border bg-background px-2 text-xs"
          >
            <option value="">— {t("legStop.locationOptional")} —</option>
            {(locationsData?.items ?? []).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <div className="col-span-2 flex justify-end gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdding(false)}
              disabled={isCreatePending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={() =>
                createStop({
                  legId,
                  stopKind,
                  locationId,
                })
              }
              disabled={isCreatePending}
            >
              {t("common.add")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
