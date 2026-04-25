// Mock data powering the Reports page Phase 1. All shapes below are the
// contract downstream components render against — when the backend ships
// matching endpoints (`useReportsOverviewData`, etc.), swap these exports
// for query-hook results with identical types. Nothing here touches a
// network; rendering is fully offline.

// ---------- Time range ----------

export type ReportTimeRange = "today" | "7d" | "30d" | "qtd" | "ytd";

export const TIME_RANGES: ReadonlyArray<{
  id: ReportTimeRange;
  labelKey: string;
}> = [
  { id: "today", labelKey: "pages.reports.range.today" },
  { id: "7d", labelKey: "pages.reports.range.7d" },
  { id: "30d", labelKey: "pages.reports.range.30d" },
  { id: "qtd", labelKey: "pages.reports.range.qtd" },
  { id: "ytd", labelKey: "pages.reports.range.ytd" },
];

// ---------- KPI strip (Top 4 cards) ----------

export type ReportKpiTrend = "up" | "down";

export type ReportKpiId =
  | "activeShipments"
  | "onTimeRate"
  | "delayedShipments"
  | "demurrageRisk";

export type ReportKpi = {
  id: ReportKpiId;
  labelKey: string;
  value: number;
  /** already formatted for display (e.g. "94.2%"). falsy → format with toLocaleString */
  displayValue?: string;
  deltaPercent: number;
  trend: ReportKpiTrend;
  /** soft pastel surface tint — matches the reference UI */
  tint: string;
  /** mini-sparkline points (8 values, 0-100 normalised is fine) */
  spark: number[];
};

// Phase 1 values are plausibly tied to the Projects/Shipments mock already
// in the app (30 projects, ~400 containers in play, 10-12 demurrage-risk).
// Deltas compare the selected range to the previous equivalent range.
export const REPORT_KPIS: ReportKpi[] = [
  {
    id: "activeShipments",
    labelKey: "pages.reports.kpi.activeShipments",
    value: 187,
    deltaPercent: 11.01,
    trend: "up",
    tint: "bg-[#E8EEFF]",
    spark: [42, 48, 45, 58, 62, 60, 68, 74],
  },
  {
    id: "onTimeRate",
    labelKey: "pages.reports.kpi.onTimeRate",
    value: 94.2,
    displayValue: "94.2%",
    deltaPercent: -0.03,
    trend: "down",
    tint: "bg-[#EEE8FF]",
    spark: [88, 92, 90, 94, 93, 95, 94, 94],
  },
  {
    id: "delayedShipments",
    labelKey: "pages.reports.kpi.delayedShipments",
    value: 12,
    deltaPercent: 15.03,
    trend: "up",
    tint: "bg-[#E8EEFF]",
    spark: [6, 7, 8, 9, 9, 10, 11, 12],
  },
  {
    id: "demurrageRisk",
    labelKey: "pages.reports.kpi.demurrageRisk",
    value: 8,
    deltaPercent: 6.08,
    trend: "up",
    tint: "bg-[#EEE8FF]",
    spark: [3, 4, 5, 5, 6, 7, 7, 8],
  },
];

// ---------- Main line chart (YoY) ----------

export type ReportSeriesKey =
  | "shipmentsVolume"
  | "onTimePerformance"
  | "avgTransitTime"
  | "costFees";

export const REPORT_SERIES_OPTIONS: ReadonlyArray<{
  id: ReportSeriesKey;
  labelKey: string;
  /** unit suffix displayed in tooltip / y-axis */
  unitKey: string;
}> = [
  {
    id: "shipmentsVolume",
    labelKey: "pages.reports.series.shipmentsVolume",
    unitKey: "pages.reports.unit.shipments",
  },
  {
    id: "onTimePerformance",
    labelKey: "pages.reports.series.onTimePerformance",
    unitKey: "pages.reports.unit.percent",
  },
  {
    id: "avgTransitTime",
    labelKey: "pages.reports.series.avgTransitTime",
    unitKey: "pages.reports.unit.days",
  },
  {
    id: "costFees",
    labelKey: "pages.reports.series.costFees",
    unitKey: "pages.reports.unit.usd",
  },
];

