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
import CityAutocomplete from "@/components/city-autocomplete";
import { useRateZonesData } from "@/hooks/queries/use-rate-zones-data";
import { useSetRateGroupEntry } from "@/hooks/mutations/rate-group/use-set-rate-group-entry";
import { generateErrorMessage } from "@/lib/error";
import { US_STATES } from "@/lib/us-states";
import { useRateEntryEditorModal } from "@/store/rate-entry-editor-modal";
import type {
  FlatRateEntryInput,
  RateContainerSize,
  RateMoveType,
  RateServiceType,
} from "@/types";

const MOVE_TYPES: RateMoveType[] = ["LOAD", "EMPTY", "NONE"];
const SERVICE_TYPES: RateServiceType[] = ["LIVE", "DROP", "NONE"];
const SIZES: RateContainerSize[] = ["SIZE_20", "SIZE_40", "SIZE_45"];
const SELECT_CLASS = "h-9 w-full rounded-md border bg-background px-2 text-sm";

type OpenModal = Extract<
  ReturnType<typeof useRateEntryEditorModal>,
  { isOpen: true }
>;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function RateEntryEditorModal() {
  const modal = useRateEntryEditorModal();
  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(o) => !o && modal.actions.close()}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {modal.isOpen && <Body key={`g-${modal.groupId}`} modal={modal} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ modal }: { modal: OpenModal }) {
  const { t } = useTranslation();
  const isMatrix = modal.method === "ZONE" || modal.method === "CITY";

  const { data: zonesData } = useRateZonesData();
  const zones = zonesData?.items ?? [];

  const [move, setMove] = useState<RateMoveType>(modal.presetMove ?? "LOAD");
  const [service, setService] = useState<RateServiceType>(
    modal.presetService ?? "LIVE",
  );
  const [size, setSize] = useState<RateContainerSize>(
    modal.presetSize ?? "SIZE_40",
  );
  const [fromZoneId, setFromZoneId] = useState<number | "">(
    modal.presetFromZoneId ?? "",
  );
  const [toZoneId, setToZoneId] = useState<number | "">(
    modal.presetToZoneId ?? "",
  );
  const [fromCity, setFromCity] = useState(modal.presetFromCity ?? "");
  const [fromState, setFromState] = useState(modal.presetFromState ?? "CA");
  const [toCity, setToCity] = useState(modal.presetToCity ?? "");
  const [toState, setToState] = useState(modal.presetToState ?? "CA");
  const [amount, setAmount] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(todayISO());

  const { mutate: setEntry, isPending } = useSetRateGroupEntry(modal.groupId, {
    onSuccess: () => {
      toast.success(t("toast.saved"), { position: "top-center" });
      modal.actions.close();
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    if (!amount.trim()) return;
    const payload: FlatRateEntryInput = {
      effectiveFrom,
      containerSize: isMatrix ? size : null,
      amount: isMatrix ? amount : null,
      perUnit: isMatrix ? null : amount,
    };
    if (isMatrix) {
      payload.moveType = move;
      payload.serviceType = service;
      if (modal.method === "ZONE") {
        if (fromZoneId === "" || toZoneId === "") return;
        payload.fromZoneId = fromZoneId;
        payload.toZoneId = toZoneId;
      } else {
        if (!fromCity.trim() || !toCity.trim()) return;
        payload.fromCity = fromCity.trim();
        payload.fromState = fromState;
        payload.toCity = toCity.trim();
        payload.toState = toState;
      }
    }
    setEntry(payload);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {t("rateEntry.createTitle")}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        {isMatrix && (
          <div className="grid grid-cols-3 gap-2">
            <Field label={t("rateEntry.field.move")}>
              <select
                className={SELECT_CLASS}
                value={move}
                onChange={(e) => setMove(e.target.value as RateMoveType)}
                disabled={isPending}
              >
                {MOVE_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {t(`rateEntry.move.${m}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("rateEntry.field.service")}>
              <select
                className={SELECT_CLASS}
                value={service}
                onChange={(e) =>
                  setService(e.target.value as RateServiceType)
                }
                disabled={isPending}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {t(`rateEntry.service.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("rateEntry.field.size")}>
              <select
                className={SELECT_CLASS}
                value={size}
                onChange={(e) => setSize(e.target.value as RateContainerSize)}
                disabled={isPending}
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {t(`rateEntry.size.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {modal.method === "ZONE" && (
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("rateEntry.field.from")}>
              <select
                className={SELECT_CLASS}
                value={fromZoneId}
                onChange={(e) =>
                  setFromZoneId(e.target.value ? Number(e.target.value) : "")
                }
                disabled={isPending}
              >
                <option value="">—</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.code ?? z.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("rateEntry.field.to")}>
              <select
                className={SELECT_CLASS}
                value={toZoneId}
                onChange={(e) =>
                  setToZoneId(e.target.value ? Number(e.target.value) : "")
                }
                disabled={isPending}
              >
                <option value="">—</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.code ?? z.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {modal.method === "CITY" && (
          <div className="grid grid-cols-2 gap-2">
            <Field label={t("rateEntry.field.from")}>
              <div className="flex gap-1">
                <CityAutocomplete
                  value={fromCity}
                  state={fromState}
                  onChange={setFromCity}
                  placeholder={t("rateEntry.cityPlaceholder")}
                  className="h-9 w-full min-w-[8rem] flex-1"
                />
                <StateSelect value={fromState} onChange={setFromState} />
              </div>
            </Field>
            <Field label={t("rateEntry.field.to")}>
              <div className="flex gap-1">
                <CityAutocomplete
                  value={toCity}
                  state={toState}
                  onChange={setToCity}
                  placeholder={t("rateEntry.cityPlaceholder")}
                  className="h-9 w-full min-w-[8rem] flex-1"
                />
                <StateSelect value={toState} onChange={setToState} />
              </div>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Field
            label={
              isMatrix
                ? t("rateEntry.field.amount")
                : t("rateEntry.field.perUnit")
            }
          >
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              disabled={isPending}
            />
          </Field>
          <Field label={t("rateEntry.field.effectiveFrom")}>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              disabled={isPending}
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          onClick={() => modal.actions.close()}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave} disabled={isPending || !amount.trim()}>
          {t("common.save")}
        </Button>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function StateSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      className={`${SELECT_CLASS} w-20`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {US_STATES.map((s) => (
        <option key={s.code} value={s.code}>
          {s.code}
        </option>
      ))}
    </select>
  );
}
