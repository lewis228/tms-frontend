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
import ZipStringPicker from "@/components/zip-string-picker";
import { useRateZonesData } from "@/hooks/queries/use-rate-zones-data";
import { useSetRateGroupEntry } from "@/hooks/mutations/rate-group/use-set-rate-group-entry";
import { generateErrorMessage } from "@/lib/error";
import { US_STATES } from "@/lib/us-states";
import { useRateEntryEditorModal } from "@/store/rate-entry-editor-modal";
import type {
  FlatRateEntryInput,
  RateMethod,
  RateMoveType,
  RateServiceType,
} from "@/types";

const MOVE_TYPES: RateMoveType[] = ["LOAD", "EMPTY", "NONE"];
const SERVICE_TYPES: RateServiceType[] = ["LIVE", "DROP", "NONE"];
const SELECT_CLASS = "h-9 w-full rounded-md border bg-background px-2 text-sm";

// 매트릭스 방식의 각 변 좌표 타입. ZIP 방식 = [존|ZIP], CITY 방식 = [존|도시].
type CoordType = "ZONE" | "ZIP" | "CITY";

type OpenModal = Extract<
  ReturnType<typeof useRateEntryEditorModal>,
  { isOpen: true }
>;

function todayISO(): string {
  // 로컬 날짜 기준 — UTC toISOString() 은 시차로 하루가 어긋날 수 있다.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const isMatrix = modal.method === "ZIP" || modal.method === "CITY";

  // 프리셋 좌표가 있으면 그 타입으로, 없으면 ZIP=존 / CITY=도시 가 기본.
  const initCoordType = (
    zoneId: number | undefined,
    zip: string | null | undefined
  ): CoordType => {
    if (zoneId != null) return "ZONE";
    if (modal.method === "ZIP") return zip ? "ZIP" : "ZONE";
    return "CITY";
  };

  const { data: zonesData } = useRateZonesData();
  const zones = zonesData?.items ?? [];

  const [move, setMove] = useState<RateMoveType>(modal.presetMove ?? "LOAD");
  const [service, setService] = useState<RateServiceType>(
    modal.presetService ?? "LIVE"
  );
  const [fromType, setFromType] = useState<CoordType>(
    initCoordType(modal.presetFromZoneId, modal.presetFromZip)
  );
  const [toType, setToType] = useState<CoordType>(
    initCoordType(modal.presetToZoneId, modal.presetToZip)
  );
  const [fromZoneId, setFromZoneId] = useState<number | "">(
    modal.presetFromZoneId ?? ""
  );
  const [toZoneId, setToZoneId] = useState<number | "">(
    modal.presetToZoneId ?? ""
  );
  const [fromZip, setFromZip] = useState<string | null>(
    modal.presetFromZip ?? null
  );
  const [toZip, setToZip] = useState<string | null>(modal.presetToZip ?? null);
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
      amount: isMatrix ? amount : null,
      perUnit: isMatrix ? null : amount,
    };
    if (isMatrix) {
      payload.moveType = move;
      payload.serviceType = service;
      // 변마다 zip | zone | city 중 정확히 하나만 보낸다 (나머지는 null).
      payload.fromZoneId = null;
      payload.fromZip = null;
      payload.fromCity = null;
      payload.fromState = null;
      payload.toZoneId = null;
      payload.toZip = null;
      payload.toCity = null;
      payload.toState = null;
      if (fromType === "ZONE") {
        if (fromZoneId === "") return;
        payload.fromZoneId = fromZoneId;
      } else if (fromType === "ZIP") {
        if (!fromZip) return;
        payload.fromZip = fromZip;
      } else {
        if (!fromCity.trim()) return;
        payload.fromCity = fromCity.trim();
        payload.fromState = fromState;
      }
      if (toType === "ZONE") {
        if (toZoneId === "") return;
        payload.toZoneId = toZoneId;
      } else if (toType === "ZIP") {
        if (!toZip) return;
        payload.toZip = toZip;
      } else {
        if (!toCity.trim()) return;
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
          <div className="grid grid-cols-2 gap-2">
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
                onChange={(e) => setService(e.target.value as RateServiceType)}
                disabled={isPending}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {t(`rateEntry.service.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {isMatrix && (
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-2 gap-2">
              <Field label={t("rateEntry.field.from")}>
                <div className="flex flex-col gap-1">
                  <CoordTypeToggle
                    method={modal.method}
                    value={fromType}
                    onChange={setFromType}
                    disabled={isPending}
                  />
                  {fromType === "ZONE" && (
                    <ZoneSelect
                      zones={zones}
                      value={fromZoneId}
                      onChange={setFromZoneId}
                      disabled={isPending}
                    />
                  )}
                  {fromType === "ZIP" && (
                    <ZipStringPicker
                      value={fromZip}
                      onSelect={setFromZip}
                      placeholder={t("rateEntry.zipPlaceholder")}
                      disabled={isPending}
                      scope={true}
                    />
                  )}
                  {fromType === "CITY" && (
                    <div className="flex gap-1">
                      <CityAutocomplete
                        value={fromCity}
                        state={fromState}
                        onChange={setFromCity}
                        placeholder={t("rateEntry.cityPlaceholder")}
                        className="h-9 w-full min-w-[8rem] flex-1"
                        scope={true}
                      />
                      <StateSelect value={fromState} onChange={setFromState} />
                    </div>
                  )}
                </div>
              </Field>
              <Field label={t("rateEntry.field.to")}>
                <div className="flex flex-col gap-1">
                  <CoordTypeToggle
                    method={modal.method}
                    value={toType}
                    onChange={setToType}
                    disabled={isPending}
                  />
                  {toType === "ZONE" && (
                    <ZoneSelect
                      zones={zones}
                      value={toZoneId}
                      onChange={setToZoneId}
                      disabled={isPending}
                    />
                  )}
                  {toType === "ZIP" && (
                    <ZipStringPicker
                      value={toZip}
                      onSelect={setToZip}
                      placeholder={t("rateEntry.zipPlaceholder")}
                      disabled={isPending}
                      scope={true}
                    />
                  )}
                  {toType === "CITY" && (
                    <div className="flex gap-1">
                      <CityAutocomplete
                        value={toCity}
                        state={toState}
                        onChange={setToCity}
                        placeholder={t("rateEntry.cityPlaceholder")}
                        className="h-9 w-full min-w-[8rem] flex-1"
                        scope={true}
                      />
                      <StateSelect value={toState} onChange={setToState} />
                    </div>
                  )}
                </div>
              </Field>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {t("rateEntry.bidirectionalHint")}
            </span>
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
      <span className="text-[10px] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

// 변 좌표 타입 토글 — ZIP 방식: [존|ZIP], CITY 방식: [존|도시].
function CoordTypeToggle({
  method,
  value,
  onChange,
  disabled,
}: {
  method: RateMethod;
  value: CoordType;
  onChange: (v: CoordType) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const options: CoordType[] =
    method === "ZIP" ? ["ZONE", "ZIP"] : ["ZONE", "CITY"];
  return (
    <div className="flex w-fit items-center gap-1 rounded-md bg-muted p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o)}
          className={`rounded px-2 py-0.5 text-xs ${value === o ? "bg-background shadow-sm" : ""}`}
        >
          {t(`rateEntry.coordType.${o.toLowerCase()}`)}
        </button>
      ))}
    </div>
  );
}

function ZoneSelect({
  zones,
  value,
  onChange,
  disabled,
}: {
  zones: { id: number; name: string; code: string | null }[];
  value: number | "";
  onChange: (v: number | "") => void;
  disabled?: boolean;
}) {
  return (
    <select
      className={SELECT_CLASS}
      value={value}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
      disabled={disabled}
    >
      <option value="">—</option>
      {zones.map((z) => (
        <option key={z.id} value={z.id}>
          {z.code ?? z.name}
        </option>
      ))}
    </select>
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