// 12-month shape; the chart slices Jan..Jul to match the reference density.
// "this" = current YTD, "last" = prior-year same month.
export type MonthlyPoint = {
  month: string; // "Jan" ... "Dec"
  this: number;
  last: number;
};

export const REPORT_SERIES: Record<ReportSeriesKey, MonthlyPoint[]> = {
  shipmentsVolume: [
    { month: "Jan", this: 12000, last: 10500 },
    { month: "Feb", this: 13400, last: 18800 },
    { month: "Mar", this: 14200, last: 14600 },
    { month: "Apr", this: 11800, last: 12400 },
    { month: "May", this: 15600, last: 12800 },
    { month: "Jun", this: 23200, last: 15000 },
    { month: "Jul", this: 19800, last: 28400 },
  ],
  onTimePerformance: [
    { month: "Jan", this: 91, last: 87 },
    { month: "Feb", this: 93, last: 90 },
    { month: "Mar", this: 92, last: 91 },
    { month: "Apr", this: 95, last: 88 },
    { month: "May", this: 94, last: 92 },
    { month: "Jun", this: 93, last: 94 },
    { month: "Jul", this: 96, last: 89 },
  ],
  avgTransitTime: [
    { month: "Jan", this: 24.1, last: 26.8 },
    { month: "Feb", this: 23.4, last: 25.2 },
    { month: "Mar", this: 22.8, last: 24.9 },
    { month: "Apr", this: 23.6, last: 26.1 },
    { month: "May", this: 21.9, last: 25.4 },
    { month: "Jun", this: 22.2, last: 24.3 },
    { month: "Jul", this: 21.5, last: 23.8 },
  ],
  costFees: [
    { month: "Jan", this: 18400, last: 22100 },
    { month: "Feb", this: 16200, last: 19800 },
    { month: "Mar", this: 21000, last: 17600 },
    { month: "Apr", this: 19400, last: 23400 },
    { month: "May", this: 15800, last: 20900 },
    { month: "Jun", this: 24100, last: 19200 },
    { month: "Jul", this: 20600, last: 25800 },
  ],
};

// ---------- Top Carriers (Traffic by Website equivalent) ----------

export type CarrierShare = {
  id: string;
  name: string;
  /** shipments for the selected range */
  count: number;
  /** 0..100 — used for the bar width */
  percent: number;
};

// Share sums to ~100%. Order matters (longest bar first).
export const TOP_CARRIERS: CarrierShare[] = [
  { id: "maersk", name: "Maersk", count: 48, percent: 32 },
  { id: "msc", name: "MSC", count: 31, percent: 21 },
  { id: "cma-cgm", name: "CMA CGM", count: 22, percent: 15 },
  { id: "one", name: "ONE", count: 18, percent: 12 },
  { id: "hapag-lloyd", name: "Hapag-Lloyd", count: 12, percent: 8 },
  { id: "evergreen", name: "Evergreen", count: 9, percent: 6 },
];

// ---------- Carrier Performance (Traffic by Device equivalent) ----------

export type CarrierPerformance = {
  id: string;
  name: string;
  /** on-time percentage, 0..100 */
  onTimePercent: number;
  /** bar tint — greener = healthier. Visual-only. */
  tint: string;
};

export const CARRIER_PERFORMANCE: CarrierPerformance[] = [
  { id: "maersk", name: "Maersk", onTimePercent: 96, tint: "#99B8FF" },
  { id: "msc", name: "MSC", onTimePercent: 93, tint: "#34D399" },
  { id: "cma-cgm", name: "CMA CGM", onTimePercent: 88, tint: "#1A1A1A" },
  { id: "one", name: "ONE", onTimePercent: 91, tint: "#5B8DEF" },
  { id: "hapag-lloyd", name: "Hapag-Lloyd", onTimePercent: 85, tint: "#C4B5FD" },
  { id: "evergreen", name: "Evergreen", onTimePercent: 82, tint: "#86EFAC" },
];

