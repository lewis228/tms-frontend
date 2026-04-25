export const QUERY_KEYS = {
  team: {
    all: ["team"],
    byId: (teamId: number) => ["team", "byId", teamId],
  },
  teamMember: {
    all: ["team-member"],
    listByTeam: (teamId: number) => ["team-member", "list", teamId],
  },
  teamUsage: {
    all: ["team-usage"],
    byTeam: (teamId: number, days: number) => [
      "team-usage",
      "byTeam",
      teamId,
      days,
    ],
  },
  apiKey: {
    all: ["api-key"],
    listByTeam: (teamId: number) => ["api-key", "list", teamId],
    byId: (teamId: number, apiKeyId: number) => [
      "api-key",
      "byId",
      teamId,
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
    // Global team-wide containers list (Terminal49 Containers page).
    list: (params: Record<string, unknown> = {}) => [
      "ocean-container",
      "list",
      params,
    ],
  },
  tag: {
    all: ["tag"],
    // Tags are team-scoped, so the team acts as the outer partitioning key.
    // One cache slot per team — switching team gives a fresh fetch rather
    // than overwriting the previous team's list.
    listByTeam: (teamId: number) => ["tag", "list", teamId],
  },
  customer: {
    all: ["customer"],
    // Same partitioning rule as tags — team-scoped autocomplete source.
    listByTeam: (teamId: number) => ["customer", "list", teamId],
  },
  carrier: {
    // Global master catalogue — not team scoped. One cache slot per filter
    // combo (supported_only / scrapable_only / search).
    all: ["carrier"],
    list: (params: Record<string, unknown> = {}) => [
      "carrier",
      "list",
      params,
    ],
  },
  fleet: {
    // Team-scoped list of vessels carrying this team's active shipments.
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
