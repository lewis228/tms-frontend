// 컨테이너 상세에서 Stop 추가. 가장 빈번하게 쓸 인라인 액션.
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
import { useCreateContainerStop } from "@/hooks/mutations/container-stop/use-create-container-stop";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { generateErrorMessage } from "@/lib/error";
import type { StopRole } from "@/types";

const ROLES: StopRole[] = ["ORIGIN", "DELIVERY", "TRANSIT", "TERMINUS"];

export default function AddStopButton({ containerId }: { containerId: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<StopRole>("DELIVERY");
  const [locationId, setLocationId] = useState<string>("");
  const [plannedArrival, setPlannedArrival] = useState<string>("");

  const { data: locations } = useLocationsData(1);

  const { mutate: createStop, isPending } = useCreateContainerStop({
    onSuccess: () => {
      toast.success(t("container.stops.added"), { position: "top-center" });
      setOpen(false);
      setLocationId("");
      setPlannedArrival("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        + Add Stop
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Add Stop</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StopRole)}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Location</span>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                disabled={isPending}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">— select —</option>
                {(locations?.items ?? []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="col-span-2 flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Planned Arrival</span>
              <Input
                type="datetime-local"
                value={plannedArrival}
                onChange={(e) => setPlannedArrival(e.target.value)}
                disabled={isPending}
              />
            </label>
            <div className="col-span-2 flex justify-end">
              <Button
                disabled={isPending}
                onClick={() =>
                  createStop({
                    containerId,
                    role,
                    locationId: locationId ? Number(locationId) : null,
                    plannedArrival: plannedArrival
                      ? new Date(plannedArrival).toISOString()
                      : null,
                  })
                }
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
