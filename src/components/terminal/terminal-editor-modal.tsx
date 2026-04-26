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
import { Input } from "@/components/ui/input";
import { useCreateTerminal } from "@/hooks/mutations/terminal/use-create-terminal";
import { useUpdateTerminal } from "@/hooks/mutations/terminal/use-update-terminal";
import { generateErrorMessage } from "@/lib/error";
import { useTerminalEditorModal } from "@/store/terminal-editor-modal";

type OpenModal = Extract<
  ReturnType<typeof useTerminalEditorModal>,
  { isOpen: true }
>;

export default function TerminalEditorModal() {
  const modal = useTerminalEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.terminal.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const { t } = useTranslation();
  const [name, setName] = useState(
    modal.type === "CREATE" ? "" : modal.terminal.name,
  );
  const [code, setCode] = useState(
    modal.type === "CREATE" ? "" : (modal.terminal.code ?? ""),
  );
  const [address, setAddress] = useState(
    modal.type === "CREATE" ? "" : (modal.terminal.address ?? ""),
  );
  const [latitude, setLatitude] = useState(
    modal.type === "CREATE" ? "" : (modal.terminal.latitude ?? ""),
  );
  const [longitude, setLongitude] = useState(
    modal.type === "CREATE" ? "" : (modal.terminal.longitude ?? ""),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.terminal.note ?? ""),
  );

  const { mutate: createTerminal, isPending: isCreatePending } =
    useCreateTerminal({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateTerminal, isPending: isUpdatePending } =
    useUpdateTerminal({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const parseLatLng = (s: string): number | null => {
    const v = s.trim();
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = () => {
    if (name.trim() === "") return;
    const payload = {
      name: name.trim(),
      code: code.trim() || null,
      address: address.trim() || null,
      latitude: parseLatLng(latitude),
      longitude: parseLatLng(longitude),
      note: note.trim() || null,
    };
    if (modal.type === "CREATE") {
      createTerminal(payload);
    } else {
      updateTerminal({ id: modal.terminal.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(modal.type === "CREATE" ? "terminal.createTitle" : "terminal.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="LBCT"
          />
        </Field>
        <Field label={t("terminal.field.codeLabel")}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isPending}
            placeholder="USLAX"
            maxLength={32}
          />
        </Field>
        <Field label={t("field.address")}>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("terminal.field.latitude")}>
            <Input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isPending}
              placeholder="33.7350"
              inputMode="decimal"
            />
          </Field>
          <Field label={t("terminal.field.longitude")}>
            <Input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={isPending}
              placeholder="-118.2659"
              inputMode="decimal"
            />
          </Field>
        </div>
        <Field label={t("field.note")}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={isPending || !name.trim()}>
          {t("common.save")}
        </Button>
      </div>
    </>
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
