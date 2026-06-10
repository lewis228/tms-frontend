import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
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
import CityAutocomplete from "@/components/city-autocomplete";
import { useRateGroupsData } from "@/hooks/queries/use-rate-groups-data";
import { useRateZonesData } from "@/hooks/queries/use-rate-zones-data";
import { useRateGroupEntriesData } from "@/hooks/queries/use-rate-group-entries-data";
import { useSetRateGroupEntry } from "@/hooks/mutations/rate-group/use-set-rate-group-entry";
import { useImportRateGroupEntries } from "@/hooks/mutations/rate-group/use-import-rate-group-entries";
import { exportRateGroupEntriesCsv } from "@/api/rate-group";
import { useOpenCreateRateGroupModal } from "@/store/rate-group-editor-modal";
import { generateErrorMessage } from "@/lib/error";
import { US_STATES } from "@/lib/us-states";
import type {
  FlatRateEntry,
  FlatRateEntryInput,
  RateContainerSize,
  RateGroupEntity,
  RateMethod,
  RateMoveType,
  RateServiceType,
} from "@/types";

const MOVE_TYPES: RateMoveType[] = ["LOAD", "EMPTY", "NONE"];
const SERVICE_TYPES: RateServiceType[] = ["LIVE", "DROP", "NONE"];
const SIZES: RateContainerSize[] = ["SIZE_20", "SIZE_40", "SIZE_45"];

const SELECT_CLASS =
  "h-9 rounded-md border bg-background px-2 text-sm";

function todayISO(): string {
  // UTC 기준 YYYY-MM-DD (effective_from 기본값).
  return new Date().toISOString().slice(0, 10);
}

export default function RateMatrixTab({ method }: { method: RateMethod }) {
  const { t } = useTranslation();
  const { data: groupsData, isPending, error } = useRateGroupsData();
  const openCreateGroup = useOpenCreateRateGroupModal();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const groups = useMemo<RateGroupEntity[]>(
    () => (groupsData?.items ?? []).filter((g) => g.method === method),
    [groupsData, method],
  );

  useEffect(() => {
    if (selectedGroupId && groups.some((g) => g.id === selectedGroupId)) return;
    setSelectedGroupId(groups[0]?.id ?? null);
  }, [groups, selectedGroupId]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {groups.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            {t("rateEntry.noGroup")}
          </span>
        ) : (
          groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroupId(g.id)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                g.id === selectedGroupId
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-muted"
              }`}
            >
              {g.name}
              {g.isDefault ? " ★" : ""}
            </button>
          ))
        )}
        <Button size="sm" variant="outline" onClick={() => openCreateGroup()}>
          {t("rateEntry.newGroup")}
        </Button>
      </div>

      {selectedGroupId ? (
        <GroupEntries
          key={selectedGroupId}
          groupId={selectedGroupId}
          method={method}
        />
      ) : null}
    </div>
  );
}

// ── 선택된 그룹의 셀 입력/조회 ────────────────────────────────────
function GroupEntries({
  groupId,
  method,
}: {
  groupId: number;
  method: RateMethod;
}) {
  const { t } = useTranslation();
  const isMatrix = method === "ZONE" || method === "CITY";
  const [view, setView] = useState<"list" | "matrix">("list");
  const [move, setMove] = useState<RateMoveType>("LOAD");
  const [service, setService] = useState<RateServiceType>("LIVE");
  const [size, setSize] = useState<RateContainerSize>("SIZE_40");

  const { data, isPending, error } = useRateGroupEntriesData(groupId);
  const { data: zonesData } = useRateZonesData();
  const zoneName = useMemo(() => {
    const m = new Map<number, string>();
    zonesData?.items.forEach((z) => m.set(z.id, z.code ?? z.name));
    return m;
  }, [zonesData]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const rows = data.rows;

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isMatrix ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={SELECT_CLASS}
              value={move}
              onChange={(e) => setMove(e.target.value as RateMoveType)}
            >
              {MOVE_TYPES.map((m) => (
                <option key={m} value={m}>
                  {t(`rateEntry.move.${m}`)}
                </option>
              ))}
            </select>
            <select
              className={SELECT_CLASS}
              value={service}
              onChange={(e) => setService(e.target.value as RateServiceType)}
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {t(`rateEntry.service.${s}`)}
                </option>
              ))}
            </select>
            <select
              className={SELECT_CLASS}
              value={size}
              onChange={(e) => setSize(e.target.value as RateContainerSize)}
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {t(`rateEntry.size.${s}`)}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {t("rateEntry.perUnitHint")}
          </span>
        )}

        {isMatrix ? (
          <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded px-2.5 py-1 text-xs ${view === "list" ? "bg-background shadow-sm" : ""}`}
            >
              {t("rateEntry.view.list")}
            </button>
            <button
              type="button"
              onClick={() => setView("matrix")}
              className={`rounded px-2.5 py-1 text-xs ${view === "matrix" ? "bg-background shadow-sm" : ""}`}
            >
              {t("rateEntry.view.matrix")}
            </button>
          </div>
        ) : null}
      </div>

      <AddEntryForm
        groupId={groupId}
        method={method}
        zones={zonesData?.items ?? []}
        presetMove={move}
        presetService={service}
        presetSize={size}
      />

      <ImportBar groupId={groupId} method={method} />

      {isMatrix && view === "matrix" ? (
        <MatrixView
          method={method}
          rows={rows}
          move={move}
          service={service}
          size={size}
          zoneName={zoneName}
          allZones={zonesData?.items ?? []}
        />
      ) : (
        <ListView method={method} rows={rows} zoneName={zoneName} />
      )}
    </div>
  );
}

