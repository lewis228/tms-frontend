// Truck 마스터 — 표 + create/edit 모달.
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
import { useTrucksData } from "@/hooks/queries/use-trucks-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useCreateTruck } from "@/hooks/mutations/truck/use-create-truck";
import { useUpdateTruck } from "@/hooks/mutations/truck/use-update-truck";
import { useDeleteTruck } from "@/hooks/mutations/truck/use-delete-truck";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { TruckEntity, TruckOwnerKind, TruckStatus } from "@/types";

const OWNERS: TruckOwnerKind[] = ["COMPANY", "DRIVER"];
const STATUSES: TruckStatus[] = ["ACTIVE", "MAINTENANCE", "RETIRED"];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: TruckEntity };

export default function TruckList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const openAlert = useOpenAlertModal();

  const { data, isPending, error } = useTrucksData(page, 50);
  const { data: driversData } = useDriversData(1);
  const driverNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of driversData?.items ?? []) m.set(d.id, d.name);
    return m;
  }, [driversData]);

  const { mutate: deleteTruck } = useDeleteTruck({
    onSuccess: () => toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("truck.totalCount", { count: data.total ?? data.items.length })}
        </p>
        <Button onClick={() => setEditor({ mode: "CREATE" })}>
          + {t("truck.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("truck.field.plateNo")}</TableHead>
              <TableHead>{t("truck.field.makeModel")}</TableHead>
              <TableHead>{t("truck.field.year")}</TableHead>
              <TableHead>{t("truck.field.ownerKind")}</TableHead>
              <TableHead>{t("truck.field.ownerDriver")}</TableHead>
              <TableHead>{t("truck.field.status")}</TableHead>
              <TableHead className="w-32 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((tk) => (
                <TableRow key={tk.id}>
                  <TableCell className="font-mono">{tk.plateNo}</TableCell>
                  <TableCell className="text-xs">
                    {tk.make ?? "—"} {tk.model ?? ""}
                  </TableCell>
                  <TableCell className="text-xs">{tk.year ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        "rounded px-1.5 py-0.5 text-xs " +
                        (tk.ownerKind === "COMPANY"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {tk.ownerKind}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {tk.ownerDriverId
                      ? (driverNameById.get(tk.ownerDriverId) ?? `#${tk.ownerDriverId}`)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">{tk.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditor({ mode: "EDIT", row: tk })}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openAlert({
                          title: t("truck.deletePromptTitle", { plate: tk.plateNo }),
                          description: t("truck.deletePromptDesc"),
                          onPositive: () => deleteTruck(tk.id),
                        })
                      }
                    >
                      {t("common.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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

      <TruckEditor editor={editor} onClose={() => setEditor({ mode: "CLOSED" })} />
    </div>
  );
}

function TruckEditor({
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

  const [plateNo, setPlateNo] = useState(initial?.plateNo ?? "");
  const [vin, setVin] = useState(initial?.vin ?? "");
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState<number | "">(initial?.year ?? "");
  const [ownerKind, setOwnerKind] = useState<TruckOwnerKind>(initial?.ownerKind ?? "COMPANY");
  const [ownerDriverId, setOwnerDriverId] = useState<number | null>(initial?.ownerDriverId ?? null);
  const [status, setStatus] = useState<TruckStatus>(initial?.status ?? "ACTIVE");
  const [note, setNote] = useState(initial?.note ?? "");
  const [registrationExpiresAt, setRegistrationExpiresAt] = useState(initial?.registrationExpiresAt ?? "");
  const [insuranceExpiresAt, setInsuranceExpiresAt] = useState(initial?.insuranceExpiresAt ?? "");
  const [inspectionExpiresAt, setInspectionExpiresAt] = useState(initial?.inspectionExpiresAt ?? "");

  const { mutate: createTruck, isPending: isCreatePending } = useCreateTruck({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: updateTruck, isPending: isUpdatePending } = useUpdateTruck({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const isPending = isCreatePending || isUpdatePending;

  const handleSubmit = () => {
    if (plateNo.trim() === "") {
      toast.error(t("truck.validation.plateRequired"), { position: "top-center" });
      return;
    }
    if (ownerKind === "DRIVER" && !ownerDriverId) {
      toast.error(t("truck.validation.driverRequired"), { position: "top-center" });
      return;
    }
    const payload = {
      plateNo: plateNo.trim(),
      vin: vin.trim() || null,
      make: make.trim() || null,
      model: model.trim() || null,
      year: year === "" ? null : Number(year),
      ownerKind,
      ownerDriverId: ownerKind === "DRIVER" ? ownerDriverId : null,
      status,
      note: note.trim() || null,
      registrationExpiresAt: registrationExpiresAt || null,
      insuranceExpiresAt: insuranceExpiresAt || null,
      inspectionExpiresAt: inspectionExpiresAt || null,
    };
    if (isEdit) {
      updateTruck({ id: editor.row.id, payload });
    } else {
      createTruck(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEdit ? t("truck.editTitle") : t("truck.createTitle")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("truck.field.plateNo")} required>
                <Input value={plateNo} onChange={(e) => setPlateNo(e.target.value.toUpperCase())} disabled={isPending} />
              </Field>
              <Field label={t("truck.field.vin")}>
                <Input value={vin} onChange={(e) => setVin(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("truck.field.make")}>
                <Input value={make} onChange={(e) => setMake(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("truck.field.model")}>
                <Input value={model} onChange={(e) => setModel(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("truck.field.year")}>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("truck.field.status")}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TruckStatus)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label={t("truck.field.ownerKind")} required>
                <select
                  value={ownerKind}
                  onChange={(e) => setOwnerKind(e.target.value as TruckOwnerKind)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {OWNERS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              {ownerKind === "DRIVER" && (
                <Field label={t("truck.field.ownerDriver")} required>
                  <select
                    value={ownerDriverId ?? ""}
                    onChange={(e) =>
                      setOwnerDriverId(e.target.value ? Number(e.target.value) : null)
                    }
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
              <Field label={t("truck.field.registrationExpiresAt")}>
                <Input
                  type="date"
                  value={registrationExpiresAt}
                  onChange={(e) => setRegistrationExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("truck.field.insuranceExpiresAt")}>
                <Input
                  type="date"
                  value={insuranceExpiresAt}
                  onChange={(e) => setInsuranceExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("truck.field.inspectionExpiresAt")}>
                <Input
                  type="date"
                  value={inspectionExpiresAt}
                  onChange={(e) => setInspectionExpiresAt(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field label={t("truck.field.note")}>
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
