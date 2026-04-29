// Distance Matrix — location pair 거리/시간 캐시. measure 버튼으로 OSRM/Google/Manual 측정.
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useDistanceMatrixData } from "@/hooks/queries/use-distance-matrix-data";
import { useMeasureDistance } from "@/hooks/mutations/distance-matrix/use-measure-distance";
import { generateErrorMessage } from "@/lib/error";

export default function DistanceMatrixList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isPending, error } = useDistanceMatrixData(page, 50);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");

  const { mutate: measure, isPending: isMeasurePending } = useMeasureDistance({
    onSuccess: () => {
      toast.success("측정 완료", { position: "top-center" });
      setOpen(false);
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Button onClick={() => setOpen(true)}>+ Measure pair</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead className="text-right">Duration (min)</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Measured At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.originLocationId}</TableCell>
                  <TableCell className="font-mono">{d.destinationLocationId}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{d.distanceValue}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{d.durationMin}</TableCell>
                  <TableCell className="font-mono text-xs">{d.source}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {d.measuredAt ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("common.totalCount", { count: data.total })}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Measure pair</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Origin Location ID</span>
              <Input
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                disabled={isMeasurePending}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">Destination Location ID</span>
              <Input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                disabled={isMeasurePending}
              />
            </label>
            <div className="col-span-2 flex justify-end">
              <Button
                disabled={
                  isMeasurePending || origin.trim() === "" || dest.trim() === ""
                }
                onClick={() =>
                  measure({
                    originLocationId: Number(origin),
                    destinationLocationId: Number(dest),
                  })
                }
              >
                Measure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
