// TanStack Query 의 모든 queryKey 는 이 팩토리로 생성한다.
// 새 도메인 추가 시 여기 섹션을 늘려 호출부가 직접 배열 리터럴을 쓰지 않게 한다.
export const QUERY_KEYS = {
  user: {
    all: ["user"] as const,
    me: ["user", "me"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["user", "list", params] as const,
    byId: (id: number) => ["user", "byId", id] as const,
  },
  team: {
    all: ["team"] as const,
    me: ["team", "me"] as const,
    list: ["team", "list"] as const,
    byId: (id: number) => ["team", "byId", id] as const,
  },
  customer: {
    all: ["customer"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["customer", "list", params] as const,
    byId: (id: number) => ["customer", "byId", id] as const,
  },
  driver: {
    all: ["driver"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["driver", "list", params] as const,
    byId: (id: number) => ["driver", "byId", id] as const,
  },
  terminal: {
    all: ["terminal"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["terminal", "list", params] as const,
    byId: (id: number) => ["terminal", "byId", id] as const,
  },
  vessel: {
    all: ["vessel"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["vessel", "list", params] as const,
    byId: (id: number) => ["vessel", "byId", id] as const,
  },
  location: {
    all: ["location"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["location", "list", params] as const,
    byId: (id: number) => ["location", "byId", id] as const,
  },
  deliveryOrder: {
    all: ["delivery-order"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["delivery-order", "list", params] as const,
    byId: (id: number) => ["delivery-order", "byId", id] as const,
    activity: (id: number) => ["delivery-order", "activity", id] as const,
  },
  container: {
    all: ["container"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["container", "list", params] as const,
    byDeliveryOrder: (deliveryOrderId: number) =>
      ["container", "byDeliveryOrder", deliveryOrderId] as const,
    byId: (id: number) => ["container", "byId", id] as const,
    events: (containerId: number) =>
      ["container", "events", containerId] as const,
  },
  addon: {
    all: ["addon"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["addon", "list", params] as const,
    byId: (id: number) => ["addon", "byId", id] as const,
    driverRates: (addonId: number) =>
      ["addon", "driver-rates", addonId] as const,
  },
  truck: {
    all: ["truck"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["truck", "list", params] as const,
    byId: (id: number) => ["truck", "byId", id] as const,
  },
  chassis: {
    all: ["chassis"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["chassis", "list", params] as const,
    byId: (id: number) => ["chassis", "byId", id] as const,
  },
  equipmentPool: {
    all: ["equipment-pool"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["equipment-pool", "list", params] as const,
    byId: (id: number) => ["equipment-pool", "byId", id] as const,
  },
  chassisEvent: {
    all: ["chassis-event"] as const,
    byChassis: (chassisId: number) =>
      ["chassis-event", "byChassis", chassisId] as const,
  },
  leg: {
    all: ["leg"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["leg", "list", params] as const,
    byDeliveryOrder: (deliveryOrderId: number) =>
      ["leg", "byDeliveryOrder", deliveryOrderId] as const,
    byDriver: (driverId: number) => ["leg", "byDriver", driverId] as const,
    byId: (id: number) => ["leg", "byId", id] as const,
  },
  legAddon: {
    all: ["leg-addon"] as const,
    byLeg: (legId: number) => ["leg-addon", "byLeg", legId] as const,
  },
  deliveryOrderAddon: {
    all: ["delivery-order-addon"] as const,
    byDeliveryOrder: (deliveryOrderId: number) =>
      ["delivery-order-addon", "byDeliveryOrder", deliveryOrderId] as const,
  },
  loadTypeTemplate: {
    all: ["load-type-template"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["load-type-template", "list", params] as const,
  },
  notification: {
    all: ["notification"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["notification", "list", params] as const,
    unreadCount: ["notification", "unreadCount"] as const,
  },
  apiKey: {
    all: ["api-key"] as const,
    list: ["api-key", "list"] as const,
    byId: (id: number) => ["api-key", "byId", id] as const,
  },
  streetTurn: {
    all: ["street-turn"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["street-turn", "list", params] as const,
    byId: (id: number) => ["street-turn", "byId", id] as const,
    candidates: (limit: number) =>
      ["street-turn", "candidates", limit] as const,
  },
  dualTransaction: {
    all: ["dual-transaction"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["dual-transaction", "list", params] as const,
    byId: (id: number) => ["dual-transaction", "byId", id] as const,
  },
  analytics: {
    all: ["analytics"] as const,
    marginTrend: (days: number) => ["analytics", "margin-trend", days] as const,
    driverUtilization: (days: number) =>
      ["analytics", "driver-utilization", days] as const,
    containerTurnover: (days: number) =>
      ["analytics", "container-turnover", days] as const,
    streetTurnSavings: (days: number) =>
      ["analytics", "street-turn-savings", days] as const,
    expiringCompliance: (days: number) =>
      ["analytics", "expiring-compliance", days] as const,
  },

  // ── Phase I — v3 Container-First ──────────────────────────────
  containerV3: {
    all: ["container-v3"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["container-v3", "list", params] as const,
    full: (id: number) => ["container-v3", "full", id] as const,
    stops: (containerId: number) =>
      ["container-v3", "stops", containerId] as const,
  },
  legSegment: {
    all: ["leg-segment"] as const,
    byLeg: (legId: number) => ["leg-segment", "byLeg", legId] as const,
  },
  locationPing: {
    all: ["location-ping"] as const,
    latest: (driverId: number) =>
      ["location-ping", "latest", driverId] as const,
  },

  // ── Rate management ──────────────────────────────────────────
  rateGroup: {
    all: ["rate-group"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["rate-group", "list", params] as const,
    byId: (id: number) => ["rate-group", "byId", id] as const,
    entries: (id: number) => ["rate-group", "entries", id] as const,
  },
  driverRateAssignment: {
    all: ["driver-rate-assignment"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["driver-rate-assignment", "list", params] as const,
    byId: (id: number) => ["driver-rate-assignment", "byId", id] as const,
  },
  rateZone: {
    all: ["rate-zone"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["rate-zone", "list", params] as const,
    byId: (id: number) => ["rate-zone", "byId", id] as const,
    members: (id: number) => ["rate-zone", "members", id] as const,
  },
  zipCode: {
    all: ["zip-code"] as const,
    byId: (id: number) => ["zip-code", "byId", id] as const,
    cities: (q: string, state?: string, scope?: boolean) =>
      ["zip-code", "cities", q, state ?? "", scope ?? false] as const,
    search: (q: string, scope?: boolean) =>
      ["zip-code", "search", "string", q, scope ?? false] as const,
    labels: (zipsKey: string) => ["zip-code", "labels", zipsKey] as const,
  },
  serviceArea: {
    all: ["service-area"] as const,
    list: ["service-area", "list"] as const,
  },
  rateLookup: {
    all: ["rate-lookup"] as const,
    addonEstimate: (driverId: number) =>
      ["rate-lookup", "addon-estimate", driverId] as const,
  },

  // ── Billing — Payroll(정산) / Invoice(청구) ──────────────────
  payroll: {
    all: ["payroll"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["payroll", "list", params] as const,
    byId: (id: number) => ["payroll", "byId", id] as const,
    periodSummary: (params: Record<string, unknown> = {}) =>
      ["payroll", "periodSummary", params] as const,
  },
  invoice: {
    all: ["invoice"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["invoice", "list", params] as const,
    byId: (id: number) => ["invoice", "byId", id] as const,
  },
};

export const PAGE_SIZE = 20;
