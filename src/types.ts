// TMS 전역 도메인 타입.
// 백엔드 86 엔드포인트와 1:1 매핑되는 Entity 타입. 응답 키는 camelCase.

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DISPATCHER" | "DRIVER";

export const ROLE_RANK: Record<UserRole, number> = {
  DRIVER: 0,
  DISPATCHER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export type DeliveryStatus =
  | "PLANNING"
  | "DISPATCHED"
  | "YARD_STAGED"
  | "FINAL_DELIVERY"
  | "EMPTY_STAGED"
  | "COMPLETED";

export type LegStatus = "PENDING" | "IN_TRANSIT" | "COMPLETED" | "FAILED";

export type ShipmentDirection = "IMPORT" | "EXPORT";
export type MoveType = "LOADED" | "EMPTY";
export type ServiceType = "LIVE" | "DROP";
export type ContainerSize =
  | "20GP"
  | "40GP"
  | "40HC"
  | "40OT"
  | "45HC"
  | "20RF"
  | "40RF";
export type RateType = "FLAT_RATE" | "PERCENTAGE" | "PER_MILE";
export type SettlementStatus = "PENDING" | "CALCULATED" | "ADJUSTED" | "APPROVED";
export type LocationKind = "YARD" | "CUSTOMER" | "PORT" | "OTHER";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

export type LoginResponse = TokenPair & {
  userId: string;
  tenantId: string | null;
  role: UserRole;
  mustChangePassword: boolean;
};

export type TenantEntity = {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  isActive: boolean;
  timezone: string;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserEntity = {
  id: string;
  tenantId: string | null;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DriverEntity = {
  id: string;
  tenantId: string;
  userId: string;
  email: string;
  name: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  truckNumber: string | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerEntity = {
  id: string;
  tenantId: string;
  name: string;
  code: string | null;
  billingAddress: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TerminalEntity = {
  id: string;
  tenantId: string;
  name: string;
  code: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VesselEntity = {
  id: string;
  tenantId: string;
  name: string;
  imoNumber: string | null;
  line: string | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocationEntity = {
  id: string;
  tenantId: string;
  name: string;
  kind: LocationKind;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  customerId: string | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

// 백엔드 DriverCreatedResponse — POST /drivers 응답에 1회 임시 비번 포함.
export type DriverCreatedResponse = DriverEntity & { tempPassword: string };

export type DeliveryOrderEntity = {
  id: string;
  tenantId: string;
  status: DeliveryStatus;
  direction: ShipmentDirection;
  blNumber: string | null;
  bookingNumber: string | null;
  reference: string | null;
  customerId: string;
  terminalId: string | null;
  vesselId: string | null;
  deliveryLocationId: string | null;
  returnLocationId: string | null;
  containerNumber: string | null;
  containerSize: ContainerSize | null;
  containerType: string | null;
  chassisNumber: string | null;
  eta: string | null;
  pickupAppointment: string | null;
  deliveryAppointment: string | null;
  returnAppointment: string | null;
  demurrageLfd: string | null;
  detentionLfd: string | null;
  emptyDate: string | null;
  loadedDate: string | null;
  blReleased: boolean;
  pierPassPaid: boolean;
  customsCleared: boolean;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LegEntity = {
  id: string;
  tenantId: string;
  deliveryOrderId: string;
  step: DeliveryStatus;
  moveType: MoveType;
  serviceType: ServiceType;
  status: LegStatus;
  driverId: string | null;
  pickupLocationId: string | null;
  pickupDate: string | null;
  deliveryLocationId: string | null;
  deliveryDate: string | null;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  storageDays: number;
  isSettled: boolean;
  settlementId: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

export type AppError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type UseMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

// WebSocket envelope (백엔드 RealtimeEvent).
export type RealtimeEvent = {
  type: string;
  tenantId: string;
  actorId: string | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
};

// In-app notification — WS event 가 도착하면 store 에 누적.
// 백엔드 알림 도메인 별도 도입 전까지는 클라이언트 메모리에만 보관 (persist 안 함).
export type InAppNotification = {
  id: string; // crypto.randomUUID
  type: string; // RealtimeEvent.type 그대로
  title: string; // localized 표시 제목
  description: string | null; // 본문 (e.g. "D/O REF1234 → DISPATCHED")
  link: string | null; // 클릭 시 이동 (e.g. "/app/delivery-orders?do=:id")
  read: boolean;
  occurredAt: string; // ISO
};

// Phase 8: Settlement / ExtraCharge / AuditLog / RateSetting
export type ExtraChargeEntity = {
  id: string;
  settlementId: string;
  type: string;
  amount: string;
  description: string | null;
  createdAt: string;
};

export type SettlementAuditLog = {
  id: string;
  settlementId: string;
  action: string;
  actorId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
};

export type RateSettingEntity = {
  id: string;
  tenantId: string;
  name: string;
  rateType: RateType;
  flatAmount: string | null;
  ratePercent: string | null;
  ratePerMile: string | null;
  effectiveDate: string;
  isActive: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};
