import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AtRiskTable from "@/components/dashboard/at-risk-table";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import LatestShipmentsCard from "@/components/dashboard/latest-shipments-card";
import OnTheWaterFeed from "@/components/dashboard/on-the-water-feed";
import TeamPulseCard from "@/components/dashboard/team-pulse-card";
import { useOceanShipmentsData } from "@/hooks/queries/use-ocean-shipments-data";
import { useTeamUsageData } from "@/hooks/queries/use-team-usage-data";
import { useSession } from "@/store/session";

// Earliest upcoming ETA across the shipment list — picks the smallest
// future ETA, otherwise falls back to "—". Computed client-side because
// the list endpoint doesn't yet surface a `next_eta` field.
function pickNextEta(etas: (string | null)[]): string | null {
  const now = Date.now();
  const future = etas
    .filter((e): e is string => !!e)
    .map((e) => new Date(e).getTime())
    .filter((t) => !Number.isNaN(t) && t >= now)
    .sort((a, b) => a - b);
  if (future.length === 0) return null;
  return new Date(future[0]).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Dashboard Overview — redesigned around a "team pulse" hero, a live
// activity feed, a latest-shipments list, and an at-risk table. The
// hero + latest list use real hooks (shipments, team usage); the
// activity feed and at-risk rows read from mock data until matching
// backend endpoints land. Wiring points are labelled inline so the
// swap-in later is mechanical.
export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const session = useSession();
  const teamId = params.teamId ? Number(params.teamId) : undefined;

  const { data: shipmentsData } = useOceanShipmentsData();
  const { data: usage } = useTeamUsageData({ teamId, days: 30 });

  const shipments = shipmentsData?.data ?? [];

  const pulse = useMemo(() => {
    const total = shipments.length;
    const active = shipments.filter(
      (s) =>
        s.status === "tracking" ||
        s.status === "pending" ||
        s.status === "awaiting_manifest",
    ).length;
    const issues = shipments.filter(
      (s) => s.status === "failed" || s.status === "stopped",
    ).length;
    // On-time rate — fallback metric since we don't track historical
    // completion yet: inverse ratio of issue shipments.
    const onTimeRate =
      total === 0 ? 100 : Math.round(((total - issues) / total) * 100);
    const nextEta = pickNextEta(shipments.map((s) => s.eta));
    const status: "on-track" | "delayed" | "attention" =
      onTimeRate >= 90
        ? "on-track"
        : onTimeRate >= 70
          ? "attention"
          : "delayed";
    return { total, active, onTimeRate, nextEta, status };
  }, [shipments]);

  const teamName =
    session?.user.teams.find((teamRow) => teamRow.team_id === teamId)
      ?.team_name ??
    t("team.untitledTeam", { id: teamId ?? "" });

  // Member avatars — no per-team member list at /user/me yet, so fall
  // back to pravatar thumbs keyed off the current user. Swap for the
  // real member roster (useTeamMembersData) once wired.
  const memberAvatars = [
    `https://i.pravatar.cc/40?u=${session?.user.id ?? "me"}`,
    "https://i.pravatar.cc/40?u=dana",
    "https://i.pravatar.cc/40?u=jun",
  ];
  const extraMemberCount = 2;

  const handleTrackClick = () => {
    navigate(`/app/${teamId}/ocean/track`);
  };

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("dashboard.greeting", {
            name:
              session?.user.name?.trim() ||
              session?.user.email ||
              "",
          })}
        </h1>
        <p className="text-sm text-black/55">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <DashboardTabs onTrackClick={handleTrackClick} />

      <TeamPulseCard
        teamName={teamName}
        status={pulse.status}
        onTimeRatePercent={pulse.onTimeRate}
        activeShipments={pulse.active}
        totalShipments={pulse.total}
        nextEtaLabel={
          pulse.nextEta ?? t("pages.dashboard.pulse.noEta")
        }
        usageCount={usage?.today_count ?? 0}
        usageLimit={usage?.daily_limit ?? 1000}
        memberAvatars={memberAvatars}
        extraMemberCount={extraMemberCount}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OnTheWaterFeed />
        <LatestShipmentsCard />
      </div>

      <AtRiskTable />
    </div>
  );
}
