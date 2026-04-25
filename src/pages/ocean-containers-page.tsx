import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Anchor,
  CheckCircle2,
  Clock,
  Container as ContainerIcon,
  Layers,
  Search,
  Ship,
} from "lucide-react";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOceanContainersData } from "@/hooks/queries/use-ocean-containers-data";
import { useOpenOceanShipmentDetailSidebar } from "@/store/ocean-shipment-detail-sidebar";
import type {
  OceanContainerListParams,
  OceanContainerListRow,
} from "@/api/ocean-container";
import type { ContainerPhysicalStatus } from "@/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// Physical-status tabs. Same axis as Shipments page but one level deeper —
// here we filter containers directly (not shipments with any matching
// container). Values map 1:1 to the backend ContainerPhysicalStatus enum.
type TabId = "all" | "on_ship" | "arrived" | "stopped";

type TabDef = {
  id: TabId;
  labelKey: string;
  icon: React.ReactNode;
  physicalStatuses?: ContainerPhysicalStatus[];
};

const TABS: TabDef[] = [
  {
    id: "all",
    labelKey: "pages.ocean.containers.viewAll",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    id: "on_ship",
    labelKey: "pages.ocean.containers.viewOnShip",
    icon: <Ship className="h-4 w-4" />,
    physicalStatuses: ["on_ship", "loaded"],
  },
  {
    id: "arrived",
    labelKey: "pages.ocean.containers.viewArrived",
    icon: <Anchor className="h-4 w-4" />,
    physicalStatuses: ["discharged", "gate_out"],
  },
  {
    id: "stopped",
    labelKey: "pages.ocean.containers.viewStopped",
    icon: <CheckCircle2 className="h-4 w-4" />,
    physicalStatuses: ["empty_returned"],
  },
];

// Container-level "badge" colors — matches shipment StatusBadge palette but
// keyed on physical_status (not tracking status).
const PHYSICAL_STATUS_CLASS: Record<string, string> = {
  registered: "bg-slate-50 text-slate-700",
  gate_in: "bg-blue-50 text-blue-700",
  loaded: "bg-indigo-50 text-indigo-700",
  on_ship: "bg-emerald-50 text-emerald-700",
  discharged: "bg-amber-50 text-amber-700",
  gate_out: "bg-orange-50 text-orange-700",
  empty_returned: "bg-slate-50 text-slate-600",
  unknown: "bg-black/[0.04] text-black/55",
};

export default function OceanContainersPage() {
  const { t } = useTranslation();
  const params = useParams();
  const teamId = params.teamId;
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");

  const listParams: OceanContainerListParams = useMemo(() => {
    const next: OceanContainerListParams = { take: 50, include_total: true };
    const current = TABS.find((t) => t.id === tab);
    if (current?.physicalStatuses?.length === 1) {
      next.where__physical_status__equal = current.physicalStatuses[0];
    } else if (current?.physicalStatuses?.length) {
      // Backend expects a single value; for the "On Ship" tab which covers
      // two statuses we narrow client-side below. First status still gets
      // the server filter so paginated counts stay meaningful.
      next.where__physical_status__equal = current.physicalStatuses[0];
    }
    const q = search.trim();
    if (q) {
      // If it looks like a container number (letters+digits, 4+ chars no space)
      // prefer number search; otherwise fall back to MBL.
      if (/^[A-Za-z]{3,4}\d{5,7}$/.test(q)) {
        next.where__number__i_like = q;
      } else {
        next.where__mbl__i_like = q;
      }
    }
    return next;
  }, [tab, search]);

  const { data, error, isPending } = useOceanContainersData(listParams);

  // Client-side narrowing for multi-status tabs (server accepts a single
  // equal-filter). Safe: pagination is per-server query, filtering here
  // only trims the current page.
  const rows: OceanContainerListRow[] = useMemo(() => {
    if (!data) return [];
    const current = TABS.find((tt) => tt.id === tab);
    if (!current?.physicalStatuses || current.physicalStatuses.length <= 1) {
      return data.data;
    }
    const allowed = new Set<string>(current.physicalStatuses);
    return data.data.filter(
      (r) => r.physical_status != null && allowed.has(r.physical_status),
    );
  }, [data, tab]);

  return (
    <div className="flex min-w-max flex-col gap-6 p-7">
      <div className="flex items-start gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-black">
            {t("pages.ocean.containers.title")}
          </h1>
          <p className="text-sm text-black/55">
            {t("pages.ocean.containers.description")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-black/10">
        {TABS.map((v) => {
          const isActive = tab === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setTab(v.id)}
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

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/[0.04] bg-muted/50 p-2">
        <div className="relative flex min-w-[320px] flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-black/45" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("pages.ocean.containers.searchPlaceholder")}
            className="rounded-xl border-black/10 bg-white pl-9 text-sm"
          />
        </div>
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] py-16 text-center">
          <ContainerIcon className="h-6 w-6 text-black/30" />
          <p className="text-sm text-black/60">
            {t("pages.ocean.containers.empty")}
          </p>
        </div>
      ) : (
        <ContainersTable rows={rows} teamId={teamId} />
      )}

      {data && !isPending && (
        <div className="flex items-center justify-between text-xs text-black/55">
          <span>
            {t("pages.ocean.containers.shown", { count: rows.length })}
            {data.meta.total !== null
              ? t("pages.ocean.containers.total", { total: data.meta.total })
              : ""}
          </span>
          {data.meta.hasMore && (
            <span>{t("pages.ocean.containers.hasMore")}</span>
          )}
        </div>
      )}
    </div>
  );
}

