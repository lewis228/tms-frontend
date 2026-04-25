export type ProfileEntity = {
  id: string | number;
  email: string;
  name: string;
  nickname: string;
  bio: string;
  avatar_url: string | null;
  role: string;
  auth_provider: string;
};

export type UserTenantRow = {
  id: number;
  tenant_id: number;
  tenant_name: string | null;
  permission_group_id: number | null;
};

// File asset surfaced on the user profile (avatar etc.). Mirrors the backend
// FileNestedSchema without fields the UI doesn't use yet.
export type FileAssetEntity = {
  id: number;
  url: string | null;
  filename: string | null;
  mime: string | null;
  created_at: string | null;
};

export type AppUser = {
  id: string | number;
  email: string;
  name: string | null;
  role: string;
  auth_provider: string;
  phone: string | null;
  notification_email: string | null;
  event_notification_enabled: boolean;
  language: string | null;
  tenants: UserTenantRow[];
  files: FileAssetEntity[];
};

export type AppSession = {
  user: AppUser;
};

export type TenantEntity = {
  id: number;
  name: string;
  email: string | null;
  plan: string;
  memo: string | null;
  timezone: string | null;
};

// A single tenant membership row enriched with the member's user info. `id`
// is the UserTenant row id; `user_id` targets the user themselves (needed for
// DELETE). The two are kept distinct because a re-invited user gets a new
// UserTenant row.
export type TenantMemberEntity = {
  id: number;
  user_id: number;
  email: string;
  name: string | null;
  role: string;
  auth_provider: string;
  permission_group_id: number | null;
  created_at: string | null;
};

export type TenantUsageDailyPoint = {
  date: string; // ISO YYYY-MM-DD (UTC)
  count: number;
};

export type TenantUsage = {
  daily: TenantUsageDailyPoint[];
  total_count: number;
  today_count: number;
  plan: string;
  daily_limit: number;
};

export type ApiKeyEntity = {
  id: number;
  tenant_id: number;
  name: string;
  description: string | null;
  prefix: string;
  expires_at: string | null;
  last_used_at: string | null;
  // Soft-delete flag. Backend now drives revocation via is_active=false, with
  // updated_at recording the revoke time. List endpoint only returns active
  // rows, so the UI mostly sees is_active=true — the field is kept on the
  // type for local cache writes during revoke.
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  created_by_user_id: number | null;
};

// Returned only from POST /api-keys — includes the full secret which the
// backend never echoes again. Consumed once to populate the post-create
// reveal modal, then discarded.
export type ApiKeyCreated = ApiKeyEntity & {
  key: string;
};

// ── Ocean tracking domain ───────────────────────────────────────────

// System-level tracking status for an MBL / shipment. Values mirror the
// backend `ShipmentStatus` enum. Container-movement states ("Vessel Arrived",
// "Empty In" 등) live on individual tracking events, not here.
export type OceanShipmentStatus =
  | "pending"             // just registered, awaiting first scrape result
  | "tracking"            // actively tracked (= Terminal49 "Created")
  | "awaiting_manifest"   // carrier has no data yet, keep retrying
  | "failed"              // permanent failure — user can Resubmit
  | "stopped"             // all containers reached Empty In / manually stopped
  | "cancelled";

// Global location master entry (UN/LOCODE backed). Shared across ocean/
// air/rail domains. Mirrors backend `LocationResponseSchema`. Embedded as
// nested objects in shipment / container / event payloads when the FK is
// resolved.
export type LocationEntity = {
  id: number;
  unlocode: string | null;
  name: string;
  country_code: string;
  subdivision: string | null;
  kind:
    | "seaport"
    | "airport"
    | "rail_terminal"
    | "road_terminal"
    | "cargo_terminal"
    | "inland"
    | "city"
    | "border"
    | "postal"
    | "unknown";
  parent_location_id: number | null;
  latitude: number | null;
  longitude: number | null;
  iata: string | null;
  is_supported: boolean;
};

// Ocean carrier (shipping line) — global master catalogue entry.
// Mirrors backend `CarrierResponseSchema`. Shipments reference these by
// `carrier_id` and the API embeds the nested object as `carrier` on
// shipment payloads for display convenience.
export type CarrierEntity = {
  id: number;
  scac: string;
  name: string;
  mbl_prefixes: string[] | null;
  scraper_key: string | null;
  tracking_url: string | null;
  logo_url: string | null;
  display_order: number;
  is_supported: boolean;
};

