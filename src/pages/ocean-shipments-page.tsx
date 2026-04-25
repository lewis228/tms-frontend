import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Anchor,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Container as ContainerIcon,
  Copy,
  Download,
  Layers,
  MoreHorizontal,
  Plus,
  Search,
  Ship,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useOceanShipmentsData } from "@/hooks/queries/use-ocean-shipments-data";
import { useOceanShipmentByIdData } from "@/hooks/queries/use-ocean-shipment-by-id-data";
import { useStopOceanShipment } from "@/hooks/mutations/ocean-shipment/use-stop-ocean-shipment";
import { useOpenAlertModal } from "@/store/alert-modal";
import type { OceanShipmentListParams } from "@/api/ocean-shipment";
import type { OceanShipmentEntity } from "@/types";
import { formatTimeAgo } from "@/lib/time";
import { formatDate } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import ColumnSettingsButton from "@/components/grid/column-settings-button";
import { useResolvedColumns } from "@/components/grid/use-resolved-columns";
import type { GridColumnDefinition } from "@/store/grid-column-config";

// Tabs filter shipments by **container physical state**, not by tracking-level
// system status. The previous `pending / tracking / failed / ...` axis was a
// scraping-internal concern and now lives in the Status badge column only —
// WebSocket updates (`shipment.status.changed`) keep that column live.
//
// The five tabs match Terminal49's layout tile-for-tile:
//
//   All              → no filter
//   On Ship          → any container physical_status in on_ship / loaded
//   Arrived          → any container physical_status in discharged / gate_out
//                       (and not yet empty_returned — that's Stopped Tracking)
//   Stopped Tracking → shipment.status = "stopped"
//                       (server flips this automatically when every container
//                        reaches empty_returned; also toggled by user-initiated
//                        stops)
//   Recently Added   → created within the last 7 days
//
// Each tab maps to exactly one server filter (no client-side post-processing),
// so pagination and counts stay correct.
type ViewId =
  | "all"
  | "on_ship"
  | "arrived"
  | "stopped"
  | "recently_added";

type ViewDef = {
  id: ViewId;
  labelKey: string;
  icon: React.ReactNode;
  /** ContainerPhysicalStatus values; EXISTS subquery on the server. */
  containerPhysicalStatuses?: string[];
  /** Exact match on shipment.status (tracking-level). */
  shipmentStatus?: string;
  /** "created within last N days" — resolved to a UTC ISO at query build time. */
  createdWithinDays?: number;
};

const RECENTLY_ADDED_WINDOW_DAYS = 7;

const VIEWS: ViewDef[] = [
  {
    id: "all",
    labelKey: "pages.ocean.list.viewAll",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: "on_ship",
    labelKey: "pages.ocean.list.viewOnShip",
    icon: <Ship className="h-4 w-4" />,
    containerPhysicalStatuses: ["on_ship", "loaded"],
  },
  {
    id: "arrived",
    labelKey: "pages.ocean.list.viewArrived",
    icon: <Anchor className="h-4 w-4" />,
    containerPhysicalStatuses: ["discharged", "gate_out"],
  },
  {
    id: "stopped",
    labelKey: "pages.ocean.list.viewStoppedTracking",
    icon: <CheckCircle2 className="h-4 w-4" />,
    shipmentStatus: "stopped",
  },
  {
    id: "recently_added",
    labelKey: "pages.ocean.list.viewRecentlyAdded",
    icon: <Clock className="h-4 w-4" />,
    createdWithinDays: RECENTLY_ADDED_WINDOW_DAYS,
  },
];

