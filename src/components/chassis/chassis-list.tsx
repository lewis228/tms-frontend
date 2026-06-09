// Chassis 마스터 — 표 + create/edit 모달.
import { useMemo, useState } from "react";
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
import { useChassisData } from "@/hooks/queries/use-chassis-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useEquipmentPoolsData } from "@/hooks/queries/use-equipment-pools-data";
import { useCreateChassis } from "@/hooks/mutations/chassis/use-create-chassis";
import { useUpdateChassis } from "@/hooks/mutations/chassis/use-update-chassis";
import { useDeleteChassis } from "@/hooks/mutations/chassis/use-delete-chassis";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type {
  ChassisEntity,
  ChassisOwnerKind,
  ChassisSize,
  ChassisStatus,
} from "@/types";

const OWNERS: ChassisOwnerKind[] = [
  "COMPANY", "DRIVER", "TERMINAL_POOL", "THIRD_PARTY_POOL",
];
const SIZES: ChassisSize[] = ["20", "40", "45", "COMBO"];
const STATUSES: ChassisStatus[] = ["AVAILABLE", "IN_USE", "AT_POOL", "MAINTENANCE"];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: ChassisEntity };

export default function ChassisList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const openAlert = useOpenAlertModal();

  const { data, isPending, error } = useChassisData(page, 50);
  const { data: driversData } = useDriversData(1);
  const { data: poolsData } = useEquipmentPoolsData(1, 50);

  const driverNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of driversData?.items ?? []) m.set(d.id, d.name);
    return m;
  }, [driversData]);
  const poolNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of poolsData?.items ?? []) m.set(p.id, p.name);
    return m;
  }, [poolsData]);

  const { mutate: deleteChassis } = useDeleteChassis({
    onSuccess: () => toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("chassis.totalCount", { count: data.total ?? data.items.length })}
        </p>
        <Button onClick={() => setEditor({ mode: "CREATE" })}>
          + {t("chassis.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("chassis.field.chassisNumber")}</TableHead>
              <TableHead>{t("chassis.field.size")}</TableHead>
              <TableHead>{t("chassis.field.ownerKind")}</TableHead>
              <TableHead>{t("chassis.field.owner")}</TableHead>
              <TableHead>{t("chassis.field.status")}</TableHead>
              <TableHead className="w-32 text-right" />
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
              data.items.map((c) => {
                let ownerLabel = "—";
                if (c.ownerDriverId) ownerLabel = driverNameById.get(c.ownerDriverId) ?? `drv#${c.ownerDriverId}`;
                else if (c.ownerPoolId) ownerLabel = poolNameById.get(c.ownerPoolId) ?? `pool#${c.ownerPoolId}`;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.chassisNumber}</TableCell>
                    <TableCell className="text-xs">{c.size ?? "—"}</TableCell>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {c.ownerKind}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{ownerLabel}</TableCell>
                    <TableCell className="text-xs">{c.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditor({ mode: "EDIT", row: c })}>
                        {t("common.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openAlert({
                            title: t("chassis.deletePromptTitle", { number: c.chassisNumber }),
                            description: t("chassis.deletePromptDesc"),
                            onPositive: () => deleteChassis(c.id),
                          })
                        }
                      >
                        {t("common.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {data.pages > 1 && (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
          <span className="px-2 py-1 text-xs text-muted-foreground">{page} / {data.pages}</span>
          <Button size="sm" variant="outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>›</Button>
        </div>
      )}

      <ChassisEditor editor={editor} onClose={() => setEditor({ mode: "CLOSED" })} />
    </div>
  );
}

function ChassisEditor({
  editor,
  onClose,
}: {
  editor: EditorState;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isOpen = editor.mode !== "CLOSED";
  const isEdit = editor.mode === "EDIT";
  const initial = isEdit ? editor.row : null;
  const { data: driversData } = useDriversData(1);
  const { data: poolsData } = useEquipmentPoolsData(1, 50);

  const [chassisNumber, setChassisNumber] = useState(initial?.chassisNumber ?? "");
  const [size, setSize] = useState<ChassisSize | "">(initial?.size ?? "");
  const [ownerKind, setOwnerKind] = useState<ChassisOwnerKind>(initial?.ownerKind ?? "COMPANY");
  const [ownerDriverId, setOwnerDriverId] = useState<number | null>(initial?.ownerDriverId ?? null);
  const [ownerPoolId, setOwnerPoolId] = useState<number | null>(initial?.ownerPoolId ?? null);
  const [status, setStatus] = useState<ChassisStatus>(initial?.status ?? "AVAILABLE");
  const [note, setNote] = useState(initial?.note ?? "");
  const [registrationExpiresAt, setRegistrationExpiresAt] = useState(initial?.registrationExpiresAt ?? "");
  const [inspectionExpiresAt, setInspectionExpiresAt] = useState(initial?.inspectionExpiresAt ?? "");

  const { mutate: createChassis, isPending: isCreatePending } = useCreateChassis({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: updateChassis, isPending: isUpdatePending } = useUpdateChassis({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const isPending = isCreatePending || isUpdatePending;

  const isPool = ownerKind === "TERMINAL_POOL" || ownerKind === "THIRD_PARTY_POOL";

  const handleSubmit = () => {
    if (chassisNumber.trim() === "") {
      toast.error(t("chassis.validation.numberRequired"), { position: "top-center" });
      return;
    }
    if (ownerKind === "DRIVER" && !ownerDriverId) {
      toast.error(t("chassis.validation.driverRequired"), { position: "top-center" });
      return;
    }
    if (isPool && !ownerPoolId) {
      toast.error(t("chassis.validation.poolRequired"), { position: "top-center" });
      return;
    }
    const payload = {
      chassisNumber: chassisNumber.trim(),
      size: (size || null) as ChassisSize | null,
      ownerKind,
      ownerDriverId: ownerKind === "DRIVER" ? ownerDriverId : null,
      ownerPoolId: isPool ? ownerPoolId : null,
      status,
      note: note.trim() || null,
      registrationExpiresAt: registrationExpiresAt || null,
      inspectionExpiresAt: inspectionExpiresAt || null,
    };
    if (isEdit) {
      updateChassis({ id: editor.row.id, payload });
    } else {
      createChassis(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEdit ? t("chassis.editTitle") : t("chassis.createTitle")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("chassis.field.chassisNumber")} required>
                <Input value={chassisNumber} onChange={(e) => setChassisNumber(e.target.value.toUpperCase())} disabled={isPending} />
              </Field>
              <Field label={t("chassis.field.size")}>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as ChassisSize | "")}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">—</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label={t("chassis.field.ownerKind")} required>
                <select
                  value={ownerKind}
                  onChange={(e) => setOwnerKind(e.target.value as ChassisOwnerKind)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label={t("chassis.field.status")}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ChassisStatus)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              {ownerKind === "DRIVER" && (
                <Field label={t("chassis.field.ownerDriver")} required>
                  <select
                    value={ownerDriverId ?? ""}
                    onChange={(e) => setOwnerDriverId(e.target.value ? Number(e.target.value) : null)}
                    disabled={isPending}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    {(driversData?.items ?? []).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              {isPool && (
                <Field label={t("chassis.field.ownerPool")} required>
                  <select
                    value={ownerPoolId ?? ""}
                    onChange={(e) => setOwnerPoolId(e.target.value ? Number(e.target.value) : null)}
                    disabled={isPending}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    {(poolsData?.items ?? []).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label={t("chassis.field.registrationExpiresAt")}>
                <Input
                  type="date"
                  value={registrationExpiresAt}
                  onChange={(e) => setRegistrationExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("chassis.field.inspectionExpiresAt")}>
                <Input
                  type="date"
                  value={inspectionExpiresAt}
                  onChange={(e) => setInspectionExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field label={t("chassis.field.note")}>
              <textarea
                value={note ?? ""}
                onChange={(e) => setNote(e.target.value)}
                disabled={isPending}
                className="min-h-[60px] w-full rounded-md border bg-background p-2 text-sm"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isPending}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isEdit ? t("common.save") : t("common.create")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
