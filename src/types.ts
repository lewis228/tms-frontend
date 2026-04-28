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

export type LegStatus = "PENDING" | "IN_TRANSIT" | "COMPLETED" | "FAILED" | "DRY_RUN";

export type ShipmentDirection = "IMPORT" | "EXPORT";
export type MoveType = "LOADED" | "EMPTY" | "BOBTAIL";
export type ServiceType = "LIVE" | "DROP";

export type LegKind =
  | "BOBTAIL"
  | "PICKUP"
  | "DROP"
  | "LIVE_UNLOAD"
  | "RETURN"
  | "STREET_TURN"
  | "CHASSIS_FLIP"
  | "DRY_RUN"
  | "REPOSITION"
  | "PARTIAL_PICKUP"
  | "MULTI_STOP_DELIVERY";

export type StopKind =
  | "PICKUP_FULL"
  | "DROP_FULL"
  | "PICKUP_EMPTY"
  | "DROP_EMPTY"
  | "CHASSIS_GET"
  | "CHASSIS_RETURN"
  | "WAIT"
  | "FUEL"
  | "SCALE"
  | "OTHER";

export type ChassisEventKind =
  | "PICKED_UP"
  | "DROPPED_OFF"
  | "FLIPPED"
  | "RETURNED_TO_POOL"
  | "RETURNED_TO_TERMINAL";