export default function OceanShipmentsPage() {
  const params = useParams();
  const teamId = params.teamId;
  const { t } = useTranslation();
  const openAlertModal = useOpenAlertModal();
  const [view, setView] = useState<ViewId>("all");
  // Chip-style multi-term search. Each committed term renders as a removable
  // pill inside the search box (Enter / comma / Tab commits the current draft
  // into the chip list). A row is kept when it matches **any** committed term
  // on either MBL or carrier name (OR semantics) — this mirrors the
  // product-search UX the design references. `searchInput` is the live draft
  // still being typed.
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  // When a chip is appended or the draft grows beyond the visible strip,
  // auto-scroll the chip rail to the right so the typing cursor stays in
  // view — matches the single-line scroll UX the design references.
  const chipScrollerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chipScrollerRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [searchTerms, searchInput]);

  // Click-and-drag horizontal scroll for the chip rail. Native wheel /
  // trackpad swipe already work via `overflow-x-auto`; users with a plain
  // mouse need drag-to-pan. Drag only engages when the pointer goes down on
  // the rail itself (not on the inner <input>, chip label, or close button)
  // and the pointer moves past a 4px deadzone — below that threshold clicks
  // still reach the child elements normally.
  const dragStateRef = useRef<{
    startX: number;
    startScroll: number;
    dragging: boolean;
  } | null>(null);
  const handleScrollerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = chipScrollerRef.current;
    if (!el) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, input")) return;
    dragStateRef.current = {
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragging: false,
    };
  };
  const handleScrollerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    const el = chipScrollerRef.current;
    if (!state || !el) return;
    const dx = e.clientX - state.startX;
    if (!state.dragging && Math.abs(dx) < 4) return;
    state.dragging = true;
    el.scrollLeft = state.startScroll - dx;
    e.preventDefault();
  };
  const endScrollerDrag = () => {
    dragStateRef.current = null;
  };
  // Row selection state — mirrors the members-page pattern so the two lists
  // behave identically (bulk actions can hook into this later).
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // Row expansion state — only one row open at a time (accordion semantics
  // matching Terminal49's UX). Stored at the page level so search / tab
  // changes don't lose state mid-inspection; we only clear it on explicit
  // collapse or when the row falls out of the filtered set.
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const listParams: OceanShipmentListParams = useMemo(() => {
    const next: OceanShipmentListParams = { take: 50, include_total: true };
    const current = VIEWS.find((v) => v.id === view);
    if (!current) return next;

    if (current.shipmentStatus) {
      next.where__status__equal = current.shipmentStatus;
    }
    if (current.containerPhysicalStatuses?.length) {
      next.where__any_container_physical_status__in =
        current.containerPhysicalStatuses.join(",");
    }
    if (current.createdWithinDays) {
      // Resolve to a UTC ISO at render time. Date.now is stable across the
      // memo deps since `view` is the only input — recomputed only on tab
      // change, and the backend re-evaluates each page request anyway.
      const cutoff = new Date(
        Date.now() - current.createdWithinDays * 24 * 60 * 60 * 1000,
      );
      next.where__created_at__more_than_or_equal = cutoff.toISOString();
    }
    // Carrier filter is applied client-side below against the nested
    // carrier.name — the backend now expects `carrier_id` (number), not a
    // free-text name, so server-side narrowing via typing would need a
    // carrier picker. Client-side filtering is acceptable for now given the
    // list is already paginated and relatively small per page.
    return next;
  }, [view]);

  const { data, error, isPending } = useOceanShipmentsData(listParams);

  const { mutate: stopShipment, isPending: isStopShipmentPending } =
    useStopOceanShipment({
      onSuccess: () => {
        toast.success(t("pages.ocean.detail.stopSuccess"), {
          position: "top-center",
        });
      },
      onError: (apiError) => {
        toast.error(generateErrorMessage(apiError), {
          position: "top-center",
        });
      },
    });

  const filtered = useMemo(() => {
    if (!data) return [];
    const needles = searchTerms
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    if (needles.length === 0) return data.data;
    return data.data.filter((s) => {
      const mbl = s.mbl.toLowerCase();
      const carrier = s.carrier?.name.toLowerCase() ?? "";
      return needles.some((n) => mbl.includes(n) || carrier.includes(n));
    });
  }, [data, searchTerms]);

  const hasActiveFilters = searchTerms.length > 0;

  const commitSearchTerm = () => {
    const v = searchInput.trim();
    if (!v) return;
    setSearchTerms((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setSearchInput("");
  };
  const removeSearchTerm = (term: string) => {
    setSearchTerms((prev) => prev.filter((t) => t !== term));
  };
  const clearSearch = () => {
    setSearchTerms([]);
    setSearchInput("");
  };

  // Selection handlers — identical shape to the Members page, kept inline
  // because these are small and ordered fine relative to the render tree.
  const isAllSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      filtered.forEach((s) => next.delete(s.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filtered.forEach((s) => next.add(s.id));
      setSelectedIds(next);
    }
  };
  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleStopClick = (s: OceanShipmentEntity) => {
    openAlertModal({
      title: t("pages.ocean.detail.stopConfirmTitle", { mbl: s.mbl }),
      description: t("pages.ocean.detail.stopConfirmDescription"),
      onPositive: () => stopShipment(s.id),
    });
  };

  const handleCopyMbl = (mbl: string) => {
    navigator.clipboard.writeText(mbl);
    toast.success(t("pages.ocean.list.mblCopied"), { position: "top-center" });
  };

  // Client-side CSV export of the currently filtered rows. Matches the
  // columns the user sees in the table so the file reads 1:1 with the UI
  // (MBL / Carrier / Status / ETA / POL / POD / Vessel / Updated). Excel
  // opens CSV natively so "엑셀 내보내기" is the sensible label even though
  // the underlying format is CSV.
  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast.info(t("pages.ocean.list.exportEmpty"), { position: "top-center" });
      return;
    }
    const headers = [
      t("pages.ocean.list.colMbl"),
      t("pages.ocean.list.colCarrier"),
      t("pages.ocean.list.colStatus"),
      t("pages.ocean.list.colEta"),
      "POL",
      "POD",
      t("pages.ocean.list.colVessel"),
      t("pages.ocean.list.colUpdated"),
    ];
    const escape = (v: string) =>
      /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    const rows = filtered.map((s) =>
      [
        s.mbl,
        s.carrier?.name ?? "",
        s.status,
        s.eta ? formatDate(s.eta) : "",
        s.pol_location?.name ?? "",
        s.pod_location?.name ?? "",
        s.vessel_name ?? "",
        s.updated_at ?? "",
      ]
        .map((cell) => escape(String(cell ?? "")))
        .join(","),
    );
    const csv = [headers.map(escape).join(","), ...rows].join("\n");
    // BOM so Excel on Windows treats the file as UTF-8 and renders Korean.
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `${t("pages.ocean.list.exportFileName")}-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    // `min-w-0` on the root flex column lets it shrink below its children's
    // natural width so the grid's own `overflow-x-auto` wrapper can actually
    // trigger. The previous `min-w-max` expanded the page to content width
    // and bypassed the grid scrollbar entirely — so only the page scrollbar
    // ever showed up.
    <div className="flex min-w-0 flex-col gap-6 p-7">
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-black">
            {t("pages.ocean.list.title")}
          </h1>
          <p className="text-sm text-black/55">
            {t("pages.ocean.list.description")}
          </p>
        </div>
        <Link to={`/app/${teamId}/ocean/track`}>
          <Button
            type="button"
            className="gap-1.5 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
          >
            <Plus className="h-4 w-4" />
            {t("pages.ocean.list.trackButton")}
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-1 border-b border-black/10">
        {VIEWS.map((v) => {
          const isActive = view === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "border-black font-medium text-black"
                  : "border-transparent text-black/55 hover:text-black",
              )}
            >
              {v.icon}
              <span>{t(v.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar — fixed-width search box with inline multi-term chips,
          export + column-settings anchored to the right edge. Sits directly
          on the page (no gray wrapper). The bottom divider thickness / color
          mirrors the table header row's bottom border (`border-b-black/20`)
          so the toolbar bookends the header symmetrically. */}
      <div className="-mt-3 flex items-center gap-3 border-b border-black/20 pb-3">
        <div className="relative flex h-9 w-[420px] items-center rounded-md border border-black/10 bg-white pl-3 pr-8">
          <Search className="h-3.5 w-3.5 shrink-0 text-black/45" />
          <div
            ref={chipScrollerRef}
            onMouseDown={handleScrollerMouseDown}
            onMouseMove={handleScrollerMouseMove}
            onMouseUp={endScrollerDrag}
            onMouseLeave={endScrollerDrag}
            className="ml-2 flex min-w-0 flex-1 cursor-grab items-center gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          >
            {searchTerms.map((term) => (
              <span
                key={term}
                className="inline-flex shrink-0 items-center gap-1 rounded bg-black/[0.05] py-0.5 pl-1.5 pr-1 text-xs text-black/75 select-none"
              >
                <span className="max-w-[10rem] truncate">{term}</span>
                <button
                  type="button"
                  onClick={() => removeSearchTerm(term)}
                  aria-label={t("pages.ocean.list.clearFilterAria")}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded text-black/45 transition-colors hover:bg-black/10 hover:text-black"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
                  if (searchInput.trim()) {
                    e.preventDefault();
                    commitSearchTerm();
                  }
                } else if (
                  e.key === "Backspace" &&
                  !searchInput &&
                  searchTerms.length > 0
                ) {
                  e.preventDefault();
                  setSearchTerms((prev) => prev.slice(0, -1));
                }
              }}
              onBlur={() => {
                if (searchInput.trim()) commitSearchTerm();
              }}
              placeholder={
                searchTerms.length === 0
                  ? t("pages.ocean.list.unifiedSearchPlaceholder")
                  : ""
              }
              className="min-w-[6rem] flex-1 shrink-0 bg-transparent text-sm outline-none placeholder:text-black/40"
            />
          </div>
          {(searchTerms.length > 0 || searchInput.length > 0) && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={t("pages.ocean.list.clearFilterAria")}
              className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-md text-black/40 transition-colors hover:bg-black/[0.04] hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-black/60 transition-colors hover:border-black/10 hover:bg-black/[0.02] hover:text-black"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t("pages.ocean.list.exportCsv")}</span>
          </button>
          <ColumnSettingsButton
            domainKey={SHIPMENTS_LIST_DOMAIN}
            definitions={SHIPMENTS_LIST_COLUMN_DEFS}
          />
        </div>
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState teamId={teamId} hasFilters={hasActiveFilters} view={view} />
      ) : (
        <ShipmentsTable
          items={filtered}
          teamId={teamId}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
          onStop={handleStopClick}
          onCopyMbl={handleCopyMbl}
          isStopping={isStopShipmentPending}
          expandedId={expandedId}
          onToggleExpand={(id) =>
            setExpandedId((prev) => (prev === id ? null : id))
          }
        />
      )}

      {data && !isPending && (
        <div className="flex items-center justify-between text-xs text-black/55">
          <span>
            {t("pages.ocean.list.shown", { count: filtered.length })}
            {data.meta.total !== null
              ? t("pages.ocean.list.total", { total: data.meta.total })
              : ""}
          </span>
          {data.meta.hasMore && <span>{t("pages.ocean.list.hasMore")}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Column descriptors ─────────────────────────────────────────────
//
// MBL and Carrier stay fixed (same rule as Flutter web's 사진/제품명). The
// leading chevron/checkbox and trailing Actions column are treated as row
// chrome — they always render, outside of the column-settings flow.
// Reorderable middle: Route / Vessel / ETA / Status / Updated.

const SHIPMENTS_LIST_DOMAIN = "ocean.list";

type ShipmentsListColumnKey =
  | "mbl"
  | "carrier"
  | "route"
  | "vessel"
  | "eta"
  | "status"
  | "updated";

type ShipmentsListColumnDef = GridColumnDefinition & {
  key: ShipmentsListColumnKey;
  minWidth: number;
  headerClassName?: string;
  cellClassName?: string;
  render: (args: {
    shipment: OceanShipmentEntity;
    teamId: string | undefined;
    t: (k: string, opts?: Record<string, unknown>) => string;
  }) => ReactNode;
};

const SHIPMENTS_LIST_COLUMN_DEFS: ShipmentsListColumnDef[] = [
  {
    key: "mbl",
    labelKey: "pages.ocean.list.colMbl",
    fixed: true,
    minWidth: 260,
    render: ({ shipment: s, teamId }) => (
      <Link
        to={`/app/${teamId}/ocean/shipments/${s.id}`}
        className="flex min-w-0 items-center gap-2"
      >
        <span className="truncate text-sm text-foreground">{s.mbl}</span>
        <ContainerCountPill shipmentId={s.id} />
      </Link>
    ),
  },
  {
    key: "carrier",
    labelKey: "pages.ocean.list.colCarrier",
    fixed: true,
    minWidth: 160,
    render: ({ shipment: s }) => (
      <span className="block truncate text-sm text-foreground">
        {s.carrier?.name ?? "-"}
      </span>
    ),
  },
  {
    key: "route",
    labelKey: "pages.ocean.list.colRoute",
    minWidth: 180,
    render: ({ shipment: s }) =>
      s.pol_location?.name && s.pod_location?.name ? (
        <span className="block truncate text-sm text-foreground">
          {s.pol_location.name} <span className="text-foreground">→</span>{" "}
          {s.pod_location.name}
        </span>
      ) : (
        <span className="text-foreground">-</span>
      ),
  },
  {
    key: "vessel",
    labelKey: "pages.ocean.list.colVessel",
    minWidth: 160,
    render: ({ shipment: s }) =>
      s.vessel_name ? (
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
          <Ship className="h-3.5 w-3.5 shrink-0 text-foreground" />
          <span className="truncate">{s.vessel_name}</span>
        </span>
      ) : (
        <span className="text-foreground">-</span>
      ),
  },
  {
    key: "eta",
    labelKey: "pages.ocean.list.colEta",
    minWidth: 130,
    render: ({ shipment: s, t }) =>
      s.eta ? (
        <EtaCell eta={s.eta} />
      ) : (
        <span className="text-foreground">{t("pages.ocean.list.noEta")}</span>
      ),
  },
  {
    key: "status",
    labelKey: "pages.ocean.list.colStatus",
    minWidth: 140,
    render: ({ shipment: s }) => <StatusBadge status={s.status} />,
  },
  {
    key: "updated",
    labelKey: "pages.ocean.list.colUpdated",
    minWidth: 130,
    render: ({ shipment: s }) => (
      <span className="flex items-center gap-1.5 text-sm text-foreground">
        <Clock className="h-3.5 w-3.5 shrink-0 text-foreground" />
        <span className="truncate">
          {s.updated_at
            ? formatTimeAgo(s.updated_at)
            : s.created_at
              ? formatTimeAgo(s.created_at)
              : "-"}
        </span>
      </span>
    ),
  },
];

// Row-chrome widths — checkbox / chevron / actions. Kept here so the
// min-width calculation stays accurate.
const ROW_CHROME_CHEVRON_W = 32;
const ROW_CHROME_CHECKBOX_W = 40;
const ROW_CHROME_ACTIONS_W = 120;

function ShipmentsTable({
  items,
  teamId,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelect,
  onStop,
  onCopyMbl,
  isStopping,
  expandedId,
  onToggleExpand,
}: {
  items: OceanShipmentEntity[];
  teamId: string | undefined;
  selectedIds: Set<number>;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: number) => void;
  onStop: (s: OceanShipmentEntity) => void;
  onCopyMbl: (mbl: string) => void;
  isStopping: boolean;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
}) {
  const { t } = useTranslation();
  const columns = useResolvedColumns(
    SHIPMENTS_LIST_DOMAIN,
    SHIPMENTS_LIST_COLUMN_DEFS,
  ) as ShipmentsListColumnDef[];

  const tableMinWidth =
    ROW_CHROME_CHEVRON_W +
    ROW_CHROME_CHECKBOX_W +
    columns.reduce((sum, c) => sum + c.minWidth, 0) +
    ROW_CHROME_ACTIONS_W;

  return (
    // Grid-owned horizontal scroll — appears as soon as column total exceeds
    // the card's width. The page itself only scrolls below layout's
    // defaultMinWidth, so the grid scrollbar is always the first one to
    // appear.
    <div className="-mt-6 overflow-x-auto">
      <div style={{ minWidth: `${tableMinWidth}px` }}>
        <Table>
          <TableHeader>
            <TableRow className="border-b-black/20 hover:bg-transparent [&>th]:h-10">
              <TableHead
                className="w-8"
                style={{ width: `${ROW_CHROME_CHEVRON_W}px` }}
                aria-hidden
              />
              <TableHead
                className="w-10"
                style={{ width: `${ROW_CHROME_CHECKBOX_W}px` }}
              >
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onToggleSelectAll}
                />
              </TableHead>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ minWidth: `${col.minWidth}px` }}
                  className={cn(
                    "text-sm text-foreground",
                    col.headerClassName,
                  )}
                >
                  {t(col.labelKey)}
                </TableHead>
              ))}
              <TableHead
                className="w-10"
                style={{ width: `${ROW_CHROME_ACTIONS_W}px` }}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <ShipmentTableRow
                key={s.id}
                shipment={s}
                teamId={teamId}
                columns={columns}
                isSelected={selectedIds.has(s.id)}
                onToggleSelect={() => onToggleSelect(s.id)}
                onStop={() => onStop(s)}
                onCopyMbl={() => onCopyMbl(s.mbl)}
                isStopping={isStopping}
                isExpanded={expandedId === s.id}
                onToggleExpand={() => onToggleExpand(s.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ShipmentTableRow({
  shipment: s,
  teamId,
  columns,
  isSelected,
  onToggleSelect,
  onStop,
  onCopyMbl,
  isStopping,
  isExpanded,
  onToggleExpand,
}: {
  shipment: OceanShipmentEntity;
  teamId: string | undefined;
  columns: ShipmentsListColumnDef[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onStop: () => void;
  onCopyMbl: () => void;
  isStopping: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);
  const canStop =
    s.status === "pending" ||
    s.status === "tracking" ||
    s.status === "awaiting_manifest";

  // +2 row chrome columns on each side of the configurable middle (chevron
  // + checkbox + [columns] + actions) for the expanded-row colSpan.
  const totalCols = 2 + columns.length + 1;

  return (
    <>
      <TableRow
        className="group border-b-black/[0.04] hover:bg-muted/30"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <TableCell className="py-3">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={t(
              isExpanded
                ? "pages.ocean.list.collapseRowAria"
                : "pages.ocean.list.expandRowAria",
            )}
            className="flex h-6 w-6 items-center justify-center rounded-md text-black/50 transition-colors hover:bg-black/[0.06] hover:text-black"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </TableCell>
        <TableCell>
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} />
        </TableCell>
        {columns.map((col) => (
          <TableCell
            key={col.key}
            style={{ minWidth: `${col.minWidth}px` }}
            className={cn(
              // `max-w-0` + `truncate` + `whitespace-nowrap` makes the cell
              // collapse below its own content width so the inline `truncate`
              // inside each render function actually activates.
              "max-w-0 overflow-hidden truncate whitespace-nowrap py-3",
              col.cellClassName,
            )}
          >
            {col.render({ shipment: s, teamId, t })}
          </TableCell>
        ))}
        <TableCell>
          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              showActions ? "opacity-100" : "opacity-0",
            )}
          >
            {canStop && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={isStopping}
                      onClick={onStop}
                      aria-label={t("pages.ocean.list.actions.stopAria")}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("pages.ocean.list.actions.stop")}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onCopyMbl}
                    aria-label={t("pages.ocean.list.actions.copyAria")}
                  >
                    <Copy className="size-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("pages.ocean.list.actions.copy")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t("pages.ocean.list.actions.moreAria")}
            >
              <MoreHorizontal className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={totalCols} className="border-b-black/[0.04] p-0">
            <ShipmentContainersPanel shipmentId={s.id} teamId={teamId} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ShipmentContainersPanel({
  shipmentId,
}: {
  shipmentId: number;
  teamId: string | undefined;
}) {
  const { t } = useTranslation();
  // Lazy-fetch detail only when a row is actually expanded. This reuses the
  // existing `/shipments/{id}` endpoint which returns containers + events in
  // a single round-trip; the byId cache is shared with the detail page so
  // navigating deeper is instant after this.
  const { data, error, isPending } = useOceanShipmentByIdData(shipmentId);

  if (error) {
    return (
      <div className="px-6 py-4 text-xs text-rose-700">
        {t("pages.ocean.list.expand.error")}
      </div>
    );
  }
  if (isPending || !data) {
    return (
      <div className="px-6 py-4 text-xs text-black/55">
        {t("pages.ocean.list.expand.loading")}
      </div>
    );
  }
  if (data.containers.length === 0) {
    return (
      <div className="px-6 py-4 text-xs text-black/55">
        {t("pages.ocean.list.expand.empty")}
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-black/[0.04] px-6 py-2">
      {data.containers.map((c) => {
        const equipment = c.size_type_code ?? c.size_type ?? "-";
        const statusLabel = c.physical_status
          ? t(
              `pages.ocean.containers.physicalStatus.${c.physical_status}`,
            )
          : c.status ?? "-";
        return (
          <div
            key={c.id}
            className="flex items-center gap-4 py-2 text-xs text-foreground"
          >
            <ContainerIcon className="h-3.5 w-3.5 shrink-0 text-foreground" />
            <span className="w-40 shrink-0 text-sm font-medium text-foreground">
              {c.number}
            </span>
            <span className="w-16 shrink-0 text-black/70">{equipment}</span>
            <span className="flex-1 truncate text-black/70">{statusLabel}</span>
            <span className="shrink-0 text-black/55">
              {c.terminal_location?.name ?? ""}
            </span>
            {c.lfd && (
              <span className="shrink-0 text-[11px] text-black/50">
                LFD: {formatDate(c.lfd)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Compact "(N)" badge showing the container count inline with the MBL.
// Re-uses the detail endpoint (`/shipments/{id}`) because the list payload
// doesn't include container counts yet — React Query dedupes the fetch per
// shipment_id so row-expansion / sidebar / detail page all share this
// cache. Browser's 6-concurrent-connections cap naturally rate-limits the
// burst on first paint; once a count is cached, re-renders don't refetch.
// A dedicated `container_count` field on the list response would let this
// surface instantly without the per-row round-trip.
function ContainerCountPill({ shipmentId }: { shipmentId: number }) {
  const { t } = useTranslation();
  const data = useOceanShipmentByIdData(shipmentId).data;
  if (!data) return null;
  const count = data.containers.length;
  if (count === 0) return null;
  return (
    <span className="ml-1 inline-flex shrink-0 items-center rounded-full bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-black/60">
      {t("pages.ocean.list.mblContainerCount", { count })}
    </span>
  );
}

function EtaCell({ eta }: { eta: string }) {
  const etaDate = new Date(eta);
  const now = new Date();
  const diffDays = Math.floor(
    (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const formatted = formatDate(eta);

  const isOverdue = etaDate < now;
  const isImminent = !isOverdue && diffDays <= 3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        isOverdue
          ? "text-red-600"
          : isImminent
            ? "text-amber-600"
            : "text-black/80",
      )}
    >
      <Anchor className="h-3 w-3" />
      {formatted}
      {isImminent && !isOverdue && (
        <span className="text-xs">({diffDays}d)</span>
      )}
    </span>
  );
}

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  tracking: "bg-emerald-50 text-emerald-700",
  awaiting_manifest: "bg-slate-50 text-slate-700",
  failed: "bg-red-50 text-red-700",
  stopped: "bg-slate-50 text-slate-600",
  cancelled: "bg-slate-50 text-slate-500",
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const className = STATUS_CLASS[status] ?? "bg-black/[0.04] text-black/60";
  // Unknown status strings pass through as-is.
  const label =
    status in STATUS_CLASS
      ? t(`pages.ocean.list.status.${status}`)
      : status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function EmptyState({
  teamId,
  hasFilters,
  view,
}: {
  teamId: string | undefined;
  hasFilters: boolean;
  view: ViewId;
}) {
  const { t } = useTranslation();
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 py-16 text-center">
        <span className="text-sm font-medium text-black">
          {t("pages.ocean.list.emptyFiltered")}
        </span>
        <span className="text-xs text-black/55">
          {t("pages.ocean.list.emptyFilteredHint")}
        </span>
      </div>
    );
  }
  const viewMatch = VIEWS.find((v) => v.id === view);
  const viewLabel = viewMatch ? t(viewMatch.labelKey).toLowerCase() : "";
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-black/10 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-black/[0.02] text-black/45">
        <ContainerIcon className="h-5 w-5" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <span className="text-sm font-medium text-black">
          {view === "all"
            ? t("pages.ocean.list.emptyAll")
            : t("pages.ocean.list.emptyView", { view: viewLabel })}
        </span>
        <span className="text-xs text-black/55">
          {t("pages.ocean.list.emptyHint")}
        </span>
      </div>
      <Link to={`/app/${teamId}/ocean/track`}>
        <Button
          type="button"
          className="mt-2 gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/80"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("pages.ocean.list.trackButton")}
        </Button>
      </Link>
    </div>
  );
}
