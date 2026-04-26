// Driver 생성/수정 모달.
// 생성: email/name/phone + driver 메타. 백엔드가 user 자동 생성 + tempPassword 1회 응답.
//       성공 시 임시비번 모달 띄움.
// 수정: email 은 readonly (User 와 분리). name/phone/license/truck/note 만.
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
import { useCreateDriver } from "@/hooks/mutations/driver/use-create-driver";
import { useUpdateDriver } from "@/hooks/mutations/driver/use-update-driver";
import { generateErrorMessage } from "@/lib/error";
import { useDriverEditorModal } from "@/store/driver-editor-modal";
import { useOpenDriverTempPasswordModal } from "@/store/driver-temp-password-modal";

type OpenModal = Extract<
  ReturnType<typeof useDriverEditorModal>,
  { isOpen: true }
>;

export default function DriverEditorModal() {
  const modal = useDriverEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.driver.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const { t } = useTranslation();
  const openTempPwModal = useOpenDriverTempPasswordModal();

  const [email, setEmail] = useState(
    modal.type === "CREATE" ? "" : modal.driver.email,
  );
  const [name, setName] = useState(
    modal.type === "CREATE" ? "" : modal.driver.name,
  );
  const [phone, setPhone] = useState(
    modal.type === "CREATE" ? "" : (modal.driver.phone ?? ""),
  );
  const [licenseNumber, setLicenseNumber] = useState(
    modal.type === "CREATE" ? "" : (modal.driver.licenseNumber ?? ""),
  );
  const [licenseState, setLicenseState] = useState(
    modal.type === "CREATE" ? "" : (modal.driver.licenseState ?? ""),
  );
  const [truckNumber, setTruckNumber] = useState(
    modal.type === "CREATE" ? "" : (modal.driver.truckNumber ?? ""),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.driver.note ?? ""),
  );

  const { mutate: createDriver, isPending: isCreatePending } = useCreateDriver({
    onSuccess: (created) => {
      modal.actions.close();
      // 생성 직후 임시비번 모달 자동 오픈.
      openTempPwModal({
        email: created.email,
        driverName: created.name,
        tempPassword: created.tempPassword,
      });
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateDriver, isPending: isUpdatePending } = useUpdateDriver({
    onSuccess: () => {
      toast.success(t("driver.toast.updated"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (name.trim() === "") return;
    if (modal.type === "CREATE") {
      if (email.trim() === "") return;
      createDriver({
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim() || null,
        licenseNumber: licenseNumber.trim() || null,
        licenseState: licenseState.trim() || null,
        truckNumber: truckNumber.trim() || null,
        note: note.trim() || null,
      });
    } else {
      updateDriver({
        id: modal.driver.id,
        payload: {
          name: name.trim(),
          phone: phone.trim() || null,
          licenseNumber: licenseNumber.trim() || null,
          licenseState: licenseState.trim() || null,
          truckNumber: truckNumber.trim() || null,
          note: note.trim() || null,
        },
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {modal.type === "CREATE"
            ? t("driver.createTitle")
            : t("driver.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.email")} required>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending || modal.type === "EDIT"}
            placeholder={t("driver.emailPlaceholder")}
          />
        </Field>
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder={t("driver.namePlaceholder")}
          />
        </Field>
        <Field label={t("field.phone")}>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isPending}
            placeholder={t("driver.phonePlaceholder")}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("driver.field.licenseNumber")}>
            <Input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <Field label={t("driver.field.licenseState")}>
            <Input
              value={licenseState}
              onChange={(e) => setLicenseState(e.target.value)}
              disabled={isPending}
              placeholder="CA"
              maxLength={8}
            />
          </Field>
        </div>
        <Field label={t("driver.field.truckNumber")}>
          <Input
            value={truckNumber}
            onChange={(e) => setTruckNumber(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label={t("field.note")}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
          />
        </Field>
      </div>

      {modal.type === "CREATE" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          {t("driver.tempPasswordWarning")}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            isPending ||
            !name.trim() ||
            (modal.type === "CREATE" && !email.trim())
          }
        >
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
