// Charge Code 마스터 — 표 + create/edit 인라인 모달.
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
import { useChargeCodesData } from "@/hooks/queries/use-charge-codes-data";
import { useCreateChargeCode } from "@/hooks/mutations/charge-code/use-create-charge-code";
import { useUpdateChargeCode } from "@/hooks/mutations/charge-code/use-update-charge-code";
import { useDeleteChargeCode } from "@/hooks/mutations/charge-code/use-delete-charge-code";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type {
  ChargeCodeEntity,
  ChargeKind,
  ChargeUnit,
} from "@/types";

const KINDS: ChargeKind[] = [
  "BASE", "ACCESSORIAL", "PENALTY", "FUEL", "TAX", "DISCOUNT",
];
const UNITS: ChargeUnit[] = [
  "FLAT", "HOUR", "MINUTE", "DAY", "MILE", "PERCENT",
];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: ChargeCodeEntity };

export default function ChargeCodeList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const openAlert = useOpenAlertModal();

  const { data, isPending, error } = useChargeCodesData(page, 50);

  const { mutate: deleteCode } = useDeleteChargeCode({
    onSuccess: () => toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("chargeCode.totalCount", { count: data.total ?? data.items.length })}
        </p>
        <Button onClick={() => setEditor({ mode: "CREATE" })}>
          + {t("chargeCode.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("chargeCode.field.code")}</TableHead>
              <TableHead>{t("chargeCode.field.name")}</TableHead>
              <TableHead>{t("chargeCode.field.kind")}</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>{t("chargeCode.field.unit")}</TableHead>
              <TableHead>Unit Label</TableHead>
              <TableHead>{t("chargeCode.field.amount")}</TableHead>
              <TableHead>±</TableHead>
              <TableHead>{t("chargeCode.field.flags")}</TableHead>
              <TableHead className="w-32 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {c.kind}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.category ? (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">
                        {c.category}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{c.defaultUnit}</TableCell>
                  <TableCell className="text-xs">{c.unitLabel ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {c.defaultAmount ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.signed ? "✓" : ""}
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
                      onClick={() =>
                        openAlert({
                          title: t("chargeCode.deletePromptTitle", { code: c.code }),
                          description: t("chargeCode.deletePromptDesc"),
                          onPositive: () => deleteCode(c.id),
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

      <Pagination
        page={page}
        pages={data.pages}
        onChange={setPage}
      />

      <ChargeCodeEditor
        editor={editor}
        onClose={() => setEditor({ mode: "CLOSED" })}
      />
    </div>
  );
}

function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex justify-end gap-1">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </Button>
      <span className="px-2 py-1 text-xs text-muted-foreground">
        {page} / {pages}
      </span>
      <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        ›
      </Button>
    </div>
  );
}

function ChargeCodeEditor({
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
  const [kind, setKind] = useState<ChargeKind>(initial?.kind ?? "BASE");
  const [unit, setUnit] = useState<ChargeUnit>(initial?.defaultUnit ?? "FLAT");
  const [amount, setAmount] = useState(initial?.defaultAmount ?? "");
  const [isBillable, setIsBillable] = useState(initial?.isBillableToCustomer ?? true);
  const [isPayable, setIsPayable] = useState(initial?.isPayableToDriver ?? false);
  const [glAccount, setGlAccount] = useState(initial?.glAccount ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const { mutate: createCode, isPending: isCreatePending } = useCreateChargeCode({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: updateCode, isPending: isUpdatePending } = useUpdateChargeCode({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const isPending = isCreatePending || isUpdatePending;

  const handleSubmit = () => {
    if (code.trim() === "" || name.trim() === "") {
      toast.error(t("chargeCode.validation.required"), { position: "top-center" });
      return;
    }
    const payload = {
      code: code.trim(),
      name: name.trim(),
      kind,
      defaultUnit: unit,
      defaultAmount: amount === "" ? null : amount,
      isBillableToCustomer: isBillable,
      isPayableToDriver: isPayable,
      glAccount: glAccount.trim() || null,
      description: description.trim() || null,
    };
    if (isEdit) {
      updateCode({ id: editor.row.id, payload });
    } else {
      createCode(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEdit ? t("chargeCode.editTitle") : t("chargeCode.createTitle")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("chargeCode.field.code")} required>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isPending}
                  placeholder="BASE_LINEHAUL"
                />
              </Field>
              <Field label={t("chargeCode.field.name")} required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("chargeCode.field.kind")}>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as ChargeKind)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("chargeCode.field.unit")}>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as ChargeUnit)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("chargeCode.field.defaultAmount")}>
                <Input
                  type="number"
                  step="0.01"
                  value={amount ?? ""}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isPending}
                />
              </Field>
              <Field label={t("chargeCode.field.glAccount")}>
                <Input
                  value={glAccount ?? ""}
                  onChange={(e) => setGlAccount(e.target.value)}
                  disabled={isPending}
                />
              </Field>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  disabled={isPending}
                />
                {t("chargeCode.field.isBillableToCustomer")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPayable}
                  onChange={(e) => setIsPayable(e.target.checked)}
                  disabled={isPending}
                />
                {t("chargeCode.field.isPayableToDriver")}
              </label>
            </div>
            <Field label={t("chargeCode.field.description")}>
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
