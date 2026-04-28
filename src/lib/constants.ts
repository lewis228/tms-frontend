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
  settlement: {
    all: ["settlement"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["settlement", "list", params] as const,
    byId: (id: number) => ["settlement", "byId", id] as const,
    extras: (id: number) => ["settlement", "extras", id] as const,
    auditLogs: (id: number) => ["settlement", "auditLogs", id] as const,
  },
  rateSetting: {
    all: ["rate-setting"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["rate-setting", "list", params] as const,
    byId: (id: number) => ["rate-setting", "byId", id] as const,
  },
  chargeCode: {
    all: ["charge-code"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["charge-code", "list", params] as const,
    byId: (id: number) => ["charge-code", "byId", id] as const,
  },
  rateCard: {
    all: ["rate-card"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["rate-card", "list", params] as const,
    byId: (id: number) => ["rate-card", "byId", id] as const,
  },
  legCharge: {
    all: ["leg-charge"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["leg-charge", "list", params] as const,
    byLeg: (legId: number) => ["leg-charge", "byLeg", legId] as const,
    byId: (id: number) => ["leg-charge", "byId", id] as const,
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
  legStop: {
    all: ["leg-stop"] as const,
    byLeg: (legId: number) => ["leg-stop", "byLeg", legId] as const,
  },
  chassisEvent: {
    all: ["chassis-event"] as const,
    byChassis: (chassisId: number) => ["chassis-event", "byChassis", chassisId] as const,
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
  analytics: {
    all: ["analytics"] as const,
    marginTrend: (days: number) => ["analytics", "margin-trend", days] as const,
    driverUtilization: (days: number) =>
      ["analytics", "driver-utilization", days] as const,
    containerTurnover: (days: number) =>
      ["analytics", "container-turnover", days] as const,
    streetTurnSavings: (days: number) =>
      ["analytics", "street-turn-savings", days] as const,
  },
};

export const PAGE_SIZE = 20;
