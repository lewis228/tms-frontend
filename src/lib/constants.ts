// TanStack Query 의 모든 queryKey 는 이 팩토리로 생성한다.
// 새 도메인 추가 시 여기 섹션을 늘려 호출부가 직접 배열 리터럴을 쓰지 않게 한다.
export const QUERY_KEYS = {
  user: {
    all: ["user"] as const,
    me: ["user", "me"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["user", "list", params] as const,
    byId: (id: string) => ["user", "byId", id] as const,
  },
  tenant: {
    all: ["tenant"] as const,
    me: ["tenant", "me"] as const,
    list: ["tenant", "list"] as const,
    byId: (id: string) => ["tenant", "byId", id] as const,
  },
  customer: {
    all: ["customer"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["customer", "list", params] as const,
    byId: (id: string) => ["customer", "byId", id] as const,
  },
  driver: {
    all: ["driver"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["driver", "list", params] as const,
    byId: (id: string) => ["driver", "byId", id] as const,
  },
  terminal: {
    all: ["terminal"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["terminal", "list", params] as const,
    byId: (id: string) => ["terminal", "byId", id] as const,
  },
  vessel: {
    all: ["vessel"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["vessel", "list", params] as const,
    byId: (id: string) => ["vessel", "byId", id] as const,
  },
  location: {
    all: ["location"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["location", "list", params] as const,
    byId: (id: string) => ["location", "byId", id] as const,
  },
  deliveryOrder: {
    all: ["delivery-order"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["delivery-order", "list", params] as const,
    byId: (id: string) => ["delivery-order", "byId", id] as const,
  },
  settlement: {
    all: ["settlement"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["settlement", "list", params] as const,
    byId: (id: string) => ["settlement", "byId", id] as const,
  },
  leg: {
    all: ["leg"] as const,
    list: (params: Record<string, unknown> = {}) =>
      ["leg", "list", params] as const,
    byDeliveryOrder: (deliveryOrderId: string) =>
      ["leg", "byDeliveryOrder", deliveryOrderId] as const,
    byDriver: (driverId: string) => ["leg", "byDriver", driverId] as const,
    byId: (id: string) => ["leg", "byId", id] as const,
  },
};

export const PAGE_SIZE = 20;
