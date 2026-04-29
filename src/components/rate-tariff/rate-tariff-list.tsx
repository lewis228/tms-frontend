// Rate Tariff 마스터 — 거리×단가룰. per_value/per_min/flat_base 4 move_type.
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
import { useRateTariffsData } from "@/hooks/queries/use-rate-tariffs-data";
import { useCreateRateTariff } from "@/hooks/mutations/rate-tariff/use-create-rate-tariff";
import { useUpdateRateTariff } from "@/hooks/mutations/rate-tariff/use-update-rate-tariff";
import { useDeleteRateTariff } from "@/hooks/mutations/rate-tariff/use-delete-rate-tariff";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { MoveTypeV3, RateTariffEntity } from "@/types";

const MOVE_TYPES: MoveTypeV3[] = [
  "TRUCK_ONLY",
  "CHASSIS_ONLY",
  "EMPTY_LOADED",
  "FULL_LOADED",
];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: RateTariffEntity };

export default function RateTariffList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isPending, error } = useRateTariffsData(page);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const openAlert = useOpenAlertModal();

  const { mutate: createTariff, isPending: isCreatePending } =
    useCreateRateTariff({
      onSuccess: () => {
        toast.success(t("common.saved"), { position: "top-center" });
        setEditor({ mode: "CLOSED" });
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });
  const { mutate: updateTariff, isPending: isUpdatePending } =
    useUpdateRateTariff({
      onSuccess: () => {
        toast.success(t("common.saved"), { position: "top-center" });
        setEditor({ mode: "CLOSED" });
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });
  const { mutate: deleteTariff } = useDeleteRateTariff({
    onSuccess: () =>
      toast.success(t("common.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (row: RateTariffEntity) => {
    openAlert({
      title: row.name,
      description: t("common.deleteConfirm"),
      onConfirm: () => deleteTariff(row.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Button onClick={() => setEditor({ mode: "CREATE" })}>+ Tariff</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Move Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">per_value</TableHead>
              <TableHead className="text-right">per_min</TableHead>
              <TableHead className="text-right">flat_base</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.moveType ?? "*"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.containerSize ?? "*"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {r.perValue}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {r.perMin}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {r.flatBase}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.effectiveFrom} → {r.effectiveTo ?? "∞"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditor({ mode: "EDIT", row: r })}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(r)}
                    >
                      Del
                    </Button>
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

      <Dialog
        open={editor.mode !== "CLOSED"}
        onOpenChange={(o) => !o && setEditor({ mode: "CLOSED" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">
              {editor.mode === "EDIT" ? "Edit Tariff" : "New Tariff"}
            </DialogTitle>
          </DialogHeader>
          <TariffEditor
            initial={editor.mode === "EDIT" ? editor.row : null}
            disabled={isCreatePending || isUpdatePending}
            onSave={(payload) => {
              if (editor.mode === "EDIT") {
                updateTariff({ id: editor.row.id, payload });
              } else {
                createTariff({
                  name: payload.name ?? "Untitled",
                  moveType: payload.moveType ?? null,
                  containerSize: payload.containerSize ?? null,
                  customerId: payload.customerId ?? null,
                  perValue: payload.perValue ?? 0,
                  perMin: payload.perMin ?? 0,
                  flatBase: payload.flatBase ?? 0,
                  effectiveFrom:
                    payload.effectiveFrom ?? new Date().toISOString().slice(0, 10),
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

type EditorPayload = {
  name?: string | null;
  moveType?: MoveTypeV3 | null;
  containerSize?: string | null;
  customerId?: number | null;
  perValue?: number;
  perMin?: number;
  flatBase?: number;
  effectiveFrom?: string;
  effectiveTo?: string | null;
};

function TariffEditor({
  initial,
  disabled,
  onSave,
}: {
  initial: RateTariffEntity | null;
  disabled: boolean;
  onSave: (p: EditorPayload) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [moveType, setMoveType] = useState<MoveTypeV3 | "">(
    initial?.moveType ?? "",
  );
  const [perValue, setPerValue] = useState<string>(initial?.perValue ?? "0");
  const [perMin, setPerMin] = useState<string>(initial?.perMin ?? "0");
  const [flatBase, setFlatBase] = useState<string>(initial?.flatBase ?? "0");
  const [effectiveFrom, setEffectiveFrom] = useState<string>(
    initial?.effectiveFrom ?? new Date().toISOString().slice(0, 10),
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </Field>
      <Field label="Move Type">
        <select
          value={moveType}
          onChange={(e) => setMoveType(e.target.value as MoveTypeV3 | "")}
          disabled={disabled}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">* (any)</option>
          {MOVE_TYPES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>
      <Field label="per_value">
        <Input
          value={perValue}
          onChange={(e) => setPerValue(e.target.value)}
          disabled={disabled}
          inputMode="decimal"
        />
      </Field>
      <Field label="per_min">
        <Input
          value={perMin}
          onChange={(e) => setPerMin(e.target.value)}
          disabled={disabled}
          inputMode="decimal"
        />
      </Field>
      <Field label="flat_base">
        <Input
          value={flatBase}
          onChange={(e) => setFlatBase(e.target.value)}
          disabled={disabled}
          inputMode="decimal"
        />
      </Field>
      <Field label="Effective From">
        <Input
          type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          disabled={disabled}
        />
      </Field>

      <div className="col-span-2 flex justify-end">
        <Button
          disabled={disabled || name.trim() === ""}
          onClick={() =>
            onSave({
              name,
              moveType: moveType === "" ? null : (moveType as MoveTypeV3),
              perValue: Number(perValue) || 0,
              perMin: Number(perMin) || 0,
              flatBase: Number(flatBase) || 0,
              effectiveFrom,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
