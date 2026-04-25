import { useEffect, useRef, useState, useMemo, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Anchor,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Container as ContainerIcon,
  MapPin,
  Pencil,
  RotateCw,
  Ship,
  StopCircle,
} from "lucide-react";
import { toast } from "sonner";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { useOceanShipmentByIdData } from "@/hooks/queries/use-ocean-shipment-by-id-data";
import { useStopOceanShipment } from "@/hooks/mutations/ocean-shipment/use-stop-ocean-shipment";
import { useResubmitOceanShipment } from "@/hooks/mutations/ocean-shipment/use-resubmit-ocean-shipment";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useOpenOceanShipmentOrganizeModal } from "@/store/ocean-shipment-organize-modal";
import { formatTimeAgo } from "@/lib/time";
import { formatDate, formatTime } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import type {
  OceanContainerEntity,
  OceanShipmentDetail,
  OceanContainerEventEntity,
} from "@/types";
import ShipmentRouteMap from "@/components/ocean/shipment-route-map";

export default function OceanShipmentDetailPage() {
  const params = useParams();
  const openAlertModal = useOpenAlertModal();
  const openOrganizeModal = useOpenOceanShipmentOrganizeModal();
  const teamId = params.teamId;
  const shipmentId = params.shipmentId ? Number(params.shipmentId) : NaN;
  const { t } = useTranslation();

  const { data, error, isPending } = useOceanShipmentByIdData(
    Number.isNaN(shipmentId) ? undefined : shipmentId,
  );

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

  const { mutate: resubmitShipment, isPending: isResubmitShipmentPending } =
    useResubmitOceanShipment({
      onSuccess: () => {
        toast.success(t("pages.ocean.detail.resubmitSuccess"), {
          position: "top-center",
        });
      },
      onError: (apiError) => {
        toast.error(generateErrorMessage(apiError), {
          position: "top-center",
        });
      },
    });

  if (Number.isNaN(shipmentId)) {
    return <Navigate to={`/app/${teamId}/ocean/shipments`} replace />;
  }
  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const s = data;
  // Active states are the ones a user may want to stop. Terminal states
  // (failed / stopped / cancelled) can instead be resubmitted to restart
  // tracking — the backend flips status back to "pending" and re-dispatches
  // the scrape task.
  const isActiveStatus =
    s.status === "pending" ||
    s.status === "tracking" ||
    s.status === "awaiting_manifest";
  const canResubmit =
    s.status === "failed" ||
    s.status === "stopped" ||
    s.status === "cancelled";

  const handleStopClick = () => {
    openAlertModal({
      title: t("pages.ocean.detail.stopConfirmTitle", { mbl: s.mbl }),
      description: t("pages.ocean.detail.stopConfirmDescription"),
      onPositive: () => stopShipment(s.id),
    });
  };

  const handleResubmitClick = () => {
    openAlertModal({
      title: t("pages.ocean.detail.resubmitConfirmTitle", { mbl: s.mbl }),
      description: t("pages.ocean.detail.resubmitConfirmDescription"),
      onPositive: () => resubmitShipment(s.id),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex items-center gap-2 text-xs text-black/55">
        <Link
          to={`/app/${teamId}/ocean/shipments`}
          className="inline-flex items-center gap-1 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-3 w-3" />
          {t("pages.ocean.detail.back")}
        </Link>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-black">{s.mbl}</h1>
              <StatusBadge status={s.status} />
            </div>
            <p className="text-sm text-black/55">
              {s.carrier?.name ?? t("pages.ocean.detail.carrierPending")}
              {s.voyage_number
                ? ` · ${t("pages.ocean.detail.voyagePrefix")} ${s.voyage_number}`
                : ""}
            </p>
          </div>
          {/* Inline user metadata — Customer / Ref Numbers / Tags in a
              compact horizontal strip, Terminal49 style. The edit pencil
              lives in the action-button row on the far right (sibling of
              Stop tracking) and opens the organize modal. */}
          <HeaderMetaStrip shipment={s} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openOrganizeModal(s)}
              aria-label={t("common.edit")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black/55 transition-colors hover:border-black/20 hover:text-black"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {canResubmit && (
              <Button
                type="button"
                variant="outline"
                disabled={isResubmitShipmentPending}
                onClick={handleResubmitClick}
                className="gap-1.5 rounded-xl border-emerald-500/20 text-sm text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
              >
                <RotateCw className="h-4 w-4" />
                {t("pages.ocean.detail.resubmitTracking")}
              </Button>
            )}
            {isActiveStatus && (
              <Button
                type="button"
                variant="outline"
                disabled={isStopShipmentPending}
                onClick={handleStopClick}
                className="gap-1.5 rounded-xl border-red-500/20 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <StopCircle className="h-4 w-4" />
                {t("pages.ocean.detail.stopTracking")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-black/5 pt-4 md:grid-cols-4">
          <MetaItem
            icon={<MapPin className="h-3.5 w-3.5" />}
            label={t("pages.ocean.detail.routeLabel")}
            value={
              s.pol_location?.name && s.pod_location?.name
                ? `${s.pol_location?.name} → ${s.pod_location?.name}`
                : t("pages.ocean.detail.routeCollecting")
            }
          />
          <MetaItem
            icon={<Ship className="h-3.5 w-3.5" />}
            label={t("pages.ocean.detail.vesselLabel")}
            value={s.vessel_name ?? "-"}
          />
          <MetaItem
            icon={<Anchor className="h-3.5 w-3.5" />}
            label={t("pages.ocean.detail.etaLabel")}
            value={formatDateSafe(s.eta) ?? t("pages.ocean.list.noEta")}
            hint={
              formatDateSafe(s.etd)
                ? `${t("pages.ocean.detail.etdPrefix")} ${formatDateSafe(s.etd)}`
                : undefined
            }
          />
          <MetaItem
            icon={<Clock className="h-3.5 w-3.5" />}
            label={t("pages.ocean.detail.nextScrape")}
            value={
              s.next_scrape_at
                ? formatDateSafe(s.next_scrape_at) ?? "-"
                : t("pages.ocean.detail.stoppedAuto")
            }
            hint={
              s.next_scrape_at ? formatTimeAgo(s.next_scrape_at) : undefined
            }
          />
        </div>
      </div>

      {/* Route map — replaces the previous Details card slot. Renders a
          premium Terminal49-style POL→POD arc with bobbing anchor pins
          and a "zoom out → fit bounds" entry animation. */}
      <ShipmentRouteMap
        pol={s.pol_location}
        pod={s.pod_location}
        status={s.status}
        etd={s.etd}
        eta={s.eta}
        updatedAt={s.updated_at}
      />

      <ContainersSection
        containers={s.containers}
        events={s.events}
      />
    </div>
  );
}

export function formatDateSafe(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return formatDate(iso);
}

export function MetaItem({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-black/55">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium text-black">{value}</span>
      {hint && <span className="text-xs text-black/55">{hint}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Containers section — one card per container, each with a nested event
// timeline. Every event is guaranteed to belong to a specific container
// (backend schema: `container_id NOT NULL`). Vessel-level events are fanned
// out by the scraper to each container on the shipment, so conceptual
// "shipment events" appear in every container's timeline.
// ---------------------------------------------------------------------------

export function ContainersSection({
  containers,
  events,
  focusContainerNumber,
}: {
  containers: OceanContainerEntity[];
  events: OceanContainerEventEntity[];
  // When provided, the matching container card auto-expands on mount and
  // scrolls into view. Used by the detail sidebar when opened from a
  // container-number click in the Containers page / expanded shipment row.
  focusContainerNumber?: string | null;
}) {
  const { t } = useTranslation();

  const eventsByContainer = useMemo(() => {
    const map = new Map<number, OceanContainerEventEntity[]>();
    for (const e of events) {
      const arr = map.get(e.container_id);
      if (arr) {
        arr.push(e);
      } else {
        map.set(e.container_id, [e]);
      }
    }
    return map;
  }, [events]);

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ContainerIcon className="h-4 w-4 text-black/60" />
          <h2 className="text-sm font-semibold text-black">
            {t("pages.ocean.detail.containersTitle")}
            <span className="ml-2 text-xs font-normal text-black/55">
              {t("pages.ocean.detail.containersCount", {
                count: containers.length,
              })}
            </span>
          </h2>
        </div>
      </div>
      {containers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 py-8 text-center">
          <span className="text-sm font-medium text-black">
            {t("pages.ocean.detail.containersEmpty")}
          </span>
          <span className="text-xs text-black/55">
            {t("pages.ocean.detail.containersEmptyHint")}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {containers.map((c) => (
            <ContainerCard
              key={c.id}
              container={c}
              events={eventsByContainer.get(c.id) ?? []}
              autoOpen={
                !!focusContainerNumber && c.number === focusContainerNumber
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ContainerCard({
  container,
  events,
  autoOpen,
}: {
  container: OceanContainerEntity;
  events: OceanContainerEventEntity[];
  // When true on initial mount, the card starts expanded and scrolls itself
  // into view. Used when the detail sidebar is opened from a container-number
  // click so the user sees the relevant timeline without extra clicks.
  autoOpen?: boolean;
}) {
  const { t } = useTranslation();
  // Start collapsed — matches the "click to expand" UX. Detail pages often
  // have 3-5 containers each with 10+ events, so an all-open default
  // overflows the viewport and hides the overview/map.
  const [isOpen, setIsOpen] = useState(!!autoOpen);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoOpen) return;
    setIsOpen(true);
    // Defer the scroll to the next paint so the expanded content has
    // reserved its height before we ask the browser to center it.
    const id = window.requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(id);
  }, [autoOpen]);

  // Prefer the normalized values for display — stable across carriers and
  // safe for i18n. Fall back to raw only when normalization is NULL.
  const equipment =
    container.size_type_code ??
    container.size_type ??
    t("pages.ocean.detail.sizeUnknown");
  const statusLabel = container.physical_status
    ? t(`pages.ocean.containers.physicalStatus.${container.physical_status}`)
    : container.status ?? "";

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-xl border border-black/10 bg-white"
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-black/[0.02]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <ContainerIcon className="h-4 w-4 shrink-0 text-black/55" />
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-sm font-medium text-black">
              {container.number}
            </span>
            <span className="text-xs text-black/55">
              {equipment}
              {container.terminal_location?.name ? ` · ${container.terminal_location?.name}` : ""}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {container.lfd && (
            <span className="hidden text-xs text-black/60 sm:inline">
              LFD {formatDateSafe(container.lfd)}
            </span>
          )}
          {statusLabel && (
            <span className="max-w-[200px] truncate text-xs font-medium text-black/80">
              {statusLabel}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-black/45 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-black/5 px-4 py-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-4 text-center">
              <span className="text-xs font-medium text-black/70">
                {t("pages.ocean.detail.containerEventsEmpty")}
              </span>
              <span className="text-[11px] text-black/55">
                {t("pages.ocean.detail.containerEventsEmptyHint")}
              </span>
            </div>
          ) : (
            <Timeline events={events} />
          )}
        </div>
      )}
    </div>
  );
}

function Timeline({ events }: { events: OceanContainerEventEntity[] }) {
  const groups = groupByDate(events);

  return (
    <div className="flex flex-col gap-6">
      {groups.map(({ date, items }) => (
        <div key={date} className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-black/55">
            {date}
          </span>
          <div className="relative flex flex-col gap-3 pl-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-black/10" />
            {items.map((e) => (
              <TimelineItem key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineItem({ event }: { event: OceanContainerEventEntity }) {
  const { t } = useTranslation();
  const isEstimated = event.event_type === "ESTIMATED";
  return (
    <div className="relative flex items-start gap-3">
      <span
        className={cn(
          "absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full border-2",
          isEstimated
            ? "border-black/30 bg-white"
            : "border-black bg-black",
        )}
      />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black">
            {event.description ??
              event.event_type ??
              t("pages.ocean.detail.eventPlaceholder")}
          </span>
          {isEstimated && (
            <span className="rounded-full bg-black/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-black/50">
              {t("pages.ocean.detail.estimatedBadge")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-black/50">
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location?.name}
            </span>
          )}
          {event.timestamp && <span>{formatTime(event.timestamp)}</span>}
        </div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-black/20" />
    </div>
  );
}

function groupByDate(events: OceanContainerEventEntity[]) {
  const out: { date: string; items: OceanContainerEventEntity[] }[] = [];
  for (const e of events) {
    if (!e.timestamp) continue;
    const dateKey = formatDate(e.timestamp);
    const last = out[out.length - 1];
    if (last && last.date === dateKey) {
      last.items.push(e);
    } else {
      out.push({ date: dateKey, items: [e] });
    }
  }
  return out;
}

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  tracking: "bg-emerald-50 text-emerald-700",
  awaiting_manifest: "bg-slate-100 text-slate-700",
  failed: "bg-red-50 text-red-700",
  stopped: "bg-slate-100 text-slate-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const className = STATUS_CLASS[status] ?? "bg-black/[0.04] text-black/60";
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

// ---------------------------------------------------------------------------
// Organize section — Customer / Ref# / Tags read-only header strip. Editing
// happens in OceanShipmentOrganizeModal (opened by the pencil button).
// ---------------------------------------------------------------------------

// Compact horizontal metadata strip for the top-right of the header card.
// Mirrors Terminal49's "REFERENCE NUMBERS · TAGS · STEAMSHIP LINE" row
// layout, scoped to Customer / Ref Numbers / Tags. The edit pencil beside
// Stop tracking opens OceanShipmentOrganizeModal for inline edits.
export function HeaderMetaStrip({
  shipment,
}: {
  shipment: OceanShipmentDetail;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-20">
      <HeaderMetaCell
        label={t("pages.ocean.track.quick.customerLabel")}
        emphasis
      >
        {shipment.customer ? (
          <span className="truncate">{shipment.customer.name}</span>
        ) : (
          <span className="text-black/40">—</span>
        )}
      </HeaderMetaCell>
      <HeaderMetaCell label={t("pages.ocean.track.quick.refLabel")}>
        {shipment.ref_numbers.length === 0 ? (
          <span className="text-black/40">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {shipment.ref_numbers.slice(0, 3).map((v) => (
              <span
                key={v}
                className="inline-flex items-center rounded bg-black/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-black/80"
              >
                {v}
              </span>
            ))}
            {shipment.ref_numbers.length > 3 && (
              <span className="text-[11px] text-black/55">
                +{shipment.ref_numbers.length - 3}
              </span>
            )}
          </div>
        )}
      </HeaderMetaCell>
      <HeaderMetaCell label={t("pages.ocean.track.quick.tagsLabel")}>
        {shipment.tags.length === 0 ? (
          <span className="text-black/40">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {shipment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-1.5 py-0.5 text-[11px] font-medium text-black"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: tag.color ?? "#9ca3af" }}
                />
                {tag.name}
              </span>
            ))}
            {shipment.tags.length > 3 && (
              <span className="text-[11px] text-black/55">
                +{shipment.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </HeaderMetaCell>
    </div>
  );
}

function HeaderMetaCell({
  label,
  emphasis,
  children,
}: {
  label: string;
  emphasis?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 max-w-[220px] flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
        {label}
      </span>
      <span
        className={cn(
          "min-w-0 truncate text-sm",
          emphasis ? "font-semibold text-black" : "text-black/80",
        )}
      >
        {children}
      </span>
    </div>
  );
}
