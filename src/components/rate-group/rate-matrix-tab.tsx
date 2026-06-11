import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import RateEntryTable from "@/components/rate-group/rate-entry-table";
import { useRateGroupsData } from "@/hooks/queries/use-rate-groups-data";
import { useRateZonesData } from "@/hooks/queries/use-rate-zones-data";
import { useRateGroupEntriesData } from "@/hooks/queries/use-rate-group-entries-data";
import { useImportRateGroupEntries } from "@/hooks/mutations/rate-group/use-import-rate-group-entries";
import { exportRateGroupEntriesCsv } from "@/api/rate-group";
import { useOpenCreateRateGroupModal } from "@/store/rate-group-editor-modal";
import { useOpenCreateRateEntryModal } from "@/store/rate-entry-editor-modal";
import { generateErrorMessage } from "@/lib/error";
import type {
  FlatRateEntry,
  RateGroupEntity,
  RateMethod,
  RateMoveType,
  RateServiceType,
} from "@/types";

const MOVE_TYPES: RateMoveType[] = ["LOAD", "EMPTY", "NONE"];
const SERVICE_TYPES: RateServiceType[] = ["LIVE", "DROP", "NONE"];

const SELECT_CLASS = "h-9 rounded-md border bg-background px-2 text-sm";

export default function RateMatrixTab({ method }: { method: RateMethod }) {
  const { t } = useTranslation();
  const { data: groupsData, isPending, error } = useRateGroupsData();
  const openCreateGroup = useOpenCreateRateGroupModal();
  const [picked, setPicked] = useState<number | null>(null);

  const groups = useMemo<RateGroupEntity[]>(
    () => (groupsData?.items ?? []).filter((g) => g.method === method),
    [groupsData, method],
  );

  // 선택 그룹: 사용자가 고른 게 현재 목록에 있으면 그것, 없으면 첫 번째(렌더 시 파생).
  const selectedGroupId =
    picked && groups.some((g) => g.id === picked)
      ? picked
      : (groups[0]?.id ?? null);

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
              onClick={() => setPicked(g.id)}
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

  const openCreate = useOpenCreateRateEntryModal();
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
  const showMatrix = isMatrix && view === "matrix";

  const openNew = () =>
    openCreate({
      groupId,
      method,
      presetMove: isMatrix ? move : undefined,
      presetService: isMatrix ? service : undefined,
    });

  const openCell = (fromKey: string, toKey: string) => {
    if (method === "ZONE") {
      openCreate({
        groupId,
        method,
        presetMove: move,
        presetService: service,
        presetFromZoneId: Number(fromKey),
        presetToZoneId: Number(toKey),
      });
    } else {
      const [fc, fs] = fromKey.split("|");
      const [tc, ts] = toKey.split("|");
      openCreate({
        groupId,
        method,
        presetMove: move,
        presetService: service,
        presetFromCity: fc,
        presetFromState: fs,
        presetToCity: tc,
        presetToState: ts,
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {showMatrix ? (
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
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {isMatrix ? "" : t("rateEntry.perUnitHint")}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openNew}>
            <Plus className="size-4" />
            {t("rateEntry.newButton")}
          </Button>
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
      </div>

      <ImportBar groupId={groupId} method={method} />

      {showMatrix ? (
        <MatrixView
          method={method}
          rows={rows}
          move={move}
          service={service}
          zoneName={zoneName}
          allZones={zonesData?.items ?? []}
          onCellClick={openCell}
        />
      ) : (
        <RateEntryTable method={method} rows={rows} zoneName={zoneName} />
      )}
    </div>
  );
}

// ── 매트릭스 뷰 (from×to 피벗) ───────────────────────────────────
function MatrixView({
  method,
  rows,
  move,
  service,
  zoneName,
  allZones,
  onCellClick,
}: {
  method: RateMethod;
  rows: FlatRateEntry[];
  move: RateMoveType;
  service: RateServiceType;
  zoneName: Map<number, string>;
  allZones: { id: number; name: string; code: string | null }[];
  onCellClick: (fromKey: string, toKey: string) => void;
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

  // ZONE: 모든 존을 행·열 양축에(정사각). CITY: 등록된 from/to 도시 합집합.
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
        r.serviceType === service,
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
                const same = fk === tk;
                return (
                  <td key={tk} className="p-0 text-center tabular-nums">
                    {same ? (
                      <span className="block px-3 py-2 text-muted-foreground/40">
                        ·
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onCellClick(fk, tk)}
                        className="block w-full px-3 py-2 hover:bg-primary/5"
                        title={t("rateEntry.newButton")}
                      >
                        {v ? (
                          v
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </button>
                    )}
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

// ── CSV(Excel) 플랫 행 import/export ────────────────────────────
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
      ? "move_type,service_type,from_zone_id,to_zone_id,amount,effective_from"
      : method === "CITY"
        ? "move_type,service_type,from_city,from_state,to_city,to_state,amount,effective_from"
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
