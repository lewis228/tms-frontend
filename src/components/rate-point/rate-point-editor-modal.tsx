import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { fetchTerminal, fetchTerminals } from "@/api/terminal";
import { fetchLocation, fetchLocations } from "@/api/location";
import SearchableSelect from "@/components/searchable-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateRatePoint } from "@/hooks/mutations/rate-point/use-create-rate-point";
import { useUpdateRatePoint } from "@/hooks/mutations/rate-point/use-update-rate-point";
import { generateErrorMessage } from "@/lib/error";
import { useRatePointEditorModal } from "@/store/rate-point-editor-modal";
import type {
  LocationEntity,
  PointType,
  TerminalEntity,
} from "@/types";

const SEARCH_SIZE = 50;
const POINT_TYPES: PointType[] = ["TERMINAL", "YARD"];

type OpenModal = Extract<
  ReturnType<typeof useRatePointEditorModal>,
  { isOpen: true }
>;

export default function RatePointEditorModal() {
  const modal = useRatePointEditorModal();
  return (
    <Dialog open={modal.isOpen} onOpenChange={(o) => !o && modal.actions.close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {modal.isOpen && (
          <Body
            key={modal.type === "EDIT" ? `e-${modal.ratePoint.id}` : "c"}
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
    modal.type === "CREATE" ? "" : modal.ratePoint.name,
  );
  const [code, setCode] = useState(
    modal.type === "CREATE" ? "" : (modal.ratePoint.code ?? ""),
  );
  const [pointType, setPointType] = useState<PointType>(
    modal.type === "CREATE" ? "TERMINAL" : modal.ratePoint.pointType,
  );
  const [address, setAddress] = useState(
    modal.type === "CREATE" ? "" : (modal.ratePoint.address ?? ""),
  );
  const [latitude, setLatitude] = useState(
    modal.type === "CREATE" ? "" : (modal.ratePoint.latitude ?? ""),
  );
  const [longitude, setLongitude] = useState(
    modal.type === "CREATE" ? "" : (modal.ratePoint.longitude ?? ""),
  );
  const [terminalId, setTerminalId] = useState<number | null>(
    modal.type === "CREATE" ? null : modal.ratePoint.terminalId,
  );
  const [locationId, setLocationId] = useState<number | null>(
    modal.type === "CREATE" ? null : modal.ratePoint.locationId,
  );
  const [note, setNote] = useState(
    modal.type === "CREATE" ? "" : (modal.ratePoint.note ?? ""),
  );

  const { mutate: createRatePoint, isPending: isCreatePending } =
    useCreateRatePoint({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: updateRatePoint, isPending: isUpdatePending } =
    useUpdateRatePoint({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        modal.actions.close();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const isPending = isCreatePending || isUpdatePending;

  const trimOrNull = (s: string): string | null => {
    const v = s.trim();
    return v === "" ? null : v;
  };

  const handleSave = () => {
    if (name.trim() === "") return;
    const payload = {
      name: name.trim(),
      code: trimOrNull(code),
      pointType,
      address: trimOrNull(address),
      latitude: trimOrNull(latitude),
      longitude: trimOrNull(longitude),
      terminalId,
      locationId,
      note: trimOrNull(note),
    };
    if (modal.type === "CREATE") {
      createRatePoint(payload);
    } else {
      updateRatePoint({ id: modal.ratePoint.id, payload });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t(
            modal.type === "CREATE"
              ? "ratePoint.createTitle"
              : "ratePoint.editTitle",
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <Field label={t("field.name")} required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            maxLength={200}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("field.code")}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              maxLength={64}
            />
          </Field>
          <Field label={t("ratePoint.field.pointType")} required>
            <select
              value={pointType}
              onChange={(e) => setPointType(e.target.value as PointType)}
              disabled={isPending}
              className="rounded-md border bg-background px-3 py-2 text-sm"
            >
              {POINT_TYPES.map((p) => (
                <option key={p} value={p}>
                  {t(`ratePoint.pointTypeOption.${p}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={t("field.address")}>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isPending}
            maxLength={500}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("ratePoint.field.latitude")}>
            <Input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isPending}
              placeholder="33.7350"
              inputMode="decimal"
            />
          </Field>
          <Field label={t("ratePoint.field.longitude")}>
            <Input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={isPending}
              placeholder="-118.2659"
              inputMode="decimal"
            />
          </Field>
        </div>
        <Field label={t("ratePoint.field.terminal")}>
          <SearchableSelect<TerminalEntity>
            value={terminalId}
            onSelect={(id) => setTerminalId(id)}
            fetchList={(q) =>
              fetchTerminals({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchTerminal(id)}
            queryKeyBase={["terminal", "search"]}
            getLabel={(item) => item.name}
            placeholder={t("ratePoint.terminalPlaceholder")}
            emptyLabel={t("common.noSelection")}
            disabled={isPending}
          />
        </Field>
        <Field label={t("ratePoint.field.location")}>
          <SearchableSelect<LocationEntity>
            value={locationId}
            onSelect={(id) => setLocationId(id)}
            fetchList={(q) =>
              fetchLocations({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchLocation(id)}
            queryKeyBase={["location", "search"]}
            getLabel={(item) => `${item.name} (${item.kind})`}
            placeholder={t("ratePoint.locationPlaceholder")}
            emptyLabel={t("common.noSelection")}
            disabled={isPending}
          />
        </Field>
        <Field label={t("field.note")}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isPending}
            maxLength={3000}
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
