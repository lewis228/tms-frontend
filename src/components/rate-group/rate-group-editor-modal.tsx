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
import { useCreateRateGroup } from "@/hooks/mutations/rate-group/use-create-rate-group";
import { useUpdateRateGroup } from "@/hooks/mutations/rate-group/use-update-rate-group";
import { generateErrorMessage } from "@/lib/error";
import { useRateGroupEditorModal } from "@/store/rate-group-editor-modal";
import type { RateMethod } from "@/types";

const METHODS: RateMethod[] = ["ZIP", "CITY", "MILE", "HOURLY"];

type OpenModal = Extract<
  ReturnType<typeof useRateGroupEditorModal>,
  { isOpen: true }
>;

export default function RateGroupEditorModal() {
  const modal = useRateGroupEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.rateGroup.id}` : "c"}
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
    modal.type === "CREATE" ? "" : modal.rateGroup.name
  );
  const [method, setMethod] = useState<RateMethod>(
    modal.type === "CREATE" ? "ZIP" : modal.rateGroup.method
  );
  const [isDefault, setIsDefault] = useState(
    modal.type === "CREATE" ? false : modal.rateGroup.isDefault
  );
  const [inheritsDefault, setInheritsDefault] = useState(
    modal.type === "CREATE" ? true : modal.rateGroup.inheritsDefault
  );
  const [isTemplate, setIsTemplate] = useState(
    modal.type === "CREATE" ? false : modal.rateGroup.isTemplate
  );
  const [description, setDescription] = useState(
    modal.type === "CREATE" ? "" : (modal.rateGroup.description ?? "")
  );

  const { mutate: createRateGroup, isPending: isCreatePending } =
    useCreateRateGroup({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateRateGroup, isPending: isUpdatePending } =
    useUpdateRateGroup({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (name.trim() === "") return;
    const payload = {
      name: name.trim(),
      method,
      isDefault,
      inheritsDefault,
      isTemplate,
      description: description.trim() || null,
    };
    if (modal.type === "CREATE") {
      createRateGroup(payload);
    } else {
      updateRateGroup({ id: modal.rateGroup.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(
            modal.type === "CREATE"
              ? "rateGroup.createTitle"
              : "rateGroup.editTitle"
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            maxLength={200}
          />
        </Field>
        <Field label={t("rateGroup.field.method")} required>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as RateMethod)}
            disabled={isPending}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {t(`rateGroup.method.${m}`)}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={isPending}
            />
            {t("rateGroup.field.isDefault")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isTemplate}
              onChange={(e) => setIsTemplate(e.target.checked)}
              disabled={isPending}
            />
            {t("rateGroup.field.isTemplate")}
          </label>
        </div>
        {!isDefault && (
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inheritsDefault}
                onChange={(e) => setInheritsDefault(e.target.checked)}
                disabled={isPending}
              />
              {t("rateGroup.field.inheritsDefault")}
            </label>
            <span className="text-xs text-muted-foreground">
              {t("rateGroup.field.inheritsDefaultHelp")}
            </span>
          </div>
        )}
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
