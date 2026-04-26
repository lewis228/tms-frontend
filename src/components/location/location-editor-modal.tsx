// Location 생성/수정 모달.
// kind=CUSTOMER 일 때만 customerId select 활성화. 그 외에는 customerId=null.
import { useState } from "react";
import { toast } from "sonner";

import { fetchCustomer, fetchCustomers } from "@/api/customer";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateLocation } from "@/hooks/mutations/location/use-create-location";
import { useUpdateLocation } from "@/hooks/mutations/location/use-update-location";
import { generateErrorMessage } from "@/lib/error";
import { useLocationEditorModal } from "@/store/location-editor-modal";
import type { CustomerEntity, LocationKind } from "@/types";

const SEARCH_SIZE = 50;

const KINDS: LocationKind[] = ["YARD", "CUSTOMER", "PORT", "OTHER"];

type OpenModal = Extract<
  ReturnType<typeof useLocationEditorModal>,
  { isOpen: true }
>;

export default function LocationEditorModal() {
  const modal = useLocationEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent>
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.location.id}` : "c"}
            modal={modal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const [name, setName] = useState(
    modal.type === "CREATE" ? "" : modal.location.name,
  );
  const [kind, setKind] = useState<LocationKind>(
    modal.type === "CREATE" ? "YARD" : modal.location.kind,
  );
  const [address, setAddress] = useState(
    modal.type === "CREATE" ? "" : (modal.location.address ?? ""),
  );
  const [latitude, setLatitude] = useState(
    modal.type === "CREATE" ? "" : (modal.location.latitude ?? ""),
  );
  const [longitude, setLongitude] = useState(
    modal.type === "CREATE" ? "" : (modal.location.longitude ?? ""),
  );
  const [customerId, setCustomerId] = useState<string>(
    modal.type === "CREATE" ? "" : (modal.location.customerId ?? ""),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.location.note ?? ""),
  );

  const handleKindChange = (next: LocationKind) => {
    setKind(next);
    // kind 가 CUSTOMER 가 아니면 customerId 자동 제거. user 액션에 따른 명시적 동기화.
    if (next !== "CUSTOMER") setCustomerId("");
  };

  const { mutate: createLocation, isPending: isCreatePending } =
    useCreateLocation({
      onSuccess: () => {
        toast.success("장소가 생성되었습니다.", { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateLocation, isPending: isUpdatePending } =
    useUpdateLocation({
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
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {modal.type === "CREATE" ? "장소 생성" : "장소 수정"}
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
            onChange={(e) => handleKindChange(e.target.value as LocationKind)}
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
          <SearchableSelect<CustomerEntity>
            value={customerId}
            onSelect={(id) => setCustomerId(id)}
            fetchList={(q) =>
              fetchCustomers({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchCustomer(id)}
            queryKeyBase={["customer", "search"]}
            getLabel={(c) => `${c.name}${c.code ? ` (${c.code})` : ""}`}
            placeholder="— 선택 —"
            emptyLabel="— 선택 안함 —"
            disabled={isPending || kind !== "CUSTOMER"}
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
