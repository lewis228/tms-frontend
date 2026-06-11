// Addon(부가요금 타입) 마스터 — 표 + create/edit 인라인 모달 + 기본값 시드 + 기사별 금액 패널.
import { Fragment, useState } from "react";
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
import { useAddonsData } from "@/hooks/queries/use-addons-data";
import { useCreateAddon } from "@/hooks/mutations/addon/use-create-addon";
import { useUpdateAddon } from "@/hooks/mutations/addon/use-update-addon";
import { useDeleteAddon } from "@/hooks/mutations/addon/use-delete-addon";
import { seedDefaultAddons } from "@/api/addon";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import AddonDriverRatesPanel from "@/components/addon/addon-driver-rates-panel";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AddonCategory, AddonEntity, AddonUnit } from "@/types";

const CATEGORIES: AddonCategory[] = [
  "WAITING", "EXTRA_STOP", "DRY_RUN", "PENALTY", "SURCHARGE", "FUEL",
  "CHASSIS_SPLIT", "PREPULL", "LIFT", "NIGHT_GATE", "PIER_PASS", "HAZMAT",
  "REEFER", "OVERWEIGHT", "STORAGE", "ADJUSTMENT", "OTHER",
];
const UNITS: AddonUnit[] = ["FLAT", "HOUR", "MINUTE", "DAY", "MILE", "PERCENT"];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: AddonEntity };

export default function AddonList() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const openAlert = useOpenAlertModal();

  const { data, isPending, error } = useAddonsData(page, 50);

  const { mutate: deleteAddon } = useDeleteAddon({
    onSuccess: () => toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  const handleSeed = async () => {
    try {
      const r = await seedDefaultAddons();
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addon.all });
      toast.success(t("addon.seedResult", { created: r.created, skipped: r.skipped }), {
        position: "top-center",
      });
    } catch (e) {
      toast.error(generateErrorMessage(e as Error), { position: "top-center" });
    }
  };

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("addon.totalCount", { count: data.total ?? data.items.length })}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSeed}>
            {t("addon.seedDefaults")}
          </Button>
          <Button onClick={() => setEditor({ mode: "CREATE" })}>
            + {t("addon.newButton")}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t("addon.field.code")}</TableHead>
              <TableHead>{t("addon.field.name")}</TableHead>
              <TableHead>{t("addon.field.category")}</TableHead>
              <TableHead>{t("addon.field.unit")}</TableHead>
              <TableHead>{t("addon.field.amount")}</TableHead>
              <TableHead>{t("addon.field.billPay")}</TableHead>
              <TableHead className="w-32 text-right" />
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
              data.items.map((c) => (
                <Fragment key={c.id}>
                <TableRow>
                  <TableCell className="w-8 p-0 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expandedId === c.id ? null : c.id)
                      }
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title={t("addon.driverRates.title")}
                    >
                      {expandedId === c.id ? (
                        <ChevronDown className="size-4" />
                      ) : (
                        <ChevronRight className="size-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-xs">
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">
                      {c.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{c.unit}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {c.unit === "PERCENT" ? (c.percent ?? "—") : (c.amount ?? "—")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.isBillableToCustomer ? "💰" : ""}{" "}
                    {c.isPayableToDriver ? "🧑" : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditor({ mode: "EDIT", row: c })}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={c.isSystem}
                      onClick={() =>
                        openAlert({
                          title: t("addon.deletePromptTitle", { code: c.code }),
                          description: t("addon.deletePromptDesc"),
                          onPositive: () => deleteAddon(c.id),
                        })
                      }
                    >
                      {t("common.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedId === c.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted/20 p-2">
                      <AddonDriverRatesPanel addon={c} />
                    </TableCell>
                  </TableRow>
                )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data.pages > 1 && (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹
          </Button>
          <span className="px-2 py-1 text-xs text-muted-foreground">
            {page} / {data.pages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            ›
          </Button>
        </div>
      )}

      <AddonEditor editor={editor} onClose={() => setEditor({ mode: "CLOSED" })} />
    </div>
  );
}

function AddonEditor({
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

  const [code, setCode] = useState(initial?.code ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState<AddonCategory>(initial?.category ?? "SURCHARGE");
  const [unit, setUnit] = useState<AddonUnit>(initial?.unit ?? "FLAT");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [percent, setPercent] = useState(initial?.percent ?? "");
  const [isBillable, setIsBillable] = useState(initial?.isBillableToCustomer ?? true);
  const [isPayable, setIsPayable] = useState(initial?.isPayableToDriver ?? true);
  const [note, setNote] = useState(initial?.note ?? "");

  const { mutate: createAddon, isPending: isCreatePending } = useCreateAddon({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: updateAddon, isPending: isUpdatePending } = useUpdateAddon({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const isPending = isCreatePending || isUpdatePending;

  const handleSubmit = () => {
    if (code.trim() === "" || name.trim() === "") {
      toast.error(t("addon.validation.required"), { position: "top-center" });
      return;
    }
    const common = {
      name: name.trim(),
      category,
      unit,
      amount: unit === "PERCENT" ? null : amount === "" ? null : amount,
      percent: unit === "PERCENT" ? (percent === "" ? null : percent) : null,
      isBillableToCustomer: isBillable,
      isPayableToDriver: isPayable,
      note: note.trim() || null,
    };
    if (isEdit) {
      updateAddon({ id: editor.row.id, payload: common });
    } else {
      createAddon({ code: code.trim(), ...common });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEdit ? t("addon.editTitle") : t("addon.createTitle")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("addon.field.code")} required>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isPending || isEdit}
                  placeholder="NGT"
                />
              </Field>
              <Field label={t("addon.field.name")} required>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("addon.field.category")}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AddonCategory)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("addon.field.unit")}>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as AddonUnit)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
              {unit === "PERCENT" ? (
                <Field label={t("addon.field.percent")}>
                  <Input
                    type="number"
                    step="0.0001"
                    value={percent ?? ""}
                    onChange={(e) => setPercent(e.target.value)}
                    disabled={isPending}
                    placeholder="0.20"
                  />
                </Field>
              ) : (
                <Field label={t("addon.field.amount")}>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount ?? ""}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
              )}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  disabled={isPending}
                />
                {t("addon.field.isBillableToCustomer")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPayable}
                  onChange={(e) => setIsPayable(e.target.checked)}
                  disabled={isPending}
                />
                {t("addon.field.isPayableToDriver")}
              </label>
            </div>
            <Field label={t("addon.field.note")}>
              <Input value={note ?? ""} onChange={(e) => setNote(e.target.value)} disabled={isPending} />
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
