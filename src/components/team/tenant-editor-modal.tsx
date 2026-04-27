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
import { useCreateTenant } from "@/hooks/mutations/tenant/use-create-tenant";
import { useUpdateTenant } from "@/hooks/mutations/tenant/use-update-tenant";
import { generateErrorMessage } from "@/lib/error";
import { useTenantEditorModal } from "@/store/tenant-editor-modal";

type OpenModal = Extract<
  ReturnType<typeof useTenantEditorModal>,
  { isOpen: true }
>;

export default function TenantEditorModal() {
  const modal = useTenantEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.tenant.id}` : "c"}
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
    modal.type === "CREATE" ? "" : modal.tenant.name,
  );
  const [companyName, setCompanyName] = useState(
    modal.type === "CREATE" ? "" : (modal.tenant.companyName ?? ""),
  );
  const [timezone, setTimezone] = useState(
    modal.type === "CREATE" ? "Asia/Seoul" : (modal.tenant.timezone ?? "Asia/Seoul"),
  );
  const [phoneNumber, setPhoneNumber] = useState(
    modal.type === "CREATE" ? "" : (modal.tenant.phoneNumber ?? ""),
  );

  const { mutate: createT, isPending: isCreatePending } = useCreateTenant({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateT, isPending: isUpdatePending } = useUpdateTenant({
    onSuccess: () => {
      toast.success(t("toast.updated"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      companyName: companyName.trim() || null,
      timezone: timezone.trim() || null,
      phoneNumber: phoneNumber.trim() || null,
    };
    if (modal.type === "CREATE") {
      createT(payload);
    } else {
      updateT({ id: modal.tenant.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(modal.type === "CREATE" ? "tenant.createTitle" : "tenant.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("tenant.field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Acme Drayage"
          />
        </Field>
        <Field label={t("tenant.field.companyName")}>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isPending}
            placeholder="Acme Drayage Inc."
          />
        </Field>
        <Field label={t("tenant.field.timezone")}>
          <Input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={isPending}
            placeholder="Asia/Seoul / America/Los_Angeles"
          />
        </Field>
        <Field label={t("tenant.field.phone")}>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