function ContainersTable({
  rows,
  teamId,
}: {
  rows: OceanContainerListRow[];
  teamId: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-black/20 hover:bg-transparent">
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colNumber")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colShipment")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colEquipment")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colCarrier")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colRoute")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colEta")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colStatus")}
          </TableHead>
          <TableHead className="text-sm text-foreground">
            {t("pages.ocean.containers.colTerminal")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <ContainerTableRow key={r.id} row={r} teamId={teamId} />
        ))}
      </TableBody>
    </Table>
  );
}

function ContainerTableRow({
  row: r,
}: {
  row: OceanContainerListRow;
  teamId: string | undefined;
}) {
  const { t } = useTranslation();
  const openDetailSidebar = useOpenOceanShipmentDetailSidebar();
  // Prefer the normalized code so all "40 HC" variants render identically;
  // fall back to raw only when normalizer hasn't matched yet.
  const equipment = r.size_type_code ?? r.size_type ?? "-";
  const physicalLabel = r.physical_status
    ? t(`pages.ocean.containers.physicalStatus.${r.physical_status}`)
    : r.status ?? "-";
  const badgeClass =
    PHYSICAL_STATUS_CLASS[r.physical_status ?? ""] ??
    "bg-black/[0.04] text-black/60";

  return (
    <TableRow className="border-b-black/[0.04] hover:bg-muted/30">
      <TableCell className="py-3">
        <button
          type="button"
          onClick={() =>
            openDetailSidebar(r.shipment_id, {
              focusContainerNumber: r.number,
            })
          }
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
        >
          <ContainerIcon className="h-3.5 w-3.5 text-foreground" />
          {r.number}
        </button>
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        <button
          type="button"
          onClick={() => openDetailSidebar(r.shipment_id)}
          className="cursor-pointer text-sm text-foreground"
        >
          {r.mbl}
        </button>
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">{equipment}</TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        {r.carrier?.name ?? "-"}
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        {r.pol_location?.name && r.pod_location?.name ? (
          <span>
            {r.pol_location.name}{" "}
            <span className="text-foreground">→</span> {r.pod_location.name}
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        {r.eta ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-foreground" />
            {formatDate(r.eta)}
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
            badgeClass,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {physicalLabel}
        </span>
      </TableCell>
      <TableCell className="py-3 text-sm text-foreground">
        {r.terminal_location?.name ?? "-"}
      </TableCell>
    </TableRow>
  );
}
