// Mock alert stream for the Alerts subpage. Each alert is one actionable
// event that touches a tracked shipment — demurrage clock, per-diem
// clock, carrier reporting gap, failed scrape, new arrival, etc. Will be
// replaced with a paginated `useAlertsData` query once the backend lands.

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertKind =
  | "demurrage"
  | "per-diem"
  | "delay"
  | "scrape-failed"
  | "arrival"
  | "carrier-change";

export type AlertItem = {
  id: string;
  severity: AlertSeverity;
  kind: AlertKind;
  /** MBL or identifier the alert is scoped to */
  subject: string;
  /** free-form summary */
  message: string;
  timeAgo: string;
  isRead: boolean;
};

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: "a1",
    severity: "critical",
    kind: "demurrage",
    subject: "OOLU2320947080",
    message:
      "Container stayed at LA terminal past the free-time window. Demurrage accruing at $250/day.",
    timeAgo: "12 min ago",
    isRead: false,
  },
  {
    id: "a2",
    severity: "critical",
    kind: "per-diem",
    subject: "MAEU265099858",
    message:
      "Per-diem window ends in 8 hours. Container still out with consignee.",
    timeAgo: "45 min ago",
    isRead: false,
  },
  {
    id: "a3",
    severity: "warning",
    kind: "delay",
    subject: "HDMUSELM30605400",
    message:
      "Vessel YM WELCOME ETA slipped by 2 days — new arrival: Apr 12.",
    timeAgo: "2 hr ago",
    isRead: false,
  },
  {
    id: "a4",
    severity: "warning",
    kind: "scrape-failed",
    subject: "OOLU2320947080",
    message:
      "OOCL tracker returned no data for 3 consecutive scrapes. Retrying every 6h.",
    timeAgo: "3 hr ago",
    isRead: false,
  },
  {
    id: "a5",
    severity: "info",
    kind: "arrival",
    subject: "MAEU266492226",
    message: "MAERSK SENTOSA arrived at Busan Port — unloading in progress.",
    timeAgo: "5 hr ago",
    isRead: true,
  },
  {
    id: "a6",
    severity: "info",
    kind: "carrier-change",
    subject: "SMLMSEL6A8407600",
    message:
      "Carrier SM Line updated vessel assignment: SM SHANGHAI → SM QINGDAO.",
    timeAgo: "1 day ago",
    isRead: true,
  },
  {
    id: "a7",
    severity: "warning",
    kind: "delay",
    subject: "SMLMSEL6A6437700",
    message: "KOTA LUKIS route re-plotted via Panama; ETA delayed by 1 day.",
    timeAgo: "1 day ago",
    isRead: true,
  },
  {
    id: "a8",
    severity: "info",
    kind: "arrival",
    subject: "HDMUSELM55873400",
    message: "YM TRILLION berthed at Savannah Port.",
    timeAgo: "2 days ago",
    isRead: true,
  },
];
