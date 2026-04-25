import { useTranslation } from "react-i18next";

type PulseStatus = "on-track" | "delayed" | "attention";

// Hero card mirroring the reference "project summary" look, adapted for
// shipping KPIs. White-on-border surface (consistent with the cards
// below), big title + accent icon, 4 label-above-value stats, and a
// team-member avatar column inline with the stats. The Status stat
// doubles as a progress gauge — the pill fills proportional to the
// on-time rate, matching the reference "In Progress 51%" pattern.
const GAUGE_FILL = "#ADADFB";
const GAUGE_TRACK = "#F1F1FB";

export default function TeamPulseCard({
  teamName,
  status,
  onTimeRatePercent,
  activeShipments,
  totalShipments,
  nextEtaLabel,
  usageCount,
  usageLimit,
  memberAvatars,
  extraMemberCount,
}: {
  teamName: string;
  status: PulseStatus;
  onTimeRatePercent: number;
  activeShipments: number;
  totalShipments: number;
  nextEtaLabel: string;
  usageCount: number;
  usageLimit: number;
  memberAvatars: string[];
  extraMemberCount: number;
}) {
  const { t } = useTranslation();

  const statusLabel = t(`pages.dashboard.pulse.status.${status}`);
  const clamped = Math.max(0, Math.min(100, onTimeRatePercent));

  return (
    <div className="relative rounded-2xl border border-black/10 bg-white px-6 pt-5 pb-5">
      {/* Header row: big title + company logo badge */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="truncate text-2xl font-semibold leading-tight text-black">
          {teamName}
        </h2>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white">
          <img
            src="/icons/omniq-logo.png"
            alt="OMNIQ AI"
            className="h-7 w-7 object-contain"
          />
        </span>
      </div>

      {/* Stats row — 5 equal columns: 4 stats + members */}
      <div className="mt-6 grid grid-cols-2 gap-x-10 gap-y-5 md:grid-cols-3 lg:grid-cols-5">
        <Stat label={t("pages.dashboard.pulse.onTimeRate")}>
          <div className="flex items-center gap-2">
            {/* Gauge pill — label sits on top of the proportional fill */}
            <span
              className="relative inline-flex overflow-hidden rounded-full"
              style={{ backgroundColor: GAUGE_TRACK }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${clamped}%`,
                  backgroundColor: GAUGE_FILL,
                }}
              />
              <span className="relative px-3 py-1 text-xs font-medium text-black">
                {statusLabel}
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums text-black">
              {clamped}%
            </span>
          </div>
        </Stat>

        <Stat label={t("pages.dashboard.pulse.activeShipments")}>
          <span className="text-2xl font-semibold leading-none tabular-nums text-black">
            {activeShipments}
            <span className="text-base font-normal text-black/45">
              {" "}
              / {totalShipments}
            </span>
          </span>
        </Stat>

        <Stat label={t("pages.dashboard.pulse.nextEta")}>
          <span className="text-2xl font-semibold leading-none text-black">
            {nextEtaLabel}
          </span>
        </Stat>

        <Stat label={t("pages.dashboard.pulse.apiUsage")}>
          <span className="text-2xl font-semibold leading-none tabular-nums text-black">
            {usageCount.toLocaleString()}
            <span className="text-base font-normal text-black/45">
              {" "}
              / {usageLimit.toLocaleString()}
            </span>
          </span>
        </Stat>

        <Stat label={t("pages.dashboard.pulse.members")}>
          <div className="flex items-center">
            {memberAvatars.slice(0, 3).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="h-7 w-7 rounded-full border-2 border-white object-cover"
                style={{ marginLeft: i === 0 ? 0 : -8 }}
              />
            ))}
            {extraMemberCount > 0 && (
              <span className="-ml-2 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-black/70 px-1.5 text-[11px] font-medium text-white">
                +{extraMemberCount}
              </span>
            )}
          </div>
        </Stat>
      </div>
    </div>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-black/55">{label}</span>
      <div>{children}</div>
    </div>
  );
}