export type OceanShipmentEntity = {
  id: number;
  tenant_id: number;
  mbl: string;
  // Carrier is now required at the API boundary (Quick Entry forces selection).
  // Kept nullable in the nested object only to match LocationEntity semantics
  // where the FK must exist but the SELECT JOIN could conceivably miss; in
  // practice `carrier` is always present on a well-formed response.
  carrier_id: number;
  carrier: CarrierEntity | null;
  status: OceanShipmentStatus;
  vessel_name: string | null;
  // Normalized vessel FK — resolved async by the resolve_vessel Celery task.
  // Null until the task runs. UI currently renders vessel_name (raw string);
  // the FK will power AIS live-position joins in a later phase.
  vessel_id: number | null;
  voyage_number: string | null;
  pol_location_id: number | null;
  pod_location_id: number | null;
  // Nested port objects (resolved from pol/pod_location_id). Null when
  // mapping hasn't been performed yet or failed — the raw carrier text
  // lives in scrape_logs, not on this entity.
  pol_location: LocationEntity | null;
  pod_location: LocationEntity | null;
  etd: string | null;
  eta: string | null;
  confidence: string | null;
  tracking_frequency: string | null;
  next_scrape_at: string | null;
  // Phase B user metadata. `customer` is a single-assignment FK to the
  // tenant-scoped `customers` master — nested for display. `ref_numbers` is
  // always an array (empty when unset); the backend flattens the join table
  // back to strings on the wire for render simplicity. `tags` is also always
  // an array (empty when unset).
  customer_id: number | null;
  customer: CustomerEntity | null;
  ref_numbers: string[];
  tags: TagEntity[];
  created_at: string | null;
  updated_at: string | null;
};

// Container physical status — the axis the Shipments list tabs filter on.
// Distinct from `OceanShipmentStatus` (tracking-level). Values mirror the
// backend ContainerPhysicalStatus enum exactly.
export type ContainerPhysicalStatus =
  | "registered"
  | "gate_in"
  | "loaded"
  | "on_ship"
  | "discharged"
  | "gate_out"
  | "empty_returned"
  | "unknown";

export type OceanContainerEntity = {
  id: number;
  shipment_id: number;
  number: string;
  // Raw carrier string ("40' DH", "40HC", etc). Preserved verbatim for
  // debugging / backfill. UI prefers `size_type_code` for display.
  size_type: string | null;
  // Normalized ContainerSizeType value ("40HC", "20DS", etc). Null when
  // the normalizer couldn't match the raw pattern (logged, then rule added).
  size_type_code: string | null;
  // Raw status string — latest event description verbatim.
  status: string | null;
  // Normalized ContainerPhysicalStatus — used by list filtering + tab icons.
  physical_status: ContainerPhysicalStatus | null;
  terminal_location_id: number | null;
  terminal_location: LocationEntity | null;
  lfd: string | null;
};

// Container event timeline type — values mirror backend ContainerEventType.
export type ContainerEventType =
  | "gate_in"
  | "loaded"
  | "vessel_departed"
  | "vessel_arrived"
  | "discharged"
  | "gate_out"
  | "empty_returned"
  | "rail_departed"
  | "rail_arrived"
  | "transshipment"
  | "unknown";

export type OceanContainerEventEntity = {
  id: number;
  shipment_id: number;
  // Every event belongs to a specific container. Vessel-level events get
  // fanned out by the scraper to each container on the shipment.
  container_id: number;
  timestamp: string | null;
  location_id: number | null;
  // Resolved nested location (nullable when the mapping from the carrier's
  // raw text couldn't be made — UI falls back to a dash).
  location: LocationEntity | null;
  description: string | null;
  // Raw event type hint from carrier (optional, often null).
  event_type: string | null;
  // Normalized ContainerEventType — stable key for icon / color mapping.
  event_type_code: ContainerEventType | null;
};

// Detail endpoint returns the shipment plus its nested resources.
export type OceanShipmentDetail = OceanShipmentEntity & {
  containers: OceanContainerEntity[];
  events: OceanContainerEventEntity[];
};

// Cursor-paginated list response (mirrors backend CursorPaginationResult).
export type CursorPaginated<T> = {
  meta: {
    count: number;
    hasMore: boolean;
    cursor: { after?: number; op?: string } | null;
    next: string | null;
    total: number | null;
  };
  data: T[];
};

export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type StatCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
};

export type ProjectRow = {
  id: string;
  name: string;
  owner: string;
  status: "active" | "paused" | "archived";
  progress: number;
  updated_at: string;
};

export type AuthorRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "online" | "offline";
  joined_at: string;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  address: string;
  registrationDate: string;
};

export type NotificationEntity = {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  created_at: string;
  read: boolean;
};

export type NotificationSettings = {
  email_updates: boolean;
  push_updates: boolean;
  marketing: boolean;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  is_current: boolean;
};

export type SubscriptionUsage = {
  seats_used: number;
  seats_total: number;
  storage_used_gb: number;
  storage_total_gb: number;
};

export type PaymentRecord = {
  id: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
  invoice_url: string | null;
};

// Tag assigned to shipments for filtering / reporting. Backed by the
// backend `tags` table — tenant-scoped, unique on (tenant_id, name).
export type TagEntity = {
  id: number;
  tenant_id: number;
  name: string;
  color: string | null; // hex, e.g. "#10b981"
  created_at: string | null;
  updated_at: string | null;
};

// Customer assigned to shipments (single-assignment M:1). Backed by the
// backend `customers` table — tenant-scoped, unique on (tenant_id, name).
export type CustomerEntity = {
  id: number;
  tenant_id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
};
