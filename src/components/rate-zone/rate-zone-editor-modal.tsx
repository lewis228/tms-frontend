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
import RateZoneMembersPanel from "@/components/rate-zone/rate-zone-members-panel";
import { useCreateRateZone } from "@/hooks/mutations/rate-zone/use-create-rate-zone";
import { useUpdateRateZone } from "@/hooks/mutations/rate-zone/use-update-rate-zone";
import { generateErrorMessage } from "@/lib/error";
import { useRateZoneEditorModal } from "@/store/rate-zone-editor-modal";

type OpenModal = Extract<
  ReturnType<typeof useRateZoneEditorModal>,
  { isOpen: true }
>;

export default function RateZoneEditorModal() {
  const modal = useRateZoneEditorModal();
  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.rateZone.id}` : "c"}
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
    modal.type === "CREATE" ? "" : modal.rateZone.name,
  );
  const [code, setCode] = useState(
    modal.type === "CREATE" ? "" : (modal.rateZone.code ?? ""),
  );
  const [color, setColor] = useState(
    modal.type === "CREATE" ? "#2563eb" : (modal.rateZone.color ?? "#2563eb"),
  );
  const [description, setDescription] = useState(
    modal.type === "CREATE" ? "" : (modal.rateZone.description ?? ""),
  );

  const { mutate: createRateZone, isPending: isCreatePending } =
    useCreateRateZone({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateRateZone, isPending: isUpdatePending } =
    useUpdateRateZone({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const trimOrNull = (s: string): string | null => {
    const v = s.trim();
    return v === "" ? null : v;
  };

  const handleSave = () => {
    if (name.trim() === "") return;
    const payload = {
      name: name.trim(),
      code: trimOrNull(code),
      color: trimOrNull(color),
      description: trimOrNull(description),
    };
    if (modal.type === "CREATE") {
      createRateZone(payload);
    } else {
      updateRateZone({ id: modal.rateZone.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(
            modal.type === "CREATE"
              ? "rateZone.createTitle"
              : "rateZone.editTitle",
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            maxLength={120}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("field.code")}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              maxLength={32}
            />
          </Field>
          <Field label={t("rateZone.field.color")}>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isPending}
                className="h-9 w-12 cursor-pointer rounded-md border bg-background"
                aria-label={t("rateZone.field.color")}
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isPending}
                maxLength={16}
                className="flex-1"
              />
            </div>
          </Field>
        </div>
        <Field label={t("field.note")}>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            maxLength={3000}
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

      {modal.type === "EDIT" && (
        <RateZoneMembersPanel zoneId={modal.rateZone.id} />
      )}
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
