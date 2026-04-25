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
