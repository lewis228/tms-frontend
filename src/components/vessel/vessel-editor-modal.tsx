// Vessel 생성 / 수정 모달.
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
import { useCreateVessel } from "@/hooks/mutations/vessel/use-create-vessel";
import { useUpdateVessel } from "@/hooks/mutations/vessel/use-update-vessel";
import { generateErrorMessage } from "@/lib/error";
import { useVesselEditorModal } from "@/store/vessel-editor-modal";

export default function VesselEditorModal() {
  const modal = useVesselEditorModal();

  const [name, setName] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [line, setLine] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!modal.isOpen) return;
    if (modal.type === "CREATE") {
      setName("");
      setImoNumber("");
      setLine("");
      setNote("");
    } else {
      setName(modal.vessel.name);
      setImoNumber(modal.vessel.imoNumber ?? "");
      setLine(modal.vessel.line ?? "");
      setNote(modal.vessel.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

  const { mutate: createVessel, isPending: isCreatePending } = useCreateVessel({
    onSuccess: () => {
      toast.success("선박이 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateVessel, isPending: isUpdatePending } = useUpdateVessel({
    onSuccess: () => {
      toast.success("선박이 수정되었습니다.", { position: "top-center" });
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
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {modal.isOpen && modal.type === "CREATE" ? "선박 생성" : "선박 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Field label="이름" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="OOCL Hong Kong"
            />
          </Field>
          <Field label="IMO 번호">
            <Input
              value={imoNumber}
              onChange={(e) => setImoNumber(e.target.value)}
              disabled={isPending}
              placeholder="9776171"
              maxLength={16}
            />
          </Field>
          <Field label="선사">
            <Input
              value={line}
              onChange={(e) => setLine(e.target.value)}
              disabled={isPending}
              placeholder="OOCL"
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
