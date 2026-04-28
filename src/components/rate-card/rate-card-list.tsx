// Rate Card 매트릭스 — table + create/edit modal.
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
import { useRateCardsData } from "@/hooks/queries/use-rate-cards-data";
import { useChargeCodesData } from "@/hooks/queries/use-charge-codes-data";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useTerminalsData } from "@/hooks/queries/use-terminals-data";
import { useCreateRateCard } from "@/hooks/mutations/rate-card/use-create-rate-card";
import { useUpdateRateCard } from "@/hooks/mutations/rate-card/use-update-rate-card";
import { useDeleteRateCard } from "@/hooks/mutations/rate-card/use-delete-rate-card";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type {
  ChargeUnit,
  ContainerSize,
  RateCardEntity,
} from "@/types";

const UNITS: ChargeUnit[] = [
  "FLAT", "HOUR", "MINUTE", "DAY", "MILE", "PERCENT",
];
const SIZES: ContainerSize[] = [
  "20GP", "40GP", "40HC", "40OT", "45HC", "20RF", "40RF",
];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: RateCardEntity };

export default function RateCardList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const openAlert = useOpenAlertModal();

  const { data, isPending, error } = useRateCardsData(page, 50);
  const { data: chargeCodesData } = useChargeCodesData(1, 100);
  const { data: customersData } = useCustomersData(1);
  const { data: terminalsData } = useTerminalsData(1);

  const codeNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of chargeCodesData?.items ?? []) m.set(c.id, c.code);
    return m;
  }, [chargeCodesData]);
  const customerNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of customersData?.items ?? []) m.set(c.id, c.name);
    return m;
  }, [customersData]);
  const terminalNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const tt of terminalsData?.items ?? []) m.set(tt.id, tt.name);
    return m;
  }, [terminalsData]);

  const { mutate: deleteCard } = useDeleteRateCard({
    onSuccess: () => toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("rateCard.totalCount", { count: data.total ?? data.items.length })}
        </p>
        <Button onClick={() => setEditor({ mode: "CREATE" })}>
          + {t("rateCard.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rateCard.field.priority")}</TableHead>
              <TableHead>{t("rateCard.field.chargeCode")}</TableHead>
              <TableHead>{t("rateCard.field.name")}</TableHead>
              <TableHead>{t("rateCard.field.scope")}</TableHead>
              <TableHead>{t("rateCard.field.unit")}</TableHead>
              <TableHead>{t("rateCard.field.amount")}</TableHead>
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
              data.items.map((r) => {
                const scopeParts: string[] = [];
                if (r.scopeCustomerId)
                  scopeParts.push(customerNameById.get(r.scopeCustomerId) ?? `cust#${r.scopeCustomerId}`);
                if (r.scopeTerminalId)
                  scopeParts.push(terminalNameById.get(r.scopeTerminalId) ?? `term#${r.scopeTerminalId}`);
                if (r.scopeSize) scopeParts.push(r.scopeSize);
                if (r.scopeZone) scopeParts.push(r.scopeZone);
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.priority}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {codeNameById.get(r.chargeCodeId) ?? `#${r.chargeCodeId}`}
                      </span>
                    </TableCell>
                    <TableCell>{r.name ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {scopeParts.length > 0 ? scopeParts.join(" / ") : t("rateCard.scopeAll")}
                    </TableCell>
                    <TableCell className="text-xs">{r.unit}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {r.amount ?? r.percent ?? r.perUnit ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditor({ mode: "EDIT", row: r })}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openAlert({
                            title: t("rateCard.deletePromptTitle"),
                            description: t("rateCard.deletePromptDesc"),
                            onPositive: () => deleteCard(r.id),
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

      <RateCardEditor editor={editor} onClose={() => setEditor({ mode: "CLOSED" })} />
    </div>
  );
}

function RateCardEditor({
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

  const { data: chargeCodesData } = useChargeCodesData(1, 100);
  const { data: customersData } = useCustomersData(1);
  const { data: terminalsData } = useTerminalsData(1);

  const today = new Date().toISOString().slice(0, 10);

  const [chargeCodeId, setChargeCodeId] = useState<number | null>(initial?.chargeCodeId ?? null);
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState<ChargeUnit>(initial?.unit ?? "FLAT");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [percent, setPercent] = useState(initial?.percent ?? "");
  const [perUnit, setPerUnit] = useState(initial?.perUnit ?? "");
  const [scopeSize, setScopeSize] = useState<ContainerSize | "">(initial?.scopeSize ?? "");
  const [scopeCustomerId, setScopeCustomerId] = useState<number | null>(initial?.scopeCustomerId ?? null);
  const [scopeTerminalId, setScopeTerminalId] = useState<number | null>(initial?.scopeTerminalId ?? null);
  const [scopeZone, setScopeZone] = useState(initial?.scopeZone ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? 0);
  const [effectiveFrom, setEffectiveFrom] = useState(initial?.effectiveFrom ?? today);
  const [effectiveTo, setEffectiveTo] = useState(initial?.effectiveTo ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const { mutate: createCard, isPending: isCreatePending } = useCreateRateCard({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: updateCard, isPending: isUpdatePending } = useUpdateRateCard({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const isPending = isCreatePending || isUpdatePending;

  const handleSubmit = () => {
    if (!chargeCodeId) {
      toast.error(t("rateCard.validation.chargeCodeRequired"), { position: "top-center" });
      return;
    }
    const payload = {
      chargeCodeId,
      name: name.trim() || null,
      unit,
      amount: amount === "" ? null : amount,
      percent: percent === "" ? null : percent,
      perUnit: perUnit === "" ? null : perUnit,
      scopeSize: scopeSize || null,
      scopeCustomerId,
      scopeTerminalId,
      scopeZone: scopeZone.trim() || null,
      priority: Number(priority) || 0,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      description: description.trim() || null,
    };
    if (isEdit) {
      updateCard({ id: editor.row.id, payload });
    } else {
      createCard(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEdit ? t("rateCard.editTitle") : t("rateCard.createTitle")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("rateCard.field.chargeCode")} required>
                <select
                  value={chargeCodeId ?? ""}
                  onChange={(e) => setChargeCodeId(e.target.value ? Number(e.target.value) : null)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">—</option>
                  {(chargeCodesData?.items ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("rateCard.field.name")}>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("rateCard.field.priority")}>
                <Input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("rateCard.field.unit")}>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as ChargeUnit)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </Field>
              <Field label={t("rateCard.field.amount")}>
                <Input
                  type="number"
                  step="0.01"
                  value={amount ?? ""}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("rateCard.field.percent")}>
                <Input
                  type="number"
                  step="0.0001"
                  value={percent ?? ""}
                  onChange={(e) => setPercent(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("rateCard.field.perUnit")}>
                <Input
                  type="number"
                  step="0.0001"
                  value={perUnit ?? ""}
                  onChange={(e) => setPerUnit(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("rateCard.field.size")}>
                <select
                  value={scopeSize}
                  onChange={(e) => setScopeSize(e.target.value as ContainerSize | "")}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">—</option>
                  {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label={t("rateCard.field.scopeCustomer")}>
                <select
                  value={scopeCustomerId ?? ""}
                  onChange={(e) => setScopeCustomerId(e.target.value ? Number(e.target.value) : null)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">—</option>
                  {(customersData?.items ?? []).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("rateCard.field.scopeTerminal")}>
                <select
                  value={scopeTerminalId ?? ""}
                  onChange={(e) => setScopeTerminalId(e.target.value ? Number(e.target.value) : null)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">—</option>
                  {(terminalsData?.items ?? []).map((tt) => (
                    <option key={tt.id} value={tt.id}>{tt.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("rateCard.field.scopeZone")}>
                <Input value={scopeZone ?? ""} onChange={(e) => setScopeZone(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("rateCard.field.effectiveFrom")} required>
                <Input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("rateCard.field.effectiveTo")}>
                <Input
                  type="date"
                  value={effectiveTo ?? ""}
                  onChange={(e) => setEffectiveTo(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </div>
            <Field label={t("rateCard.field.description")}>
              <textarea
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
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
