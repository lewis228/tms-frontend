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
import { useCreateTerminal } from "@/hooks/mutations/terminal/use-create-terminal";
import { useUpdateTerminal } from "@/hooks/mutations/terminal/use-update-terminal";
import { generateErrorMessage } from "@/lib/error";
import { useTerminalEditorModal } from "@/store/terminal-editor-modal";

export default function TerminalEditorModal() {
  const modal = useTerminalEditorModal();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!modal.isOpen) return;
    if (modal.type === "CREATE") {
      setName("");
      setCode("");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setNote("");
    } else {
      setName(modal.terminal.name);
      setCode(modal.terminal.code ?? "");
      setAddress(modal.terminal.address ?? "");
      setLatitude(modal.terminal.latitude ?? "");
      setLongitude(modal.terminal.longitude ?? "");
      setNote(modal.terminal.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

  const { mutate: createTerminal, isPending: isCreatePending } = useCreateTerminal({
    onSuccess: () => {
      toast.success("터미널이 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateTerminal, isPending: isUpdatePending } = useUpdateTerminal({
    onSuccess: () => {
      toast.success("터미널이 수정되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const isPending = isCreatePending || isUpdatePending;

  const parseLatLng = (s: string): number | null => {
    const v = s.trim();
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = () => {
    if (!modal.isOpen) return;
    if (name.trim() === "") return;
    const payload = {
      name: name.trim(),
      code: code.trim() || null,
      address: address.trim() || null,
      latitude: parseLatLng(latitude),
      longitude: parseLatLng(longitude),
      note: note.trim() || null,
    };
    if (modal.type === "CREATE") {
      createTerminal(payload);
    } else {
      updateTerminal({ id: modal.terminal.id, payload });
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {modal.isOpen && modal.type === "CREATE"
              ? "터미널 생성"
              : "터미널 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Field label="이름" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="LBCT"
            />
          </Field>
          <Field label="코드 (UN/LOCODE 등)">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              placeholder="USLAX"
              maxLength={32}
            />
          </Field>
          <Field label="주소">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isPending}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="위도">
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={isPending}
                placeholder="33.7350"
                inputMode="decimal"
              />
            </Field>
            <Field label="경도">
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={isPending}
                placeholder="-118.2659"
                inputMode="decimal"
              />
            </Field>
          </div>
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
