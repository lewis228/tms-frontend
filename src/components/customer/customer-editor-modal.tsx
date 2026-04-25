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
import { useCreateCustomer } from "@/hooks/mutations/customer/use-create-customer";
import { useUpdateCustomer } from "@/hooks/mutations/customer/use-update-customer";
import { generateErrorMessage } from "@/lib/error";
import { useCustomerEditorModal } from "@/store/customer-editor-modal";

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
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.customer.note ?? ""),
  );

  const { mutate: createCustomer, isPending: isCreatePending } =
    useCreateCustomer({
      onSuccess: () => {
        toast.success("고객사가 생성되었습니다.", { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateCustomer, isPending: isUpdatePending } =
    useUpdateCustomer({
      onSuccess: () => {
        toast.success("고객사가 수정되었습니다.", { position: "top-center" });
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
      billingAddress: billingAddress.trim() || null,
      contactName: contactName.trim() || null,
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
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
          {modal.type === "CREATE" ? "고객사 생성" : "고객사 수정"}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label="이름" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Acme Logistics"
          />
        </Field>
        <Field label="코드">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isPending}
            placeholder="ACME"
            maxLength={64}
          />
        </Field>
        <Field label="청구 주소">
          <Input
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="담당자 이름">
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label="담당자 전화">
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              disabled={isPending}
              placeholder="+1 213 555 0100"
            />
          </Field>
        </div>
        <Field label="담당자 이메일">
          <Input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label="메모">
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
