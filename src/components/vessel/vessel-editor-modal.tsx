// Vessel 생성 / 수정 모달.
// modal.isOpen 이 true 일 때만 Body 마운트 + key 로 type/id 변경 시 자동 리셋.
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
import { useCreateVessel } from "@/hooks/mutations/vessel/use-create-vessel";
import { useUpdateVessel } from "@/hooks/mutations/vessel/use-update-vessel";
import { generateErrorMessage } from "@/lib/error";
import { useVesselEditorModal } from "@/store/vessel-editor-modal";

type OpenModal = Extract<
  ReturnType<typeof useVesselEditorModal>,
  { isOpen: true }
>;

export default function VesselEditorModal() {
  const modal = useVesselEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.vessel.id}` : "c"}
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
    modal.type === "CREATE" ? "" : modal.vessel.name,
  );
  const [imoNumber, setImoNumber] = useState(
    modal.type === "CREATE" ? "" : (modal.vessel.imoNumber ?? ""),
  );
  const [line, setLine] = useState(
    modal.type === "CREATE" ? "" : (modal.vessel.line ?? ""),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.vessel.note ?? ""),
  );

  const { mutate: createVessel, isPending: isCreatePending } = useCreateVessel({
    onSuccess: () => {
      toast.success(t("toast.created"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateVessel, isPending: isUpdatePending } = useUpdateVessel({
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
      imoNumber: imoNumber.trim() || null,
      line: line.trim() || null,
      note: note.trim() || null,
    };
    if (modal.type === "CREATE") {
      createVessel(payload);
    } else {
      updateVessel({ id: modal.vessel.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(modal.type === "CREATE" ? "vessel.createTitle" : "vessel.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="OOCL Hong Kong"
          />
        </Field>
        <Field label={t("vessel.field.imoNumber")}>
          <Input
            value={imoNumber}
            onChange={(e) => setImoNumber(e.target.value)}
            disabled={isPending}
            placeholder="9776171"
            maxLength={16}
          />
        </Field>
        <Field label={t("vessel.field.line")}>
          <Input
            value={line}
            onChange={(e) => setLine(e.target.value)}
            disabled={isPending}
            placeholder="OOCL"
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
