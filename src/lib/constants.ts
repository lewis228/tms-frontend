export const QUERY_KEYS = {
  tenant: {
    all: ["tenant"],
    byId: (tenantId: number) => ["tenant", "byId", tenantId],
  },
  tenantMember: {
    all: ["tenant-member"],
    listByTenant: (tenantId: number) => ["tenant-member", "list", tenantId],
  },
  tenantUsage: {
    all: ["tenant-usage"],
    byTenant: (tenantId: number, days: number) => [
      "tenant-usage",
      "byTenant",
      tenantId,
      days,
    ],
  },
  apiKey: {
    all: ["api-key"],
    listByTenant: (tenantId: number) => ["api-key", "list", tenantId],
    byId: (tenantId: number, apiKeyId: number) => [
      "api-key",
      "byId",
      tenantId,
      apiKeyId,
    ],
  },
  oceanShipment: {
    all: ["ocean-shipment"],
    // Filter params go into the cache key so every unique (status, carrier,
    // search) combo has its own slot. Pass an object (even empty) for
    // consistency — `{}` maps to the "no filters" view.
    list: (params: Record<string, unknown> = {}) => [
      "ocean-shipment",
      "list",
      params,
    ],
    byId: (shipmentId: number) => ["ocean-shipment", "byId", shipmentId],
  },
  oceanContainer: {
    all: ["ocean-container"],
    // Global tenant-wide containers list (Terminal49 Containers page).
    list: (params: Record<string, unknown> = {}) => [
      "ocean-container",
      "list",
      params,
    ],
  },
  tag: {
    all: ["tag"],
    // Tags are tenant-scoped, so the tenant acts as the outer partitioning key.
    // One cache slot per tenant — switching tenant gives a fresh fetch rather
    // than overwriting the previous tenant's list.
    listByTenant: (tenantId: number) => ["tag", "list", tenantId],
  },
  customer: {
    all: ["customer"],
    // Same partitioning rule as tags — tenant-scoped autocomplete source.
    listByTenant: (tenantId: number) => ["customer", "list", tenantId],
  },
  carrier: {
    // Global master catalogue — not tenant scoped. One cache slot per filter
    // combo (supported_only / scrapable_only / search).
    all: ["carrier"],
    list: (params: Record<string, unknown> = {}) => [
      "carrier",
      "list",
      params,
    ],
  },
  fleet: {
    // Tenant-scoped list of vessels carrying this tenant's active shipments.
    // Populated by REST on first load, then kept fresh via WebSocket events
    // ("vessel.position_updated") that patch each vessel's `position` slot.
    all: ["fleet"],
    list: ["fleet", "list"],
  },
  profile: {
    all: ["profile"],
    list: ["profile", "list"],
    byId: (userId: string) => ["profile", "byId", userId],
    me: ["profile", "me"],
  },
  dashboard: {
    all: ["dashboard"],
    stats: ["dashboard", "stats"],
    projects: ["dashboard", "projects"],
    ecommerce: ["dashboard", "ecommerce"],
    sales: ["dashboard", "sales"],
    activity: ["dashboard", "activity"],
    traffic: ["dashboard", "traffic"],
    quarterly: ["dashboard", "quarterly"],
  },
  tables: {
    all: ["tables"],
    authors: ["tables", "authors"],
    projects: ["tables", "projects"],
  },
  notifications: {
    all: ["notifications"],
    list: ["notifications", "list"],
    settings: ["notifications", "settings"],
  },
  subscriptions: {
    all: ["subscriptions"],
    plan: ["subscriptions", "plan"],
    usage: ["subscriptions", "usage"],
    payments: ["subscriptions", "payments"],
  },
  orders: {
    all: ["orders"],
    list: ({ page, pageSize }: { page: number; pageSize: number }) => [
      "orders",
      page,
      pageSize,
    ],
  },
  users: {
    all: ["users"],
    list: ({ page, pageSize }: { page: number; pageSize: number }) => [
      "users",
      page,
      pageSize,
    ],
  },
};
