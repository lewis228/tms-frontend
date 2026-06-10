// 컨테이너 상세에서 Point 추가. 가장 빈번하게 쓸 인라인 액션.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PointPicker from "@/components/point-picker";
import { EMPTY_POINT, type PointValue } from "@/lib/point";
import { useCreateContainerStop } from "@/hooks/mutations/container-stop/use-create-container-stop";
import { generateErrorMessage } from "@/lib/error";

export default function AddStopButton({ containerId }: { containerId: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<PointValue>(EMPTY_POINT);
  const [plannedArrival, setPlannedArrival] = useState<string>("");

  const { mutate: createStop, isPending } = useCreateContainerStop({
    onSuccess: () => {
      toast.success(t("container.stops.added"), { position: "top-center" });
      setOpen(false);
      setPoint(EMPTY_POINT);
      setPlannedArrival("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const pointReady =
    (point.pointType === "TERMINAL" && point.terminalId != null) ||
    (point.pointType === "YARD" && point.locationId != null) ||
    (point.pointType === "CUSTOMER" && point.customerId != null);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + {t("point.add")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">{t("point.add")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">{t("point.label")}</span>
              <PointPicker value={point} onChange={setPoint} disabled={isPending} />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t("point.plannedArrival")}
              </span>
              <Input
                type="datetime-local"
                value={plannedArrival}
                onChange={(e) => setPlannedArrival(e.target.value)}
                disabled={isPending}
              />
            </label>
            <div className="flex justify-end">
              <Button
                disabled={isPending || !pointReady}
                onClick={() =>
                  createStop({
                    containerId,
                    pointType: point.pointType!,
                    terminalId: point.terminalId,
                    locationId: point.locationId,
                    customerId: point.customerId,
                    plannedArrival: plannedArrival
                      ? new Date(plannedArrival).toISOString()
                      : null,
                  })
                }
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
