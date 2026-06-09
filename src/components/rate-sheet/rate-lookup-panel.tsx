import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lookupRateEntry } from "@/api/rate-sheet";
import { formatDate } from "@/lib/format";
import type { RateContainerSize, SheetKind } from "@/types";

const CONTAINER_SIZES: RateContainerSize[] = ["SIZE_20", "SIZE_40", "SIZE_45"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type LookupParams = {
  workDate: string;
  colZoneId?: number;
  colPointId?: number;
  colCity?: string;
  colState?: string;
  containerSize?: RateContainerSize;
};

export default function RateLookupPanel({
  sheetId,
  kind,
}: {
  sheetId: number;
  kind: SheetKind;
}) {
  const { t } = useTranslation();

  const isZone = kind === "POINT_ZONE";
  const isCity = kind === "POINT_CITY";
  const isPoint = kind === "POINT_POINT";
  const hasContainerSize = isZone || isCity || isPoint;

  const [workDate, setWorkDate] = useState(todayIso());
  const [colZoneId, setColZoneId] = useState("");
  const [colPointId, setColPointId] = useState("");
  const [colCity, setColCity] = useState("");
  const [colState, setColState] = useState("");
  const [containerSize, setContainerSize] =
    useState<RateContainerSize>("SIZE_40");
  const [submitted, setSubmitted] = useState<LookupParams | null>(null);

  const { data: result, isFetching } = useQuery({
    queryKey: ["rate-sheet", "lookup", sheetId, submitted],
    queryFn: () => lookupRateEntry(sheetId, submitted!),
    enabled: submitted != null,
  });

  const handleLookup = () => {
    if (workDate.trim() === "") return;
    const params: LookupParams = { workDate };
    if (isZone && colZoneId) params.colZoneId = Number(colZoneId);
    if (isPoint && colPointId) params.colPointId = Number(colPointId);
    if (isCity) {
      if (colCity.trim()) params.colCity = colCity.trim();
      if (colState.trim()) params.colState = colState.trim();
    }
    if (hasContainerSize) params.containerSize = containerSize;
    setSubmitted(params);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 rounded-md border p-4 sm:grid-cols-3">
        <Field label={t("rateSheet.lookup.workDate")}>
          <Input
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
          />
        </Field>
        {isZone && (
          <Field label={t("rateSheet.grid.colZoneId")}>
            <Input
              value={colZoneId}
              onChange={(e) => setColZoneId(e.target.value)}
              inputMode="numeric"
            />
          </Field>
        )}
        {isPoint && (
          <Field label={t("rateSheet.grid.colPointId")}>
            <Input
              value={colPointId}
              onChange={(e) => setColPointId(e.target.value)}
              inputMode="numeric"
            />
          </Field>
        )}
        {isCity && (
          <>
            <Field label={t("rateSheet.grid.colCity")}>
              <Input
                value={colCity}
                onChange={(e) => setColCity(e.target.value)}
                maxLength={120}
              />
            </Field>
            <Field label={t("rateSheet.grid.colState")}>
              <Input
                value={colState}
                onChange={(e) => setColState(e.target.value)}
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
        <div className="flex items-end">
          <Button
            onClick={handleLookup}
            disabled={isFetching || workDate.trim() === ""}
          >
            {t("rateSheet.lookup.button")}
          </Button>
        </div>
      </div>

      {result && (
        <div className="rounded-md border p-4 text-sm">
          {result.found ? (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground">
                {t("rateSheet.lookup.found")}
              </span>
              <span>
                {t("rateSheet.grid.amount")}: {result.amount ?? "—"}
              </span>
              <span>
                {t("rateSheet.grid.perUnit")}: {result.perUnit ?? "—"}
              </span>
              <span>
                {t("rateSheet.grid.effectiveFrom")}:{" "}
                {result.effectiveFrom ? formatDate(result.effectiveFrom) : "—"}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">
              {result.message ?? t("rateSheet.lookup.notFound")}
            </span>
          )}
        </div>
      )}
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
