// Location 생성/수정 모달.
// kind=CUSTOMER 일 때만 customerId select 활성화. 그 외에는 customerId=null.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { fetchCustomer, fetchCustomers } from "@/api/customer";
import SearchableSelect from "@/components/searchable-select";
import ZipPicker from "@/components/zip-picker";
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
  const { t } = useTranslation();
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
  const [customerId, setCustomerId] = useState<number | null>(
    modal.type === "CREATE" ? null : (modal.location.customerId ?? null),
  );
  const [zipId, setZipId] = useState<number | null>(
    modal.type === "CREATE" ? null : (modal.location.zipId ?? null),
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.location.note ?? ""),
  );

  const handleKindChange = (next: LocationKind) => {
    setKind(next);
    // kind 가 CUSTOMER 가 아니면 customerId 자동 제거. user 액션에 따른 명시적 동기화.
    if (next !== "CUSTOMER") setCustomerId(null);
  };

  const { mutate: createLocation, isPending: isCreatePending } =
    useCreateLocation({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateLocation, isPending: isUpdatePending } =
    useUpdateLocation({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
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
      toast.error(t("location.validation.customerRequired"), {
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
      customerId: kind === "CUSTOMER" ? (customerId ?? null) : null,
      zipId,
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
          {t(modal.type === "CREATE" ? "location.createTitle" : "location.editTitle")}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Acme Yard A"
          />
        </Field>
        <Field label={t("location.field.kind")} required>
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
        <Field label={t("location.field.customerLabel")}>
          <SearchableSelect<CustomerEntity>
            value={customerId}
            onSelect={(id) => setCustomerId(id)}
            fetchList={(q) =>
              fetchCustomers({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchCustomer(id)}
            queryKeyBase={["customer", "search"]}
            getLabel={(c) => `${c.name}${c.code ? ` (${c.code})` : ""}`}
            placeholder={t("common.selectPlaceholder")}
            emptyLabel={t("common.noSelection")}
            disabled={isPending || kind !== "CUSTOMER"}
          />
        </Field>
        <Field label={t("field.address")}>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isPending}
          />
        </Field>
        <Field label={t("field.zip")}>
          <ZipPicker value={zipId} onSelect={setZipId} disabled={isPending} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("location.field.latitude")}>
            <Input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isPending}
              inputMode="decimal"
            />
          </Field>
          <Field label={t("location.field.longitude")}>
            <Input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={isPending}
              inputMode="decimal"
            />
          </Field>
        </div>
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