// ── 리스트 뷰 (이미지3 플랫 행) ──────────────────────────────────
function ListView({
  method,
  rows,
  zoneName,
}: {
  method: RateMethod;
  rows: FlatRateEntry[];
  zoneName: Map<number, string>;
}) {
  const { t } = useTranslation();
  const isMatrix = method === "ZONE" || method === "CITY";

  const fromLabel = (r: FlatRateEntry) =>
    method === "ZONE"
      ? (zoneName.get(r.fromZoneId ?? -1) ?? `#${r.fromZoneId ?? "—"}`)
      : `${r.fromCity ?? "—"}${r.fromState ? `, ${r.fromState}` : ""}`;
  const toLabel = (r: FlatRateEntry) =>
    method === "ZONE"
      ? (zoneName.get(r.toZoneId ?? -1) ?? `#${r.toZoneId ?? "—"}`)
      : `${r.toCity ?? "—"}${r.toState ? `, ${r.toState}` : ""}`;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isMatrix ? (
              <>
                <TableHead>{t("rateEntry.field.from")}</TableHead>
                <TableHead>{t("rateEntry.field.to")}</TableHead>
                <TableHead>{t("rateEntry.field.move")}</TableHead>
                <TableHead>{t("rateEntry.field.service")}</TableHead>
                <TableHead>{t("rateEntry.field.size")}</TableHead>
                <TableHead className="text-right">
                  {t("rateEntry.field.amount")}
                </TableHead>
              </>
            ) : (
              <TableHead className="text-right">
                {t("rateEntry.field.perUnit")}
              </TableHead>
            )}
            <TableHead>{t("rateEntry.field.effectiveFrom")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isMatrix ? 7 : 2}
                className="text-center text-muted-foreground"
              >
                {t("rateEntry.noRows")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={r.rateEntryId}>
                {isMatrix ? (
                  <>
                    <TableCell>{fromLabel(r)}</TableCell>
                    <TableCell>{toLabel(r)}</TableCell>
                    <TableCell>
                      {r.moveType ? t(`rateEntry.move.${r.moveType}`) : "—"}
                    </TableCell>
                    <TableCell>
                      {r.serviceType
                        ? t(`rateEntry.service.${r.serviceType}`)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {r.containerSize
                        ? t(`rateEntry.size.${r.containerSize}`)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {r.amount ?? "—"}
                    </TableCell>
                  </>
                ) : (
                  <TableCell className="text-right font-medium">
                    {r.perUnit ?? "—"}
                  </TableCell>
                )}
                <TableCell>{r.effectiveFrom}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ── 매트릭스 뷰 (from×to 피벗) ───────────────────────────────────
function MatrixView({
  method,
  rows,
  move,
  service,
  size,
  zoneName,
  allZones,
}: {
  method: RateMethod;
  rows: FlatRateEntry[];
  move: RateMoveType;
  service: RateServiceType;
  size: RateContainerSize;
  zoneName: Map<number, string>;
  allZones: { id: number; name: string; code: string | null }[];
}) {
  const { t } = useTranslation();

  const fromKey = (r: FlatRateEntry) =>
    method === "ZONE"
      ? String(r.fromZoneId ?? "")
      : `${r.fromCity ?? ""}|${r.fromState ?? ""}`;
  const toKey = (r: FlatRateEntry) =>
    method === "ZONE"
      ? String(r.toZoneId ?? "")
      : `${r.toCity ?? ""}|${r.toState ?? ""}`;
  const keyLabel = (key: string) => {
    if (method === "ZONE") {
      const id = Number(key);
      return zoneName.get(id) ?? `#${key}`;
    }
    const [city, state] = key.split("|");
    return `${city}${state ? `, ${state}` : ""}`;
  };

  // ZONE: 모든 존을 행·열 양축에 표시(정사각 매트릭스, 빈 칸은 입력 가능 위치).
  // CITY: 도시 마스터 열거가 불가하므로 등록된 행에서 from/to 도시 합집합.
  const allZoneKeys = allZones
    .map((z) => String(z.id))
    .sort((a, b) =>
      (zoneName.get(Number(a)) ?? a).localeCompare(zoneName.get(Number(b)) ?? b),
    );
  const fromKeys =
    method === "ZONE"
      ? allZoneKeys
      : Array.from(new Set(rows.map(fromKey))).filter(Boolean).sort();
  const toKeys =
    method === "ZONE"
      ? allZoneKeys
      : Array.from(new Set(rows.map(toKey))).filter(Boolean).sort();

  const cell = new Map<string, string>();
  rows
    .filter(
      (r) =>
        r.moveType === move &&
        r.serviceType === service &&
        r.containerSize === size,
    )
    .forEach((r) => cell.set(`${fromKey(r)}»${toKey(r)}`, r.amount ?? ""));

  if (fromKeys.length === 0 || toKeys.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        {t("rateEntry.matrixHint")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-muted/60 px-3 py-2 text-left text-xs uppercase text-muted-foreground">
              {t("rateEntry.field.from")} \ {t("rateEntry.field.to")}
            </th>
            {toKeys.map((tk) => (
              <th
                key={tk}
                className="bg-muted/60 px-3 py-2 text-center text-xs font-medium"
              >
                {keyLabel(tk)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fromKeys.map((fk) => (
            <tr key={fk} className="border-t">
              <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left text-xs font-medium">
                {keyLabel(fk)}
              </th>
              {toKeys.map((tk) => {
                const v = cell.get(`${fk}»${tk}`);
                return (
                  <td
                    key={tk}
                    className="px-3 py-2 text-center tabular-nums"
                  >
                    {v ? v : <span className="text-muted-foreground">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 개별 행 입력 폼 ──────────────────────────────────────────────
function AddEntryForm({
  groupId,
  method,
  zones,
  presetMove,
  presetService,
  presetSize,
}: {
  groupId: number;
  method: RateMethod;
  zones: { id: number; name: string; code: string | null }[];
  presetMove: RateMoveType;
  presetService: RateServiceType;
  presetSize: RateContainerSize;
}) {
  const { t } = useTranslation();
  const isMatrix = method === "ZONE" || method === "CITY";

  const [fromZoneId, setFromZoneId] = useState<number | "">("");
  const [toZoneId, setToZoneId] = useState<number | "">("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState("CA");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("CA");
  const [amount, setAmount] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState(todayISO());

  const { mutate: setEntry, isPending } = useSetRateGroupEntry(groupId, {
    onSuccess: () => {
      toast.success(t("toast.saved"), { position: "top-center" });
      setAmount("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSubmit = () => {
    const payload: FlatRateEntryInput = {
      effectiveFrom,
      containerSize: isMatrix ? presetSize : null,
      amount: isMatrix ? amount || null : null,
      perUnit: isMatrix ? null : amount || null,
    };
    if (isMatrix) {
      payload.moveType = presetMove;
      payload.serviceType = presetService;
      if (method === "ZONE") {
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
    if (!amount.trim()) return;
    setEntry(payload);
  };

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-md bg-muted/40 p-3">
      {method === "ZONE" ? (
        <>
          <Field label={t("rateEntry.field.from")}>
            <select
              className={SELECT_CLASS}
              value={fromZoneId}
              onChange={(e) =>
                setFromZoneId(e.target.value ? Number(e.target.value) : "")
              }
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
            >
              <option value="">—</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.code ?? z.name}
                </option>
              ))}
            </select>
          </Field>
        </>
      ) : method === "CITY" ? (
        <>
          <Field label={t("rateEntry.field.from")}>
            <div className="flex gap-1">
              <CityAutocomplete
                value={fromCity}
                state={fromState}
                onChange={setFromCity}
                placeholder={t("rateEntry.cityPlaceholder")}
                className="h-9 w-32"
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
                className="h-9 w-32"
              />
              <StateSelect value={toState} onChange={setToState} />
            </div>
          </Field>
        </>
      ) : null}

      <Field label={isMatrix ? t("rateEntry.field.amount") : t("rateEntry.field.perUnit")}>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          inputMode="decimal"
          className="h-9 w-24"
        />
      </Field>
      <Field label={t("rateEntry.field.effectiveFrom")}>
        <Input
          type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          className="h-9 w-36"
        />
      </Field>
      <Button size="sm" onClick={handleSubmit} disabled={isPending}>
        {t("rateEntry.addRow")}
      </Button>
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

// ── CSV(Excel) 플랫 행 import ────────────────────────────────────
function ImportBar({
  groupId,
  method,
}: {
  groupId: number;
  method: RateMethod;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: importCsv, isPending } = useImportRateGroupEntries(groupId, {
    onSuccess: () =>
      toast.success(t("rateEntry.importDone"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: exportCsv, isPending: isExportPending } = useMutation({
    mutationFn: () => exportRateGroupEntriesCsv(groupId),
    onSuccess: (csv) => {
      const url = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `rate-group-${groupId}-entries.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const header =
    method === "ZONE"
      ? "move_type,service_type,from_zone_id,to_zone_id,container_size,amount,effective_from"
      : method === "CITY"
        ? "move_type,service_type,from_city,from_state,to_city,to_state,container_size,amount,effective_from"
        : "per_unit,effective_from";

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (text.trim()) importCsv({ csv: text });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {t("rateEntry.importCsv")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => exportCsv()}
        disabled={isExportPending}
      >
        {t("rateEntry.exportCsv")}
      </Button>
      <span className="text-[11px] text-muted-foreground">
        {t("rateEntry.csvHeader")}: <code>{header}</code>
      </span>
    </div>
  );
}
