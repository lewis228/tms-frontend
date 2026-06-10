// Load Type 템플릿 = 레그 폼 프리필. 템플릿 선택 → 레그 N행이 타입 채워진 채 뜨고,
// 사용자가 from/to 포인트를 지정한 뒤 한 번에 저장(/legs/bulk/create). 저장 전엔 DB 미반영.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchLoadTypeTemplate } from "@/api/load-type-template";
import { useLoadTypeTemplatesData } from "@/hooks/queries/use-load-type-templates-data";
import { useCreateLegsBulk } from "@/hooks/mutations/leg/use-create-legs-bulk";
import { generateErrorMessage } from "@/lib/error";
import type {
  ContainerStopEntity,
  LegMoveCode,
  MoveType,
  ServiceType,
  TemplateMoveType,
  TemplateServiceType,
} from "@/types";

const MOVE_TYPES: MoveType[] = ["LOADED", "EMPTY", "BOBTAIL"];
const SERVICE_TYPES: ServiceType[] = ["LIVE", "DROP"];

const MOVE_MAP: Record<TemplateMoveType, MoveType> = {
  LOAD: "LOADED",
  EMPTY: "EMPTY",
  NONE: "BOBTAIL",
};
const SVC_MAP: Record<TemplateServiceType, ServiceType> = {
  LIVE: "LIVE",
  DROP: "DROP",
  NONE: "DROP",
};

type Row = {
  moveType: MoveType;
  serviceType: ServiceType;
  moveCode: LegMoveCode | null;
  fromPointId: number | null;
  toPointId: number | null;
};

export default function ApplyLoadTypeButton({
  containerId,
  deliveryOrderId,
  stops,
}: {
  containerId: number;
  deliveryOrderId: number;
  stops: ContainerStopEntity[];
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingTpl, setLoadingTpl] = useState(false);

  const { data: templates } = useLoadTypeTemplatesData({ size: 100 });

  const { mutate: saveBulk, isPending: isSaving } = useCreateLegsBulk({
    onSuccess: () => {
      toast.success(t("loadType.toast.applied"), { position: "top-center" });
      setOpen(false);
      setTemplateId("");
      setRows([]);
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handlePickTemplate = async (id: string) => {
    setTemplateId(id);
    setRows([]);
    if (!id) return;
    setLoadingTpl(true);
    try {
      const detail = await fetchLoadTypeTemplate(Number(id));
      setRows(
        [...detail.steps]
          .sort((a, b) => a.seq - b.seq)
          .map((s) => ({
            moveType: MOVE_MAP[s.moveType],
            serviceType: SVC_MAP[s.serviceType],
            moveCode: s.moveCode,
            fromPointId: null,
            toPointId: null,
          })),
      );
    } catch (err) {
      toast.error(generateErrorMessage(err as Error), { position: "top-center" });
    } finally {
      setLoadingTpl(false);
    }
  };

  const patchRow = (idx: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const handleSave = () => {
    if (rows.length === 0) return;
    saveBulk(
      rows.map((r) => ({
        deliveryOrderId,
        containerId,
        step: "DISPATCHED" as const,
        moveType: r.moveType,
        serviceType: r.serviceType,
        moveCode: r.moveCode,
        fromPointId: r.fromPointId,
        toPointId: r.toPointId,
      })),
    );
  };

  const pointLabel = (s: ContainerStopEntity) =>
    `#${s.sequenceNo} · ${s.pointType} · ${s.pointName ?? s.locationName ?? "—"}`;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        {t("loadType.applyButton")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sans">
              {t("loadType.dialogTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs">
              <span className="text-muted-foreground">
                {t("loadType.field.template")}
              </span>
              <select
                value={templateId}
                onChange={(e) => handlePickTemplate(e.target.value)}
                disabled={isSaving || loadingTpl}
                className="bg-background w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">{t("loadType.field.selectTemplate")}</option>
                {(templates?.items ?? []).map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.code} · {tpl.name} ({tpl.direction})
                  </option>
                ))}
              </select>
            </label>

            {rows.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">
                  {t("loadType.prefillHint")}
                </span>
                {rows.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap items-end gap-2 rounded-md border p-2"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <select
                      value={r.moveType}
                      onChange={(e) =>
                        patchRow(idx, { moveType: e.target.value as MoveType })
                      }
                      disabled={isSaving}
                      className="h-9 rounded-md border bg-background px-2 text-xs"
                    >
                      {MOVE_TYPES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={r.serviceType}
                      onChange={(e) =>
                        patchRow(idx, {
                          serviceType: e.target.value as ServiceType,
                        })
                      }
                      disabled={isSaving}
                      className="h-9 rounded-md border bg-background px-2 text-xs"
                    >
                      {SERVICE_TYPES.map((sv) => (
                        <option key={sv} value={sv}>{sv}</option>
                      ))}
                    </select>
                    {r.moveCode && (
                      <span className="rounded bg-muted px-1.5 py-1 font-mono text-[10px]">
                        {r.moveCode}
                      </span>
                    )}
                    <select
                      value={r.fromPointId ?? ""}
                      onChange={(e) =>
                        patchRow(idx, {
                          fromPointId: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      disabled={isSaving || !stops.length}
                      className="h-9 flex-1 rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="">{t("leg.field.fromPoint")}</option>
                      {stops.map((s) => (
                        <option key={s.id} value={s.id}>{pointLabel(s)}</option>
                      ))}
                    </select>
                    <select
                      value={r.toPointId ?? ""}
                      onChange={(e) =>
                        patchRow(idx, {
                          toPointId: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      disabled={isSaving || !stops.length}
                      className="h-9 flex-1 rounded-md border bg-background px-2 text-xs"
                    >
                      <option value="">{t("leg.field.toPoint")}</option>
                      {stops.map((s) => (
                        <option key={s.id} value={s.id}>{pointLabel(s)}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                disabled={isSaving || loadingTpl || rows.length === 0}
                onClick={handleSave}
              >
                {t("loadType.saveLegs", { count: rows.length })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
