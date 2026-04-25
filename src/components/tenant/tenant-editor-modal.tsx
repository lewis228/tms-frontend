import { useState } from "react";
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
  const [name, setName] = useState(
    modal.type === "CREATE" ? "" : modal.tenant.name,
  );
  const [slug, setSlug] = useState(
    modal.type === "CREATE" ? "" : modal.tenant.slug,
  );
  const [planTier, setPlanTier] = useState(
    modal.type === "CREATE" ? "basic" : modal.tenant.planTier,
  );
  const [timezone, setTimezone] = useState(
    modal.type === "CREATE" ? "UTC" : modal.tenant.timezone,
  );
  const [contactEmail, setContactEmail] = useState(
    modal.type === "CREATE" ? "" : (modal.tenant.contactEmail ?? ""),
  );
  const [contactPhone, setContactPhone] = useState(
    modal.type === "CREATE" ? "" : (modal.tenant.contactPhone ?? ""),
  );

  const { mutate: createT, isPending: isCreatePending } = useCreateTenant({
    onSuccess: () => {
      toast.success("Tenant 가 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateT, isPending: isUpdatePending } = useUpdateTenant({
    onSuccess: () => {
      toast.success("Tenant 가 수정되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;
  const slugInvalid = slug !== "" && !/^[a-z0-9-]{2,64}$/.test(slug);

  const handleSave = () => {
    if (!name.trim()) return;
    if (modal.type === "CREATE") {
      if (slugInvalid || slug.trim() === "") {
        toast.error(
          "slug 형식이 올바르지 않습니다 (소문자/숫자/하이픈 2-64자).",
          { position: "top-center" },
        );
        return;
      }
      createT({
        name: name.trim(),
        slug: slug.trim(),
        planTier,
        timezone,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
      });
    } else {
      updateT({
        id: modal.tenant.id,
        payload: {
          name: name.trim(),
          planTier,
          timezone,
          contactEmail: contactEmail.trim() || null,
          contactPhone: contactPhone.trim() || null,
        },
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {modal.type === "CREATE" ? "Tenant 생성" : "Tenant 수정"}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label="이름" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Acme Drayage"
          />
        </Field>
        <Field
          label="Slug (생성 후 변경 불가, 소문자/숫자/하이픈 2-64자)"
          required={modal.type === "CREATE"}
        >
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={isPending || modal.type === "EDIT"}
            placeholder="acme-drayage"
            className={slugInvalid ? "border-destructive" : undefined}
          />
          {slugInvalid && (
            <span className="text-xs text-destructive">
              형식이 올바르지 않습니다.
            </span>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Plan Tier">
            <Input
              value={planTier}
              onChange={(e) => setPlanTier(e.target.value)}
              disabled={isPending}
              maxLength={32}
            />
          </Field>
          <Field label="Timezone">
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={isPending}
              placeholder="UTC / Asia/Seoul / America/Los_Angeles"
            />
          </Field>
        </div>
        <Field label="Contact Email">
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label="Contact Phone">
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
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
          취소
        </Button>
        <Button onClick={handleSave} disabled={isPending || !name.trim()}>
          저장
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