// ---------- Destination Regions (Traffic by Location equivalent) ----------

export type DestinationShare = {
  id: string;
  labelKey: string;
  percent: number; // sums to 100
  color: string;
};

export const DESTINATION_SHARES: DestinationShare[] = [
  {
    id: "us-west",
    labelKey: "pages.reports.destination.usWest",
    percent: 45.2,
    color: "#1A1A1A",
  },
  {
    id: "us-east",
    labelKey: "pages.reports.destination.usEast",
    percent: 22.8,
    color: "#5B8DEF",
  },
  {
    id: "eu",
    labelKey: "pages.reports.destination.eu",
    percent: 18.4,
    color: "#34D399",
  },
  {
    id: "sea",
    labelKey: "pages.reports.destination.sea",
    percent: 9.3,
    color: "#99B8FF",
  },
  {
    id: "other",
    labelKey: "pages.reports.destination.other",
    percent: 4.3,
    color: "#D1D5DB",
  },
];

// ---------- Exception Timeline (Phase 3) ----------

export type ExceptionKind = "delayed" | "etaChanged" | "alert" | "rollover";

export type ExceptionEvent = {
  id: string;
  /** 0..29 — days ago. 0 = today, 29 = 30 days ago. */
  daysAgo: number;
  kind: ExceptionKind;
  mbl: string;
  labelKey: string;
};

export const EXCEPTION_KIND_COLORS: Record<ExceptionKind, string> = {
  delayed: "#EF4444",
  etaChanged: "#F59E0B",
  alert: "#8B5CF6",
  rollover: "#0EA5E9",
};

// Scatter of events across 30 days — kept short so the strip stays
// legible. When real data lands this will be fed by alert/event records.
export const EXCEPTION_EVENTS: ExceptionEvent[] = [
  { id: "x1", daysAgo: 28, kind: "delayed", mbl: "MAEU265099858", labelKey: "pages.reports.exceptions.kind.delayed" },
  { id: "x2", daysAgo: 26, kind: "etaChanged", mbl: "HDMUSELM55873400", labelKey: "pages.reports.exceptions.kind.etaChanged" },
  { id: "x3", daysAgo: 23, kind: "alert", mbl: "OOLU2320947080", labelKey: "pages.reports.exceptions.kind.alert" },
  { id: "x4", daysAgo: 21, kind: "rollover", mbl: "SMLMSEL6A6437700", labelKey: "pages.reports.exceptions.kind.rollover" },
  { id: "x5", daysAgo: 20, kind: "delayed", mbl: "MAEU266492226", labelKey: "pages.reports.exceptions.kind.delayed" },
  { id: "x6", daysAgo: 18, kind: "etaChanged", mbl: "CMAU4031567", labelKey: "pages.reports.exceptions.kind.etaChanged" },
  { id: "x7", daysAgo: 16, kind: "alert", mbl: "MSCU7748291", labelKey: "pages.reports.exceptions.kind.alert" },
  { id: "x8", daysAgo: 14, kind: "delayed", mbl: "HLCU3394822", labelKey: "pages.reports.exceptions.kind.delayed" },
  { id: "x9", daysAgo: 13, kind: "etaChanged", mbl: "ONEY0213488", labelKey: "pages.reports.exceptions.kind.etaChanged" },
  { id: "x10", daysAgo: 11, kind: "rollover", mbl: "EGLV1425577", labelKey: "pages.reports.exceptions.kind.rollover" },
  { id: "x11", daysAgo: 9, kind: "alert", mbl: "MAEU266823558", labelKey: "pages.reports.exceptions.kind.alert" },
  { id: "x12", daysAgo: 7, kind: "etaChanged", mbl: "SMLMSEL6A8407600", labelKey: "pages.reports.exceptions.kind.etaChanged" },
  { id: "x13", daysAgo: 6, kind: "delayed", mbl: "HDMUSELM30605400", labelKey: "pages.reports.exceptions.kind.delayed" },
  { id: "x14", daysAgo: 4, kind: "etaChanged", mbl: "MSCU9012334", labelKey: "pages.reports.exceptions.kind.etaChanged" },
  { id: "x15", daysAgo: 3, kind: "alert", mbl: "OOLU5587211", labelKey: "pages.reports.exceptions.kind.alert" },
  { id: "x16", daysAgo: 2, kind: "delayed", mbl: "MAEU266493009", labelKey: "pages.reports.exceptions.kind.delayed" },
  { id: "x17", daysAgo: 1, kind: "rollover", mbl: "CMAU7740125", labelKey: "pages.reports.exceptions.kind.rollover" },
  { id: "x18", daysAgo: 0, kind: "etaChanged", mbl: "HDMUSELM41320088", labelKey: "pages.reports.exceptions.kind.etaChanged" },
];

