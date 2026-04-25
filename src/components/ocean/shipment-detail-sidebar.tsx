import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  Anchor,
  ArrowLeft,
  Clock,
  ExternalLink,
  MapPin,
  Ship,
} from "lucide-react";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import ShipmentRouteMap from "@/components/ocean/shipment-route-map";
import {
  ContainersSection,
  HeaderMetaStrip,
  MetaItem,
  StatusBadge,
  formatDateSafe,
} from "@/pages/ocean-shipment-detail-page";
import { useOceanShipmentByIdData } from "@/hooks/queries/use-ocean-shipment-by-id-data";
import {
  useCloseOceanShipmentDetailSidebar,
  useOceanShipmentDetailSidebarFocusContainer,
  useOceanShipmentDetailSidebarIsOpen,
  useOceanShipmentDetailSidebarShipmentId,
  useResetOceanShipmentDetailSidebar,
} from "@/store/ocean-shipment-detail-sidebar";
import { formatTimeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

// Floating right-side panel that renders a shipment's detail without
// navigating away. Mounted by TeamScopedLayout so it overlays every page
// (including the chat RightPanel). Clicking the scrim or the back button
// closes it; the external-link icon opens the full detail page in the same
// tab for deep links / sharing.
//
// Animation: the panel is always mounted but only occupies space while
// `isOpen`. A CSS transition on `translate-x` gives the slide-in + fade-out.
// After `close()` sets isOpen=false we let the transition finish (200ms)
// before resetting the stored shipmentId so content doesn't pop away mid-
// animation.
export default function ShipmentDetailSidebar() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const isOpen = useOceanShipmentDetailSidebarIsOpen();
  const shipmentId = useOceanShipmentDetailSidebarShipmentId();
  const focusContainerNumber = useOceanShipmentDetailSidebarFocusContainer();
  const close = useCloseOceanShipmentDetailSidebar();
  const reset = useResetOceanShipmentDetailSidebar();
  const teamId = params.teamId;

  // Clear the stored shipment after the exit animation so the next open()
  // doesn't flash the previous content while the fresh data loads.
  const [mountedShipmentId, setMountedShipmentId] = useState<number | null>(
    shipmentId,
  );
  useEffect(() => {
    if (isOpen && shipmentId !== null) {
      setMountedShipmentId(shipmentId);
      return;
    }
    if (!isOpen && mountedShipmentId !== null) {
      const timeout = window.setTimeout(() => {
        setMountedShipmentId(null);
        reset();
      }, 220);
      return () => window.clearTimeout(timeout);
    }
  }, [isOpen, shipmentId, mountedShipmentId, reset]);

  // Close on Escape — Terminal49-style modal dismiss.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const handleOpenFullPage = () => {
    if (!shipmentId || !teamId) return;
    close();
    navigate(`/app/${teamId}/ocean/shipments/${shipmentId}`);
  };

  return (
    <>
      {/* Scrim — click-to-close + darkens the background while open. Sits
          above the right-panel aside (z-40) but below the sidebar itself. */}
      <div
        onClick={close}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-200",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed top-0 right-0 z-50 flex h-screen w-full max-w-[720px] flex-col bg-white shadow-2xl transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {mountedShipmentId !== null && (
          <SidebarBody
            shipmentId={mountedShipmentId}
            focusContainerNumber={focusContainerNumber}
            onBack={close}
            onOpenFullPage={handleOpenFullPage}
            backLabel={t("pages.ocean.detail.back")}
            openFullLabel={t("pages.ocean.detail.openFullPage")}
          />
        )}
      </aside>
    </>
  );
}

function SidebarBody({
  shipmentId,
  focusContainerNumber,
  onBack,
  onOpenFullPage,
  backLabel,
  openFullLabel,
}: {
  shipmentId: number;
  focusContainerNumber: string | null;
  onBack: () => void;
  onOpenFullPage: () => void;
  backLabel: string;
  openFullLabel: string;
}) {
  const { t } = useTranslation();
  const { data, error, isPending } = useOceanShipmentByIdData(shipmentId);

  return (
    <>
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onOpenFullPage}
          aria-label={openFullLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <Fallback />
        ) : isPending ? (
          <Loader />
        ) : (
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-black">
                      {data.mbl}
                    </h1>
                    <StatusBadge status={data.status} />
                  </div>
                  <p className="text-sm text-black/55">
                    {data.carrier?.name ?? t("pages.ocean.detail.carrierPending")}
                    {data.voyage_number
                      ? ` · ${t("pages.ocean.detail.voyagePrefix")} ${data.voyage_number}`
                      : ""}
                  </p>
                </div>
                <HeaderMetaStrip shipment={data} />
              </div>
              <div className="grid grid-cols-1 gap-4 border-t border-black/5 pt-4 md:grid-cols-2">
                <MetaItem
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label={t("pages.ocean.detail.routeLabel")}
                  value={
                    data.pol_location?.name && data.pod_location?.name
                      ? `${data.pol_location?.name} → ${data.pod_location?.name}`
                      : t("pages.ocean.detail.routeCollecting")
                  }
                />
                <MetaItem
                  icon={<Ship className="h-3.5 w-3.5" />}
                  label={t("pages.ocean.detail.vesselLabel")}
                  value={data.vessel_name ?? "-"}
                />
                <MetaItem
                  icon={<Anchor className="h-3.5 w-3.5" />}
                  label={t("pages.ocean.detail.etaLabel")}
                  value={formatDateSafe(data.eta) ?? t("pages.ocean.list.noEta")}
                  hint={
                    formatDateSafe(data.etd)
                      ? `${t("pages.ocean.detail.etdPrefix")} ${formatDateSafe(data.etd)}`
                      : undefined
                  }
                />
                <MetaItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label={t("pages.ocean.detail.nextScrape")}
                  value={
                    data.next_scrape_at
                      ? formatDateSafe(data.next_scrape_at) ?? "-"
                      : t("pages.ocean.detail.stoppedAuto")
                  }
                  hint={
                    data.next_scrape_at
                      ? formatTimeAgo(data.next_scrape_at)
                      : undefined
                  }
                />
              </div>
            </div>
            <ShipmentRouteMap
              pol={data.pol_location}
              pod={data.pod_location}
              status={data.status}
              etd={data.etd}
              eta={data.eta}
              updatedAt={data.updated_at}
            />
            <ContainersSection
              containers={data.containers}
              events={data.events}
              focusContainerNumber={focusContainerNumber}
            />
          </div>
        )}
      </div>
    </>
  );
}
