import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container as ContainerIcon, Plus } from "lucide-react";
import { formatTimeAgo } from "@/lib/time";
import { useOceanShipmentsData } from "@/hooks/queries/use-ocean-shipments-data";

const MAX_ITEMS = 5;

// Right column of the dashboard middle row — mirrors the reference
// "Latest Files" card layout but surfaces the newest shipment registrations.
// Falls back to an empty state when the query has no data (fresh team).
export default function LatestShipmentsCard() {
  const { t } = useTranslation();
  const params = useParams();
  const teamId = params.teamId;
  const { data, isPending } = useOceanShipmentsData();

  const shipments = (data?.data ?? []).slice(0, MAX_ITEMS);
  const isEmpty = !isPending && shipments.length === 0;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">
          {t("pages.dashboard.latest.title")}
        </h3>
        <Link
          to={`/app/${teamId}/ocean/shipments`}
          className="text-xs text-black/55 transition-colors hover:text-black"
        >
          {t("pages.dashboard.latest.viewAll")}
        </Link>
      </header>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-black/[0.02] px-4 py-10 text-center">
          <ContainerIcon className="h-5 w-5 text-black/30" />
          <p className="text-xs text-black/55">
            {t("pages.dashboard.latest.empty")}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-black/[0.05]">
          {shipments.map((s) => (
            <li key={s.id}>
              <Link
                to={`/app/${teamId}/ocean/shipments/${s.id}`}
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-black/[0.02]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-black/70">
                  <ContainerIcon className="h-4 w-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {s.mbl}
                  </span>
                  <span className="truncate text-xs text-black/55">
                    {s.carrier?.name ?? t("pages.dashboard.latest.unknownCarrier")}
                    {s.pol_location?.name && s.pod_location?.name ? (
                      <>
                        {" · "}
                        {s.pol_location.name} → {s.pod_location.name}
                      </>
                    ) : null}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-black/55">
                  {s.created_at ? formatTimeAgo(s.created_at) : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to={`/app/${teamId}/ocean/track`}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/15 px-4 py-3 text-xs text-black/70 transition-colors hover:border-black/30 hover:bg-black/[0.02] hover:text-black"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("pages.dashboard.latest.trackCta")}
      </Link>
    </section>
  );
}
