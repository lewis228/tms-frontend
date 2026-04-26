// TMS 전역 도메인 타입.
// 백엔드 86 엔드포인트와 1:1 매핑되는 Entity 타입. 응답 키는 camelCase.
//
// ID 정책: 백엔드(SQLAlchemy) 가 int autoincrement 를 사용하므로 모든 entity id
// 및 FK (`xxxId`) 는 `number`. URL 에 들어갈 땐 호출부에서 자동 직렬화됨.

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
  userId: number;
  tenantId: number | null;
  role: UserRole;
  mustChangePassword: boolean;
};

export type TenantEntity = {
  id: number;
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
  id: number;
  tenantId: number | null;
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
  id: number;
  tenantId: number;
  userId: number;
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
  id: number;
  tenantId: number;
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
  id: number;
  tenantId: number;
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
  id: number;
  tenantId: number;
  name: string;
  imoNumber: string | null;
  line: string | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LocationEntity = {
  id: number;
  tenantId: number;
  name: string;
  kind: LocationKind;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  customerId: number | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

// 백엔드 DriverCreatedResponse — POST /drivers 응답에 1회 임시 비번 포함.
export type DriverCreatedResponse = DriverEntity & { tempPassword: string };

export type DeliveryOrderEntity = {
  id: number;
  tenantId: number;
  status: DeliveryStatus;
  direction: ShipmentDirection;
  blNumber: string | null;
  bookingNumber: string | null;
  reference: string | null;
  customerId: number;
  terminalId: number | null;
  vesselId: number | null;
  deliveryLocationId: number | null;
  returnLocationId: number | null;
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
  id: number;
  tenantId: number;
  deliveryOrderId: number;
  step: DeliveryStatus;
  moveType: MoveType;
  serviceType: ServiceType;
  status: LegStatus;
  driverId: number | null;
  pickupLocationId: number | null;
  pickupDate: string | null;
  deliveryLocationId: number | null;
  deliveryDate: string | null;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  storageDays: number;
  isSettled: boolean;
  settlementId: number | null;
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
  tenantId: number;
  actorId: number | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
};

// 백엔드 Notification entity (서버 fan-out 결과).
// channel/status 는 string 으로 받음 (ENUM 변경 시 프론트 immutable).
export type NotificationEntity = {
  id: number;
  tenantId: number;
  userId: number | null;
  channel: string;
  status: string;
  eventType: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Phase 8: Settlement / ExtraCharge / AuditLog / RateSetting
export type ExtraChargeEntity = {
  id: number;
  settlementId: number;
  type: string;
  amount: string;
  description: string | null;
  createdAt: string;
};

export type SettlementAuditLog = {
  id: number;
  settlementId: number;
  action: string;
  actorId: number | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
};

export type RateSettingEntity = {
  id: number;
  tenantId: number;
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
