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
import { useCreateCustomer } from "@/hooks/mutations/customer/use-create-customer";
import { useUpdateCustomer } from "@/hooks/mutations/customer/use-update-customer";
import { generateErrorMessage } from "@/lib/error";
import { useCustomerEditorModal } from "@/store/customer-editor-modal";
import type { PartnerKind } from "@/types";

const KINDS: PartnerKind[] = ["CUSTOMER", "CARRIER", "BROKER", "VENDOR"];

type OpenModal = Extract<
  ReturnType<typeof useCustomerEditorModal>,
  { isOpen: true }
>;

export default function CustomerEditorModal() {
  const modal = useCustomerEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.customer.id}` : "c"}
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
    modal.type === "CREATE" ? "" : modal.customer.name,
  );
  const [code, setCode] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.code ?? ""),
  );
  const [billingAddress, setBillingAddress] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.billingAddress ?? ""),
  );
  const [contactName, setContactName] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.contactName ?? ""),
  );
  const [contactEmail, setContactEmail] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.contactEmail ?? ""),
  );
  const [contactPhone, setContactPhone] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.contactPhone ?? ""),
  );
  // H-5
  const [kind, setKind] = useState<PartnerKind>(
    modal.type === "CREATE" ? "CUSTOMER" : modal.customer.kind,
  );
  const [mcNumber, setMcNumber] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.mcNumber ?? ""),
  );
  const [dotNumber, setDotNumber] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.dotNumber ?? ""),
  );
  const [insuranceExpiresAt, setInsuranceExpiresAt] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.insuranceExpiresAt ?? ""),
  );
  const [paymentTermsDays, setPaymentTermsDays] = useState<number | "">(
    modal.type === "CREATE" ? "" : (modal.customer.paymentTermsDays ?? ""),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.note ?? ""),
  );

  const { mutate: createCustomer, isPending: isCreatePending } =
    useCreateCustomer({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateCustomer, isPending: isUpdatePending } =
    useUpdateCustomer({
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
      code: code.trim() || null,
      kind,
      billingAddress: billingAddress.trim() || null,
      contactName: contactName.trim() || null,
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
      mcNumber: kind === "CARRIER" ? mcNumber.trim() || null : null,
      dotNumber: kind === "CARRIER" ? dotNumber.trim() || null : null,
      insuranceExpiresAt: kind === "CARRIER" ? (insuranceExpiresAt || null) : null,
      paymentTermsDays:
        paymentTermsDays === "" || paymentTermsDays === null
          ? null
          : Number(paymentTermsDays),
      note: note.trim() || null,
    };
    if (modal.type === "CREATE") {
      createCustomer(payload);
    } else {
      updateCustomer({ id: modal.customer.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(modal.type === "CREATE" ? "customer.createTitle" : "customer.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Acme Logistics"
          />
        </Field>
        <Field label={t("field.code")}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isPending}
            placeholder="ACME"
            maxLength={64}
          />
        </Field>
        <Field label={t("customer.field.billingAddress")}>
          <Input
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("customer.field.contactName")}>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("customer.field.contactPhone")}>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={isPending}
              placeholder="+1 213 555 0100"
            />
          </Field>
        </div>
        <Field label={t("customer.field.contactEmail")}>
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={isPending}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("customer.field.kind")}>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as PartnerKind)}
              disabled={isPending}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label={t("customer.field.paymentTermsDays")}>
            <Input
              type="number"
              value={paymentTermsDays}
              onChange={(e) =>
                setPaymentTermsDays(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={isPending}
              placeholder="30"
            />
          </Field>
        </div>

        {kind === "CARRIER" && (
          <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3">
            <Field label={t("customer.field.mcNumber")}>
              <Input value={mcNumber} onChange={(e) => setMcNumber(e.target.value)} disabled={isPending} />
            </Field>
            <Field label={t("customer.field.dotNumber")}>
              <Input value={dotNumber} onChange={(e) => setDotNumber(e.target.value)} disabled={isPending} />
            </Field>
            <Field label={t("customer.field.insuranceExpiresAt")}>
              <Input
                type="date"
                value={insuranceExpiresAt}
                onChange={(e) => setInsuranceExpiresAt(e.target.value)}
                disabled={isPending}
              />
            </Field>
          </div>
        )}

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