export type LegStopEntity = {
  id: number;
  teamId: number;
  legId: number;
  sequenceNo: number;
  stopKind: StopKind;
  locationId: number | null;
  containerId: number | null;
  chassisId: number | null;
  arrivedAt: string | null;
  departedAt: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChassisEventEntity = {
  id: number;
  teamId: number;
  chassisId: number;
  legId: number | null;
  legStopId: number | null;
  eventKind: ChassisEventKind;
  locationId: number | null;
  occurredAt: string;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type ContainerSize =
  | "20GP"
  | "40GP"
  | "40HC"
  | "40OT"
  | "45HC"
  | "20RF"
  | "40RF";
export type RateType = "FLAT_RATE" | "PERCENTAGE" | "PER_MILE";

export type ChargeKind =
  | "BASE"
  | "ACCESSORIAL"
  | "PENALTY"
  | "FUEL"
  | "TAX"
  | "DISCOUNT";

export type ChargeUnit =
  | "FLAT"
  | "HOUR"
  | "MINUTE"
  | "DAY"
  | "MILE"
  | "PERCENT";

export type ChargeSource = "AUTO" | "MANUAL" | "EVENT";
export type PartyKind = "CUSTOMER" | "CARRIER" | "DRIVER" | "COMPANY" | "POOL";
export type SettlementStatus = "PENDING" | "CALCULATED" | "ADJUSTED" | "APPROVED";
export type LocationKind = "YARD" | "CUSTOMER" | "PORT" | "OTHER";

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

// 백엔드 /auth/login 응답 — access/refresh 토큰만. 사용자 정보는 별도 /users/me.
export type LoginResponse = {
  accessToken: string;
  refreshToken: string | null;
};

// 백엔드 TeamDetailResponseSchema (camelCase). slug / planTier / contactEmail 같은 필드는
// 백엔드 모델에 없으니 제거. phoneNumber 가 공용 연락처 역할.
export type TeamEntity = {
  id: number;
  name: string;
  isActive: boolean;
  // 온보딩
  onboardingStep1Done: boolean;
  onboardingStep2Done: boolean;
  onboardingStep3Done: boolean;
  onboardingCompleted: boolean;
  // 회사 / 연락
  memo: string | null;
  timezone: string | null;
  imageUrl: string | null;
  companyName: string | null;
  registrationNumber: string | null;
  address: string | null;
  representativeName: string | null;
  phoneNumber: string | null;
  // 표시 / 운영
  currency: string | null;
  decimalPlaces: number;
  productInfoDisplay: string | null;
  productInfoTemplate: string | null;
  excelProductIdentification: string | null;
  gs1GtinEnabled: boolean;
  files: unknown[];
  createdAt: string | null;
  updatedAt: string | null;
};

// 백엔드 UserTeamRowResponseSchema — 한 user 의 team 멤버십 1건.
export type UserTeamMembership = {
  id: number;
  teamId: number;
  teamName: string | null;
  permissionGroupId: number | null;
  // 온보딩 진행 상태 — wizard 표시 여부 결정
  onboardingCompleted: boolean;
  onboardingStep1Done: boolean;
  onboardingStep2Done: boolean;
  onboardingStep3Done: boolean;
};

// 백엔드 UserResponseSchema (camelCase 변환 후) 와 1:1.
// N:M 모델: 한 user 가 여러 team 에 소속 가능 → teams 배열.
// "현재 활성 team" 는 별도 store (currentTeamId) 에서 관리.
export type UserEntity = {
  id: number;
  email: string | null;
  role: UserRole;
  name: string | null;
  phone: string | null;
  isActive: boolean;
  authProvider: string;
  notificationEmail: string | null;
  eventNotificationEnabled: boolean;
  language: string | null;
  teams: UserTeamMembership[];
  files: unknown[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type EmploymentKind =
  | "IN_HOUSE"
  | "OWNER_OPERATOR_SOLO"
  | "CARRIER_DRIVER";
export type PaymentTermsKind =
  | "PERCENT_OF_REVENUE"
  | "PER_LEG"
  | "HOURLY"
  | "SALARY";

export type DriverEntity = {
  id: number;
  teamId: number;
  userId: number;
  email: string;
  name: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  isActive: boolean;
  note: string | null;
  // H-5
  employmentKind: EmploymentKind;
  carrierId: number | null;
  paymentTermsKind: PaymentTermsKind | null;
  paymentTermsValue: string | null;
  defaultTruckId: number | null;
  defaultChassisId: number | null;
  licenseExpiresAt: string | null;
  medicalCertExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// H-3 ─────────────────────────────────────────────────────────

export type TruckOwnerKind = "COMPANY" | "DRIVER";
export type TruckStatus = "ACTIVE" | "MAINTENANCE" | "RETIRED";

export type TruckEntity = {
  id: number;
  teamId: number;
  plateNo: string;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  ownerKind: TruckOwnerKind;
  ownerDriverId: number | null;
  status: TruckStatus;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// H-4 ─────────────────────────────────────────────────────────

export type EquipmentPoolKind = "TERMINAL_POOL" | "THIRD_PARTY_POOL";

export type EquipmentPoolEntity = {
  id: number;
  teamId: number;
  name: string;
  kind: EquipmentPoolKind;
  operator: string | null;
  locationId: number | null;
  contact: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChassisOwnerKind =
  | "COMPANY"
  | "DRIVER"
  | "TERMINAL_POOL"
  | "THIRD_PARTY_POOL";
export type ChassisSize = "20" | "40" | "45" | "COMBO";
export type ChassisStatus = "AVAILABLE" | "IN_USE" | "AT_POOL" | "MAINTENANCE";

export type ChassisEntity = {
  id: number;
  teamId: number;
  chassisNumber: string;
  size: ChassisSize | null;
  ownerKind: ChassisOwnerKind;
  ownerDriverId: number | null;
  ownerPoolId: number | null;
  status: ChassisStatus;
  currentLocationId: number | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PartnerKind = "CUSTOMER" | "CARRIER" | "BROKER" | "VENDOR";

export type CustomerEntity = {
  id: number;
  teamId: number;
  name: string;
  code: string | null;
  kind: PartnerKind;
  billingAddress: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  // CARRIER 전용 (다른 kind 는 null)
  mcNumber: string | null;
  dotNumber: string | null;
  insuranceExpiresAt: string | null;
  insuranceDocUrl: string | null;
  w9DocUrl: string | null;
  paymentTermsDays: number | null;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TerminalEntity = {
  id: number;
  teamId: number;
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
  teamId: number;
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
  teamId: number;
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

// H-1: D/O 헤더 슬림화. 컨테이너 상세는 ContainerEntity 1:N 으로 분리.
export type EtaStatus = "OVERDUE" | "URGENT" | "OK" | "NONE";

export type DeliveryOrderEntity = {
  id: number;
  teamId: number;
  status: DeliveryStatus;
  direction: ShipmentDirection;
  blNumber: string | null;
  bookingNumber: string | null;
  reference: string | null;
  customerId: number;
  terminalId: number | null;
  vesselId: number | null;
  eta: string | null;
  blReleased: boolean;
  internalNote: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // H-10: list 응답에만 채워짐
  containerCount?: number | null;
  containerCompletedCount?: number | null;
  marginPreview?: string | null;
  etaStatus?: EtaStatus | null;
};

// D/O detail 응답 — containers nested 포함 (백엔드 DeliveryOrderDetailResponseSchema).
export type DeliveryOrderDetailEntity = DeliveryOrderEntity & {
  containers: ContainerEntity[];
};

export type ContainerEntity = {
  id: number;
  teamId: number;
  deliveryOrderId: number;
  sequenceNo: number;
  containerNumber: string | null;
  sealNo: string | null;
  size: ContainerSize | null;
  type: string | null;
  weightKg: string | null;       // Decimal → string (JSON 직렬화 관례)
  chassisId: number | null;      // H-4: chassis 마스터 FK
  pickupAppointment: string | null;
  deliveryAppointment: string | null;
  returnAppointment: string | null;
  demurrageLfd: string | null;
  detentionLfd: string | null;
  emptyDate: string | null;
  loadedDate: string | null;
  deliveryLocationId: number | null;
  returnLocationId: number | null;
  serviceType: ServiceType | null;
  pierPassPaid: boolean;
  customsCleared: boolean;
  status: DeliveryStatus;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContainerEventKind =
  | "GATE_OUT"
  | "DELIVERED"
  | "EMPTIED"
  | "STREET_TURNED"
  | "REUSED"
  | "GATE_IN"
  | "RETURNED";

export type ContainerEventEntity = {
  id: number;
  teamId: number;
  containerId: number;
  legId: number | null;
  eventKind: ContainerEventKind;
  locationId: number | null;
  occurredAt: string;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LegEntity = {
  id: number;
  teamId: number;
  deliveryOrderId: number;
  containerId: number | null;
  truckId: number | null;
  chassisId: number | null;
  chassisAtStartId: number | null;
  chassisAtEndId: number | null;
  containerAtStartId: number | null;
  containerAtEndId: number | null;
  step: DeliveryStatus;
  moveType: MoveType;
  serviceType: ServiceType;
  legKind: LegKind | null;
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
  remarks: string | null;
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
  teamId: number;
  actorId: number | null;
  payload: Record<string, unknown> | null;
  occurredAt: string;
};

// 백엔드 Notification entity (서버 fan-out 결과).
// channel/status 는 string 으로 받음 (ENUM 변경 시 프론트 immutable).
export type NotificationEntity = {
  id: number;
  teamId: number;
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

// API Keys — TMS 백엔드의 /api/v1/api-keys 엔드포인트와 1:1.
// 응답은 ResponseSchema 의 alias_generator=to_camel 로 camelCase 변환됨.
// 전체 키 문자열은 createApiKey 응답에서만 한 번 노출 (ApiKeyCreated.key).
export type ApiKeyEntity = {
  id: number;
  teamId: number;
  name: string;
  description: string | null;
  prefix: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  createdByUserId: number | null;
};

export type ApiKeyCreated = ApiKeyEntity & { key: string };

// Phase 8: Settlement / ExtraCharge / AuditLog / RateSetting
export type SettlementEntity = {
  id: number;
  teamId: number;
  legId: number;
  systemTotal: string;
  driverReportedAmount: string | null;
  discrepancy: string | null;
  hasFlag: boolean;
  finalAmount: string | null;
  settlementStatus: SettlementStatus;
  isSettled: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  unapprovedAt: string | null;
  unapprovedBy: string | null;
  unapprovedReason: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

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
  teamId: number;
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

// H-2 ─────────────────────────────────────────────────────────

export type ChargeCodeEntity = {
  id: number;
  teamId: number;
  code: string;
  name: string;
  kind: ChargeKind;
  defaultUnit: ChargeUnit;
  defaultAmount: string | null;
  isBillableToCustomer: boolean;
  isPayableToDriver: boolean;
  glAccount: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RateCardEntity = {
  id: number;
  teamId: number;
  chargeCodeId: number;
  name: string | null;
  scopeCustomerId: number | null;
  scopeTerminalId: number | null;
  scopeSize: ContainerSize | null;
  scopeZone: string | null;
  scopeFromLocationId: number | null;
  scopeToLocationId: number | null;
  unit: ChargeUnit;
  amount: string | null;
  percent: string | null;
  perUnit: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  priority: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LegChargeEntity = {
  id: number;
  teamId: number;
  legId: number;
  chargeCodeId: number;
  rateCardId: number | null;
  amount: string;
  quantity: string | null;
  unit: ChargeUnit | null;
  source: ChargeSource;
  description: string | null;
  settlementId: number | null;
  isSettled: boolean;
  payeeKind: PartyKind | null;
  payeePartnerId: number | null;
  payeeDriverId: number | null;
  payeePoolId: number | null;
  payerKind: PartyKind | null;
  payerPartnerId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// H-8 ─────────────────────────────────────────────────────────

export type StreetTurnLinkType = "AUTO" | "MANUAL";
export type StreetTurnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED";

export type StreetTurnEntity = {
  id: number;
  importOrderId: number;
  exportOrderId: number;
  containerNumber: string | null;
  containerId: number | null;
  linkType: StreetTurnLinkType;
  status: StreetTurnStatus;
  carrierApprovalNo: string | null;
  requestedBy: number | null;
  requestedAt: string | null;
  approvedBy: number | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  isActive: boolean;
};
