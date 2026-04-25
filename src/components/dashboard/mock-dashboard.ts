// Mock data powering the dashboard's narrative pieces — the live-activity
// feed and the At-Risk table. When the backend ships corresponding
// endpoints, swap these exports for query-hook results. The shapes below
// are the contract the dashboard components already render against.

export type WaterEventKind =
  | "departure"
  | "arrival"
  | "stop"
  | "registered"
  | "note";

export type WaterEvent =
  | {
      id: string;
      kind: Exclude<WaterEventKind, "registered" | "note">;
      mbl: string;
      location: string;
      timeAgo: string;
    }
  | {
      id: string;
      kind: "registered" | "note";
      mbl?: string;
      actorAvatar: string;
      actorName: string;
      text: string;
      timeAgo: string;
    };

export const WATER_EVENTS: WaterEvent[] = [
  {
    id: "e1",
    kind: "arrival",
    mbl: "HDMUSELM55873400",
    location: "Port of Los Angeles",
    timeAgo: "5 min ago",
  },
  {
    id: "e2",
    kind: "departure",
    mbl: "MAEU265099858",
    location: "Busan Port",
    timeAgo: "12 min ago",
  },
  {
    id: "e3",
    kind: "stop",
    mbl: "SMLMSEL6A6437700",
    location: "Chicago Rail Terminal",
    timeAgo: "1 hr ago",
  },
  {
    id: "e4",
    kind: "note",
    actorAvatar: "https://i.pravatar.cc/40?u=lewis",
    actorName: "lewis",
    text: "Marked MAEU266823558 as delayed (carrier note)",
    timeAgo: "2 hr ago",
  },
  {
    id: "e5",
    kind: "registered",
    actorAvatar: "https://i.pravatar.cc/40?u=dana",
    actorName: "Dana Park",
    text: "Added tracking for OOLU2320947080",
    timeAgo: "3 hr ago",
  },
  {
    id: "e6",
    kind: "arrival",
    mbl: "MAEU266492226",
    location: "Busan Port",
    timeAgo: "5 hr ago",
  },
];

// Standalone week strip (Mo–Su). The page labels today via its own
// date math so this is just the static 1-letter day labels.
export const WEEK_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

export type RiskLevel = "overdue" | "at-risk" | "attention";

export type AtRiskShipment = {
  id: string;
  mbl: string;
  carrierInitial: string;
  carrierBadge: string;
  requesterName: string;
  requesterAvatar: string;
  etaLabel: string;
  riskDays: number; // negative = overdue
  level: RiskLevel;
};

export const AT_RISK_SHIPMENTS: AtRiskShipment[] = [
  {
    id: "r1",
    mbl: "OOLU2320947080",
    carrierInitial: "O",
    carrierBadge: "#FFE0E0",
    requesterName: "Dana Park",
    requesterAvatar: "https://i.pravatar.cc/40?u=dana",
    etaLabel: "Oct 28, 2026",
    riskDays: -2,
    level: "overdue",
  },
  {
    id: "r2",
    mbl: "MAEU265099858",
    carrierInitial: "M",
    carrierBadge: "#E8F1FF",
    requesterName: "lewis",
    requesterAvatar: "https://i.pravatar.cc/40?u=lewis",
    etaLabel: "Nov 1, 2026",
    riskDays: 1,
    level: "at-risk",
  },
  {
    id: "r3",
    mbl: "HDMUSELM30605400",
    carrierInitial: "H",
    carrierBadge: "#E8FAF0",
    requesterName: "Jun Kim",
    requesterAvatar: "https://i.pravatar.cc/40?u=jun",
    etaLabel: "Nov 4, 2026",
    riskDays: 2,
    level: "at-risk",
  },
  {
    id: "r4",
    mbl: "SMLMSEL6A8407600",
    carrierInitial: "S",
    carrierBadge: "#FFF5D6",
    requesterName: "Sora Min",
    requesterAvatar: "https://i.pravatar.cc/40?u=sora",
    etaLabel: "Nov 7, 2026",
    riskDays: 5,
    level: "attention",
  },
  {
    id: "r5",
    mbl: "MAEU266823558",
    carrierInitial: "M",
    carrierBadge: "#E8F1FF",
    requesterName: "lewis",
    requesterAvatar: "https://i.pravatar.cc/40?u=lewis",
    etaLabel: "Nov 9, 2026",
    riskDays: 6,
    level: "attention",
  },
];
