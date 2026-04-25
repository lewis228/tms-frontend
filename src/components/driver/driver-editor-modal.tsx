// Driver 생성/수정 모달.
// 생성: email/name/phone + driver 메타. 백엔드가 user 자동 생성 + tempPassword 1회 응답.
//       성공 시 임시비번 모달 띄움.
// 수정: email 은 readonly (User 와 분리). name/phone/license/truck/note 만.
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
import { useCreateDriver } from "@/hooks/mutations/driver/use-create-driver";
import { useUpdateDriver } from "@/hooks/mutations/driver/use-update-driver";
import { generateErrorMessage } from "@/lib/error";
import { useDriverEditorModal } from "@/store/driver-editor-modal";
import { useOpenDriverTempPasswordModal } from "@/store/driver-temp-password-modal";

export default function DriverEditorModal() {
  const modal = useDriverEditorModal();
  const openTempPwModal = useOpenDriverTempPasswordModal();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [truckNumber, setTruckNumber] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!modal.isOpen) return;
    if (modal.type === "CREATE") {
      setEmail("");
      setName("");
      setPhone("");
      setLicenseNumber("");
      setLicenseState("");
      setTruckNumber("");
      setNote("");
    } else {
      setEmail(modal.driver.email);
      setName(modal.driver.name);
      setPhone(modal.driver.phone ?? "");
      setLicenseNumber(modal.driver.licenseNumber ?? "");
      setLicenseState(modal.driver.licenseState ?? "");
      setTruckNumber(modal.driver.truckNumber ?? "");
      setNote(modal.driver.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

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
      toast.success("기사 정보가 수정되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;

  const handleSave = () => {
    if (!modal.isOpen) return;
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
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {modal.isOpen && modal.type === "CREATE" ? "기사 생성" : "기사 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Field label="이메일" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending || (modal.isOpen && modal.type === "EDIT")}
              placeholder="driver@example.com"
            />
          </Field>
          <Field label="이름" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="홍길동"
            />
          </Field>
          <Field label="전화">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              placeholder="+1 213 555 0100"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="면허 번호">
              <Input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                disabled={isPending}
              />
            </Field>
            <Field label="면허 주">
              <Input
                value={licenseState}
                onChange={(e) => setLicenseState(e.target.value)}
                disabled={isPending}
                placeholder="CA"
                maxLength={8}
              />
            </Field>
          </div>
          <Field label="차량 번호">
            <Input
              value={truckNumber}
              onChange={(e) => setTruckNumber(e.target.value)}
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

        {modal.isOpen && modal.type === "CREATE" && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            ⚠️ 생성 후 1회만 노출되는 <b>임시 비밀번호</b>가 발급됩니다. 닫기 전에
            반드시 안전하게 저장하세요.
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => modal.actions.close()}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isPending ||
              !name.trim() ||
              (modal.isOpen && modal.type === "CREATE" && !email.trim())
            }
          >
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
