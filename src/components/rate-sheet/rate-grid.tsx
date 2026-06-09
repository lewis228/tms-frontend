import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useRateSheetEntriesData } from "@/hooks/queries/use-rate-sheet-entries-data";
import { useSetRateEntry } from "@/hooks/mutations/rate-sheet/use-set-rate-entry";
import type { SetRateEntryPayload } from "@/api/rate-sheet";
import { formatDate } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import type { RateContainerSize, RateEntryEntity, SheetKind } from "@/types";

const CONTAINER_SIZES: RateContainerSize[] = ["SIZE_20", "SIZE_40", "SIZE_45"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function columnLabel(e: RateEntryEntity): string {
  if (e.colZoneId != null) return `Zone #${e.colZoneId}`;
  if (e.colPointId != null) return `Point #${e.colPointId}`;
  if (e.colCity) return e.colState ? `${e.colCity}, ${e.colState}` : e.colCity;
  return "—";
}

export default function RateGrid({
  sheetId,
  kind,
}: {
  sheetId: number;
  kind: SheetKind;
}) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateSheetEntriesData(sheetId);

  const isZone = kind === "POINT_ZONE";
  const isCity = kind === "POINT_CITY";
  const isPoint = kind === "POINT_POINT";
  const isPerUnit = kind === "MILE" || kind === "HOURLY";
  const hasContainerSize = isZone || isCity || isPoint;

  const [colZoneId, setColZoneId] = useState("");
  const [colPointId, setColPointId] = useState("");
  const [colCity, setColCity] = useState("");
  const [colState, setColState] = useState("");
  const [containerSize, setContainerSize] =
    useState<RateContainerSize>("SIZE_40");
  const [amount, setAmount] = useState("");
  const [perUnit, setPerUnit] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(todayIso());
  const [reason, setReason] = useState("");

  const { mutate: setRateEntry, isPending: isSetPending } = useSetRateEntry({
    onSuccess: () => {
      toast.success(t("toast.saved"), { position: "top-center" });
      setColZoneId("");
      setColPointId("");
      setColCity("");
      setColState("");
      setAmount("");
      setPerUnit("");
      setReason("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleSet = () => {
    if (effectiveFrom.trim() === "") return;
    const payload: SetRateEntryPayload = { effectiveFrom };
    if (isZone) payload.colZoneId = colZoneId ? Number(colZoneId) : null;
    if (isPoint) payload.colPointId = colPointId ? Number(colPointId) : null;
    if (isCity) {
      payload.colCity = colCity.trim() || null;
      payload.colState = colState.trim() || null;
    }
    if (hasContainerSize) payload.containerSize = containerSize;
    if (isPerUnit) {
      payload.perUnit = perUnit.trim() || null;
    } else {
      payload.amount = amount.trim() || null;
    }
    payload.reason = reason.trim() || null;
    setRateEntry({ id: sheetId, payload });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rateSheet.grid.column")}</TableHead>
              {hasContainerSize && (
                <TableHead>{t("rateSheet.grid.containerSize")}</TableHead>
              )}
              <TableHead>{t("rateSheet.grid.amount")}</TableHead>
              <TableHead>{t("rateSheet.grid.perUnit")}</TableHead>
              <TableHead>{t("rateSheet.grid.effectiveFrom")}</TableHead>
              <TableHead>{t("rateSheet.grid.effectiveTo")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasContainerSize ? 6 : 5}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {columnLabel(e)}
                  </TableCell>
                  {hasContainerSize && (
                    <TableCell>
                      {e.containerSize
                        ? t(`rateSheet.containerSize.${e.containerSize}`)
                        : "—"}
                    </TableCell>
                  )}
                  <TableCell>{e.amount ?? "—"}</TableCell>
                  <TableCell>{e.perUnit ?? "—"}</TableCell>
                  <TableCell>{formatDate(e.effectiveFrom)}</TableCell>
                  <TableCell>
                    {e.effectiveTo ? formatDate(e.effectiveTo) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-md border p-4">
        <span className="text-sm font-semibold">{t("rateSheet.grid.setTitle")}</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {isZone && (
            <Field label={t("rateSheet.grid.colZoneId")}>
              <Input
                value={colZoneId}
                onChange={(e) => setColZoneId(e.target.value)}
                disabled={isSetPending}
                inputMode="numeric"
                placeholder="123"
              />
            </Field>
          )}
          {isPoint && (
            <Field label={t("rateSheet.grid.colPointId")}>
              <Input
                value={colPointId}
                onChange={(e) => setColPointId(e.target.value)}
                disabled={isSetPending}
                inputMode="numeric"
                placeholder="123"
              />
            </Field>
          )}
          {isCity && (
            <>
              <Field label={t("rateSheet.grid.colCity")}>
                <Input
                  value={colCity}
                  onChange={(e) => setColCity(e.target.value)}
                  disabled={isSetPending}
                  maxLength={120}
                />
              </Field>
              <Field label={t("rateSheet.grid.colState")}>
                <Input
                  value={colState}
                  onChange={(e) => setColState(e.target.value)}
                  disabled={isSetPending}
                  maxLength={8}
                />
              </Field>
            </>
          )}
          {hasContainerSize && (
            <Field label={t("rateSheet.grid.containerSize")}>
              <select
                value={containerSize}
                onChange={(e) =>
                  setContainerSize(e.target.value as RateContainerSize)
                }
                disabled={isSetPending}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {CONTAINER_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {t(`rateSheet.containerSize.${s}`)}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {isPerUnit ? (
            <Field label={t("rateSheet.grid.perUnit")}>
              <Input
                value={perUnit}
                onChange={(e) => setPerUnit(e.target.value)}
                disabled={isSetPending}
                inputMode="decimal"
                placeholder="2.50"
              />
            </Field>
          ) : (
            <Field label={t("rateSheet.grid.amount")}>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSetPending}
                inputMode="decimal"
                placeholder="350.00"
              />
            </Field>
          )}
          <Field label={t("rateSheet.grid.effectiveFrom")}>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              disabled={isSetPending}
            />
          </Field>
          <Field label={t("rateSheet.grid.reason")}>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSetPending}
              maxLength={500}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSet}
            disabled={isSetPending || effectiveFrom.trim() === ""}
          >
            {t("rateSheet.grid.setButton")}
          </Button>
        </div>
      </div>
    </div>
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
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
