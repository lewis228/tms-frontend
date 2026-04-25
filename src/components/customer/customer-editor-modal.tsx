import { useEffect, useState } from "react";
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

export default function CustomerEditorModal() {
  const modal = useCustomerEditorModal();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!modal.isOpen) return;
    if (modal.type === "CREATE") {
      setName("");
      setCode("");
      setBillingAddress("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setNote("");
    } else {
      setName(modal.customer.name);
      setCode(modal.customer.code ?? "");
      setBillingAddress(modal.customer.billingAddress ?? "");
      setContactName(modal.customer.contactName ?? "");
      setContactEmail(modal.customer.contactEmail ?? "");
      setContactPhone(modal.customer.contactPhone ?? "");
      setNote(modal.customer.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

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
    if (!modal.isOpen) return;
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
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {modal.isOpen && modal.type === "CREATE"
              ? "고객사 생성"
              : "고객사 수정"}
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
