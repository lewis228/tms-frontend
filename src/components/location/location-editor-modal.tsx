// Location 생성/수정 모달.
// kind=CUSTOMER 일 때만 customerId select 활성화. 그 외에는 customerId=null.
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
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useCreateLocation } from "@/hooks/mutations/location/use-create-location";
import { useUpdateLocation } from "@/hooks/mutations/location/use-update-location";
import { generateErrorMessage } from "@/lib/error";
import { useLocationEditorModal } from "@/store/location-editor-modal";
import type { LocationKind } from "@/types";

const KINDS: LocationKind[] = ["YARD", "CUSTOMER", "PORT", "OTHER"];

export default function LocationEditorModal() {
  const modal = useLocationEditorModal();

  const [name, setName] = useState("");
  const [kind, setKind] = useState<LocationKind>("YARD");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [note, setNote] = useState("");

  // customers 는 kind=CUSTOMER 일 때만 fetch.
  const { data: customersData } = useCustomersData(1);

  useEffect(() => {
    if (!modal.isOpen) return;
    if (modal.type === "CREATE") {
      setName("");
      setKind("YARD");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setCustomerId("");
      setNote("");
    } else {
      setName(modal.location.name);
      setKind(modal.location.kind);
      setAddress(modal.location.address ?? "");
      setLatitude(modal.location.latitude ?? "");
      setLongitude(modal.location.longitude ?? "");
      setCustomerId(modal.location.customerId ?? "");
      setNote(modal.location.note ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.isOpen]);

  // kind 가 CUSTOMER 가 아니면 customerId 자동 제거.
  useEffect(() => {
    if (kind !== "CUSTOMER" && customerId) setCustomerId("");
  }, [kind, customerId]);

  const { mutate: createLocation, isPending: isCreatePending } = useCreateLocation({
    onSuccess: () => {
      toast.success("장소가 생성되었습니다.", { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateLocation, isPending: isUpdatePending } = useUpdateLocation({
    onSuccess: () => {
      toast.success("장소가 수정되었습니다.", { position: "top-center" });
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
    if (kind === "CUSTOMER" && !customerId) {
      toast.error("CUSTOMER 종류는 customer 를 선택해야 합니다.", {
        position: "top-center",
      });
      return;
    }
    const payload = {
      name: name.trim(),
      kind,
      address: address.trim() || null,
      latitude: parseLatLng(latitude),
      longitude: parseLatLng(longitude),
      customerId: kind === "CUSTOMER" ? customerId : null,
      note: note.trim() || null,
    };
    if (modal.type === "CREATE") {
      createLocation(payload);
    } else {
      updateLocation({ id: modal.location.id, payload });
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">
            {modal.isOpen && modal.type === "CREATE" ? "장소 생성" : "장소 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Field label="이름" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="Acme Yard A"
            />
          </Field>
          <Field label="종류" required>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as LocationKind)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="고객사 (kind=CUSTOMER 인 경우 필수)">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={isPending || kind !== "CUSTOMER"}
              className="rounded-md border bg-background px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">— 선택 —</option>
              {(customersData?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.code ? ` (${c.code})` : ""}
                </option>
              ))}
            </select>
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
                inputMode="decimal"
              />
            </Field>
            <Field label="경도">
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={isPending}
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
