import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown, ChevronDown, ChevronUp, Filter } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useZipLabelsData } from "@/hooks/queries/use-zip-labels-data";
import type { FlatRateEntry, RateMethod } from "@/types";

type Kind = "set" | "number" | "date";
type Col = {
  id: string;
  label: string;
  kind: Kind;
  align?: "right";
  // 정렬/필터용 원시값 (set=표시라벨, number=숫자|null, date=iso)
  raw: (r: FlatRateEntry) => string | number | null;
};

type SortState = { id: string; dir: "asc" | "desc" } | null;

export default function RateEntryTable({
  method,
  rows,
  zoneName,
}: {
  method: RateMethod;
  rows: FlatRateEntry[];
  zoneName: Map<number, string>;
}) {
  const { t } = useTranslation();
  const isMatrix = method === "ZIP" || method === "CITY";

  // 행에 등장한 zip 의 동네 이름 병기 ("90731 · San Pedro").
  const zips = useMemo(
    () =>
      rows.flatMap((r) => [r.fromZip, r.toZip]).filter((z): z is string => !!z),
    [rows]
  );
  const { data: zipLabels } = useZipLabelsData(zips);

  // 각 변은 zip | zone | city 중 하나 — 셋 다 처리.
  const sideLabel = (
    zip: string | null,
    zoneId: number | null,
    city: string | null,
    state: string | null
  ) => {
    if (zip) return zipLabels?.get(zip) ?? zip;
    if (zoneId != null) return zoneName.get(zoneId) ?? `#${zoneId}`;
    if (city) return `${city}${state ? `, ${state}` : ""}`;
    return "—";
  };
  const fromLabel = (r: FlatRateEntry) =>
    sideLabel(r.fromZip, r.fromZoneId, r.fromCity, r.fromState);
  const toLabel = (r: FlatRateEntry) =>
    sideLabel(r.toZip, r.toZoneId, r.toCity, r.toState);

  const cols = useMemo<Col[]>(() => {
    if (isMatrix) {
      return [
        {
          id: "from",
          label: t("rateEntry.field.from"),
          kind: "set",
          raw: fromLabel,
        },
        { id: "to", label: t("rateEntry.field.to"), kind: "set", raw: toLabel },
        {
          id: "move",
          label: t("rateEntry.field.move"),
          kind: "set",
          raw: (r) => (r.moveType ? t(`rateEntry.move.${r.moveType}`) : "—"),
        },
        {
          id: "service",
          label: t("rateEntry.field.service"),
          kind: "set",
          raw: (r) =>
            r.serviceType ? t(`rateEntry.service.${r.serviceType}`) : "—",
        },
        {
          id: "amount",
          label: t("rateEntry.field.amount"),
          kind: "number",
          align: "right",
          raw: (r) => (r.amount != null ? Number(r.amount) : null),
        },
        {
          id: "eff",
          label: t("rateEntry.field.effectiveFrom"),
          kind: "date",
          raw: (r) => r.effectiveFrom,
        },
      ];
    }
    return [
      {
        id: "perUnit",
        label: t("rateEntry.field.perUnit"),
        kind: "number",
        align: "right",
        raw: (r) => (r.perUnit != null ? Number(r.perUnit) : null),
      },
      {
        id: "eff",
        label: t("rateEntry.field.effectiveFrom"),
        kind: "date",
        raw: (r) => r.effectiveFrom,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fromLabel/toLabel은 method+zoneName+zipLabels 만 캡처하며 셋 다 deps에 포함됨(매 렌더 재생성 함수라 lint가 과탐지)
  }, [method, zoneName, zipLabels, t]);

  const [sort, setSort] = useState<SortState>(null);
  const [setFilters, setSetFilters] = useState<Record<string, string[]>>({});
  const [numFilters, setNumFilters] = useState<
    Record<string, { min: string; max: string }>
  >({});
  const [dateFilters, setDateFilters] = useState<
    Record<string, { from: string; to: string }>
  >({});

  const view = useMemo(() => {
    let out = rows.filter((r) => {
      for (const c of cols) {
        if (c.kind === "set") {
          const sel = setFilters[c.id];
          if (sel && sel.length && !sel.includes(String(c.raw(r))))
            return false;
        } else if (c.kind === "number") {
          const f = numFilters[c.id];
          const v = c.raw(r) as number | null;
          if (f?.min && (v == null || v < Number(f.min))) return false;
          if (f?.max && (v == null || v > Number(f.max))) return false;
        } else {
          const f = dateFilters[c.id];
          const v = (c.raw(r) as string) ?? "";
          if (f?.from && v < f.from) return false;
          if (f?.to && v > f.to) return false;
        }
      }
      return true;
    });
    if (sort) {
      const c = cols.find((x) => x.id === sort.id);
      if (c) {
        out = [...out].sort((a, b) => {
          const av = c.raw(a);
          const bv = c.raw(b);
          let cmp: number;
          if (av == null && bv == null) cmp = 0;
          else if (av == null) cmp = -1;
          else if (bv == null) cmp = 1;
          else if (typeof av === "number" && typeof bv === "number")
            cmp = av - bv;
          else cmp = String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, cols, setFilters, numFilters, dateFilters, sort]);

  const toggleSort = (id: string) =>
    setSort((prev) =>
      !prev || prev.id !== id
        ? { id, dir: "asc" }
        : prev.dir === "asc"
          ? { id, dir: "desc" }
          : null
    );

  const isActive = (c: Col) =>
    c.kind === "set"
      ? (setFilters[c.id]?.length ?? 0) > 0
      : c.kind === "number"
        ? !!(numFilters[c.id]?.min || numFilters[c.id]?.max)
        : !!(dateFilters[c.id]?.from || dateFilters[c.id]?.to);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {cols.map((c) => (
              <TableHead
                key={c.id}
                className={c.align === "right" ? "text-right" : undefined}
              >
                <div
                  className={`flex items-center gap-1 ${c.align === "right" ? "justify-end" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c.id)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {c.label}
                    {sort?.id === c.id ? (
                      sort.dir === "asc" ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 opacity-30" />
                    )}
                  </button>
                  <ColumnFilter
                    col={c}
                    rows={rows}
                    active={isActive(c)}
                    setFilters={setFilters}
                    setSetFilters={setSetFilters}
                    numFilters={numFilters}
                    setNumFilters={setNumFilters}
                    dateFilters={dateFilters}
                    setDateFilters={setDateFilters}
                  />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {view.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={cols.length}
                className="text-center text-muted-foreground"
              >
                {t("rateEntry.noRows")}
              </TableCell>
            </TableRow>
          ) : (
            view.map((r) => (
              <TableRow key={r.rateEntryId}>
                {cols.map((c) => {
                  const v = c.raw(r);
                  return (
                    <TableCell
                      key={c.id}
                      className={
                        c.align === "right"
                          ? "text-right font-medium tabular-nums"
                          : undefined
                      }
                    >
                      {v == null ? "—" : String(v)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ── 컬럼 필터 Popover ────────────────────────────────────────────
function ColumnFilter({
  col,
  rows,
  active,
  setFilters,
  setSetFilters,
  numFilters,
  setNumFilters,
  dateFilters,
  setDateFilters,
}: {
  col: Col;
  rows: FlatRateEntry[];
  active: boolean;
  setFilters: Record<string, string[]>;
  setSetFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  numFilters: Record<string, { min: string; max: string }>;
  setNumFilters: React.Dispatch<
    React.SetStateAction<Record<string, { min: string; max: string }>>
  >;
  dateFilters: Record<string, { from: string; to: string }>;
  setDateFilters: React.Dispatch<
    React.SetStateAction<Record<string, { from: string; to: string }>>
  >;
}) {
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      col.kind === "set"
        ? Array.from(new Set(rows.map((r) => String(col.raw(r))))).sort()
        : [],
    [col, rows]
  );

  const clear = () => {
    setSetFilters((p) => ({ ...p, [col.id]: [] }));
    setNumFilters((p) => ({ ...p, [col.id]: { min: "", max: "" } }));
    setDateFilters((p) => ({ ...p, [col.id]: { from: "", to: "" } }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`rounded p-0.5 hover:bg-muted ${active ? "text-primary" : "text-muted-foreground/50"}`}
          title={t("rateEntry.filter.title")}
        >
          <Filter className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">{col.label}</span>
            <button
              type="button"
              onClick={clear}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              {t("rateEntry.filter.clear")}
            </button>
          </div>

          {col.kind === "set" && (
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {options.map((opt) => {
                const sel = setFilters[col.id] ?? [];
                const checked = sel.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSetFilters((p) => {
                          const cur = p[col.id] ?? [];
                          return {
                            ...p,
                            [col.id]: e.target.checked
                              ? [...cur, opt]
                              : cur.filter((x) => x !== opt),
                          };
                        })
                      }
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          )}

          {col.kind === "number" && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder={t("rateEntry.filter.min")}
                value={numFilters[col.id]?.min ?? ""}
                onChange={(e) =>
                  setNumFilters((p) => ({
                    ...p,
                    [col.id]: {
                      min: e.target.value,
                      max: p[col.id]?.max ?? "",
                    },
                  }))
                }
                className="h-8"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                inputMode="decimal"
                placeholder={t("rateEntry.filter.max")}
                value={numFilters[col.id]?.max ?? ""}
                onChange={(e) =>
                  setNumFilters((p) => ({
                    ...p,
                    [col.id]: {
                      min: p[col.id]?.min ?? "",
                      max: e.target.value,
                    },
                  }))
                }
                className="h-8"
              />
            </div>
          )}

          {col.kind === "date" && (
            <div className="flex flex-col gap-1">
              <Input
                type="date"
                value={dateFilters[col.id]?.from ?? ""}
                onChange={(e) =>
                  setDateFilters((p) => ({
                    ...p,
                    [col.id]: {
                      from: e.target.value,
                      to: p[col.id]?.to ?? "",
                    },
                  }))
                }
                className="h-8"
              />
              <Input
                type="date"
                value={dateFilters[col.id]?.to ?? ""}
                onChange={(e) =>
                  setDateFilters((p) => ({
                    ...p,
                    [col.id]: {
                      from: p[col.id]?.from ?? "",
                      to: e.target.value,
                    },
                  }))
                }
                className="h-8"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