// ---------- Dwell Time by Port (Phase 3) ----------

export type PortDwell = {
  id: string;
  name: string;
  /** average dwell in days */
  days: number;
  /** threshold for concern — bars above turn amber */
  threshold: number;
};

export const PORT_DWELL: PortDwell[] = [
  { id: "ny", name: "New York", days: 6.1, threshold: 5 },
  { id: "oakland", name: "Oakland", days: 4.5, threshold: 5 },
  { id: "long-beach", name: "Long Beach", days: 4.2, threshold: 5 },
  { id: "savannah", name: "Savannah", days: 3.8, threshold: 5 },
  { id: "seattle", name: "Seattle", days: 3.1, threshold: 5 },
  { id: "busan", name: "Busan", days: 2.3, threshold: 5 },
];

// ---------- Cost Breakdown (Phase 3) ----------

export type CostStackPoint = {
  month: string;
  demurrage: number;
  perDiem: number;
  other: number;
};

// Stack series for the recent 7 months. Matches the volume chart
// timeline so cost swings can be visually correlated with volume.
export const COST_STACK: CostStackPoint[] = [
  { month: "Jan", demurrage: 8200, perDiem: 6400, other: 3800 },
  { month: "Feb", demurrage: 6100, perDiem: 5800, other: 4300 },
  { month: "Mar", demurrage: 9800, perDiem: 7200, other: 4000 },
  { month: "Apr", demurrage: 8600, perDiem: 6900, other: 3900 },
  { month: "May", demurrage: 5200, perDiem: 6200, other: 4400 },
  { month: "Jun", demurrage: 11200, perDiem: 8600, other: 4300 },
  { month: "Jul", demurrage: 9100, perDiem: 7600, other: 3900 },
];

export const COST_COLORS = {
  demurrage: "#1A1A1A",
  perDiem: "#5B8DEF",
  other: "#C4B5FD",
} as const;

// ---------- Top Delayed Routes (Phase 3) ----------

export type DelayedRoute = {
  id: string;
  origin: string;
  destination: string;
  /** 0..100 — percent of shipments delayed on this lane */
  delayRate: number;
  /** raw shipment count for the selected range */
  shipments: number;
  /** average delay in days among the delayed subset */
  avgDelayDays: number;
};

export const DELAYED_ROUTES: DelayedRoute[] = [
  {
    id: "r1",
    origin: "Shanghai",
    destination: "Los Angeles",
    delayRate: 18.4,
    shipments: 54,
    avgDelayDays: 3.2,
  },
  {
    id: "r2",
    origin: "Ningbo",
    destination: "Oakland",
    delayRate: 14.1,
    shipments: 38,
    avgDelayDays: 2.6,
  },
  {
    id: "r3",
    origin: "Yantian",
    destination: "Long Beach",
    delayRate: 11.9,
    shipments: 42,
    avgDelayDays: 2.1,
  },
  {
    id: "r4",
    origin: "Busan",
    destination: "New York",
    delayRate: 9.5,
    shipments: 31,
    avgDelayDays: 1.8,
  },
  {
    id: "r5",
    origin: "Qingdao",
    destination: "Savannah",
    delayRate: 7.8,
    shipments: 27,
    avgDelayDays: 1.4,
  },
];
