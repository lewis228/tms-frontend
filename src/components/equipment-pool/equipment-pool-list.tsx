// Equipment Pool 마스터 — TRAC / FlexiVan / 터미널 풀 등.
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
import { useEquipmentPoolsData } from "@/hooks/queries/use-equipment-pools-data";
import { useCreateEquipmentPool } from "@/hooks/mutations/equipment-pool/use-create-equipment-pool";
import { useUpdateEquipmentPool } from "@/hooks/mutations/equipment-pool/use-update-equipment-pool";
import { useDeleteEquipmentPool } from "@/hooks/mutations/equipment-pool/use-delete-equipment-pool";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { EquipmentPoolEntity, EquipmentPoolKind } from "@/types";

const KINDS: EquipmentPoolKind[] = ["TERMINAL_POOL", "THIRD_PARTY_POOL"];

type EditorState =
  | { mode: "CLOSED" }
  | { mode: "CREATE" }
  | { mode: "EDIT"; row: EquipmentPoolEntity };

export default function EquipmentPoolList() {
  const { t } = useTranslation();
  const [page] = useState(1);
  const [editor, setEditor] = useState<EditorState>({ mode: "CLOSED" });
  const openAlert = useOpenAlertModal();

  const { data, isPending, error } = useEquipmentPoolsData(page, 50);

  const { mutate: deletePool } = useDeleteEquipmentPool({
    onSuccess: () => toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("equipmentPool.totalCount", { count: data.total ?? data.items.length })}
        </p>
        <Button onClick={() => setEditor({ mode: "CREATE" })}>
          + {t("equipmentPool.newButton")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("equipmentPool.field.name")}</TableHead>
              <TableHead>{t("equipmentPool.field.kind")}</TableHead>
              <TableHead>{t("equipmentPool.field.operator")}</TableHead>
              <TableHead>{t("equipmentPool.field.contact")}</TableHead>
              <TableHead className="w-32 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {p.kind}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{p.operator ?? "—"}</TableCell>
                  <TableCell className="text-xs">{p.contact ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditor({ mode: "EDIT", row: p })}>
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openAlert({
                          title: t("equipmentPool.deletePromptTitle", { name: p.name }),
                          description: t("equipmentPool.deletePromptDesc"),
                          onPositive: () => deletePool(p.id),
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

      <Editor editor={editor} onClose={() => setEditor({ mode: "CLOSED" })} />
    </div>
  );
}

function Editor({
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

  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<EquipmentPoolKind>(initial?.kind ?? "THIRD_PARTY_POOL");
  const [operator, setOperator] = useState(initial?.operator ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [note, setNote] = useState(initial?.note ?? "");

  const { mutate: createPool, isPending: isCreatePending } = useCreateEquipmentPool({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: updatePool, isPending: isUpdatePending } = useUpdateEquipmentPool({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      onClose();
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const isPending = isCreatePending || isUpdatePending;

  const handleSubmit = () => {
    if (name.trim() === "") {
      toast.error(t("equipmentPool.validation.nameRequired"), { position: "top-center" });
      return;
    }
    const payload = {
      name: name.trim(),
      kind,
      operator: operator.trim() || null,
      contact: contact.trim() || null,
      note: note.trim() || null,
    };
    if (isEdit) {
      updatePool({ id: editor.row.id, payload });
    } else {
      createPool(payload);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEdit ? t("equipmentPool.editTitle") : t("equipmentPool.createTitle")}
          </DialogTitle>
        </DialogHeader>
        {isOpen && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("equipmentPool.field.name")} required>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("equipmentPool.field.kind")}>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as EquipmentPoolKind)}
                  disabled={isPending}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              <Field label={t("equipmentPool.field.operator")}>
                <Input value={operator ?? ""} onChange={(e) => setOperator(e.target.value)} disabled={isPending} />
              </Field>
              <Field label={t("equipmentPool.field.contact")}>
                <Input value={contact ?? ""} onChange={(e) => setContact(e.target.value)} disabled={isPending} />
              </Field>
            </div>
            <Field label={t("equipmentPool.field.note")}>
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
