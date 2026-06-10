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
  | "DISPATCHING"
  | "DISPATCHED"
  | "YARD_STAGED"
  | "FINAL_DELIVERY"
  | "EMPTY_STAGED"
  | "COMPLETED";

export type LegStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "FAILED"
  | "DRY_RUN";

// 재설계(컨플루언스): Leg From/To 의 Location 종류 + Layer1 move_code + Load Direction
// Point/Leg from·to 종류. 타입별 마스터: TERMINAL→terminal, YARD→location(kind=YARD), CUSTOMER→customer.
export type PointType = "TERMINAL" | "YARD" | "CUSTOMER";
export type LegMoveCode =
  | "PPU"
  | "PRE"
  | "PPL"
  | "DRP"
  | "STR"
  | "TRL"
  | "RMP"
  | "OTR"
  | "ERP";
export type LoadDirection = "IMPORT" | "EXPORT" | "BOTH";

export type LoadTypeTemplateEntity = {
  id: number;
  code: string;
  name: string;
  direction: LoadDirection;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
};

export type TemplateMoveType = "LOAD" | "EMPTY" | "NONE";
export type TemplateServiceType = "LIVE" | "DROP" | "NONE";

export type TemplateStepEntity = {
  id: number;
  seq: number;
  fromLocationType: PointType | null;
  toLocationType: PointType | null;
  moveType: TemplateMoveType;
  serviceType: TemplateServiceType;
  moveCode: LegMoveCode | null;
  flags: Record<string, unknown> | null;
  note: string | null;
};

export type LoadTypeTemplateDetailEntity = LoadTypeTemplateEntity & {
  steps: TemplateStepEntity[];
};

export type ShipmentDirection = "IMPORT" | "EXPORT";
export type MoveType = "LOADED" | "EMPTY" | "BOBTAIL";
export type ServiceType = "LIVE" | "DROP";

export type ChassisEventKind =
  | "PICKED_UP"
  | "DROPPED_OFF"
  | "FLIPPED"
  | "RETURNED_TO_POOL"
  | "RETURNED_TO_TERMINAL";

export type ChassisEventEntity = {
  id: number;
  teamId: number;
  chassisId: number;
  legId: number | null;
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

// Addon(부가요금 타입 마스터) — 사용자 CRUD. accessorial→addon 통합.
export type AddonCategory =
  | "WAITING"
  | "EXTRA_STOP"
  | "DRY_RUN"
  | "PENALTY"
  | "SURCHARGE"
  | "FUEL"
  | "CHASSIS_SPLIT"
  | "PREPULL"
  | "LIFT"
  | "NIGHT_GATE"
  | "PIER_PASS"
  | "HAZMAT"
  | "REEFER"
  | "OVERWEIGHT"
  | "STORAGE"
  | "ADJUSTMENT"
  | "OTHER";

export type AddonUnit =
  | "FLAT"
  | "HOUR"
  | "MINUTE"
  | "DAY"
  | "MILE"
  | "PERCENT";

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
  // ── 표시 라벨 / distance provider ─────────
  distanceUnitLabel?: string | null;
  currencyLabel?: string | null;
  currencySymbol?: string | null;
  distanceProvider?: string | null;
  distanceProviderConfig?: string | null;
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
  twicExpiresAt: string | null;
  hireDate: string | null;
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
  registrationExpiresAt: string | null;
  insuranceExpiresAt: string | null;
  inspectionExpiresAt: string | null;
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
  registrationExpiresAt: string | null;
  inspectionExpiresAt: string | null;
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
  isOnHold: boolean;
  holdReason: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
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

// 감사 로그 1건 — D/O activity timeline (백엔드 AuditLog).
export type AuditLogEntity = {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  summary: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  createdByUserId: number | null;
  createdAt: string | null;
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
  fromPointId: number | null;
  toPointId: number | null;
  fromLocationType: PointType | null;
  toLocationType: PointType | null;
  moveCode: LegMoveCode | null;
  status: LegStatus;
  driverId: number | null;
  pickupDate: string | null;
  deliveryDate: string | null;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  reissuedFromLegId: number | null;
  storageDays: number;
  isSettled: boolean;
  settlementId: number | null;
  remarks: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─────────────────────────────────────────────────────────────────
// Leg Add-on (추가요금 한 줄, 중복 가능 — 컨플루언스 재정의로 옛 Layer2/3 통합)
// 백엔드 LegAddonResponseSchema 와 1:1 (Decimal → string).
// ─────────────────────────────────────────────────────────────────

// 레그에 붙인 add-on 인스턴스 — addonId=타입(마스터), code=스냅샷.
export type LegAddonEntity = {
  id: number;
  legId: number;
  addonId: number | null;
  code: string;
  quantity: string;
  unitAmount: string | null;
  amount: string;
  amountOverride: string | null;
  // EXTRA_STOP 등 위치형 add-on (그 레그에서 추가로 들른 곳)
  pointType: PointType | null;
  terminalId: number | null;
  locationId: number | null;
  customerId: number | null;
  extra: Record<string, unknown> | null;
  note: string | null;
  isActive: boolean;
};

// D/O 단위 Add-on (고객 청구용) — 백엔드 DoAddonResponseSchema 와 1:1.
export type DeliveryOrderAddonEntity = {
  id: number;
  deliveryOrderId: number;
  addonId: number | null;
  code: string;
  quantity: string;
  unitAmount: string | null;
  amount: string;
  note: string | null;
  isActive: boolean;
};

// ─────────────────────────────────────────────────────────────────
// Rate management (rate-group / rate-point / rate-multiplier / driver-rate-assignment)
// 백엔드 응답은 alias_generator=to_camel 로 camelCase. Entity 필드도 camelCase 1:1.
// ─────────────────────────────────────────────────────────────────

export type RateMethod = "ZONE" | "CITY" | "MILE" | "HOURLY";
// 요율표 행 포인트 종류(rate_point) — Point 모델의 PointType 과 별개.
export type RatePointType = "TERMINAL" | "YARD";
export type RateContainerSize = "SIZE_20" | "SIZE_40" | "SIZE_45";

export type RateGroupEntity = {
  id: number;
  name: string;
  method: RateMethod;
  isDefault: boolean;
  isTemplate: boolean;
  description: string | null;
  isActive: boolean;
};

export type RatePointEntity = {
  id: number;
  name: string;
  code: string | null;
  pointType: RatePointType;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  terminalId: number | null;
  locationId: number | null;
  note: string | null;
  isActive: boolean;
};

export type RateMultiplierEntity = {
  id: number;
  rateGroupId: number | null;
  containerSize: RateContainerSize;
  factor: string;
  note: string | null;
  isActive: boolean;
};

export type DriverRateAssignmentEntity = {
  id: number;
  driverId: number;
  rateGroupId: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  note: string | null;
  isActive: boolean;
};

// UI 합성 — list 에서 driver / group 이름을 join 표시.
export type DriverRateAssignment = DriverRateAssignmentEntity & {
  driverName?: string;
  groupName?: string;
};

// ─────────────────────────────────────────────────────────────────
// Rate Zone — zip/city 묶음 (요율 매트릭스의 column 차원 후보)
// 백엔드 응답은 alias_generator=to_camel 로 camelCase.
// ─────────────────────────────────────────────────────────────────

export type RateZoneMemberEntity = {
  id: number;
  zipCode: string | null;
  city: string | null;
  state: string | null;
};

export type RateZoneEntity = {
  id: number;
  name: string;
  code: string | null;
  color: string | null;
  geojson: Record<string, unknown> | null;
  description: string | null;
  isActive: boolean;
};

// 상세 — members 포함.
export type RateZone = RateZoneEntity & {
  members: RateZoneMemberEntity[];
};

// ─────────────────────────────────────────────────────────────────
// Rate Sheet — 요율 매트릭스 슬롯 + 셀(entry) + 변경 이력
// ─────────────────────────────────────────────────────────────────

export type SheetKind =
  | "POINT_ZONE"
  | "POINT_CITY"
  | "POINT_POINT"
  | "MILE"
  | "HOURLY";

export type RateMoveType = "LOAD" | "EMPTY" | "NONE";

// 컨플루언스 'Leg 전체 유형': 같은 From→To·Move 라도 Service Type 별 요율 분리.
export type RateServiceType = "LIVE" | "DROP" | "NONE";

export type SheetStatus = "EMPTY" | "PARTIAL" | "ACTIVE" | "INACTIVE";

export type RateSheetEntity = {
  id: number;
  rateGroupId: number;
  kind: SheetKind;
  moveType: RateMoveType | null;
  serviceType: RateServiceType | null;
  rowPointId: number | null;
  note: string | null;
  isActive: boolean;
  status: SheetStatus;
  openEntryCount: number;
};

export type RateEntryEntity = {
  id: number;
  rateSheetId: number;
  colZoneId: number | null;
  colPointId: number | null;
  colCity: string | null;
  colState: string | null;
  containerSize: RateContainerSize | null;
  amount: string | null;
  perUnit: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  source: string;
  changeReason: string | null;
  isActive: boolean;
};

export type RateEntryHistoryEntity = {
  id: number;
  rateSheetId: number;
  rateEntryId: number | null;
  colZoneId: number | null;
  colPointId: number | null;
  colCity: string | null;
  colState: string | null;
  containerSize: RateContainerSize | null;
  oldAmount: string | null;
  newAmount: string | null;
  oldPerUnit: string | null;
  newPerUnit: string | null;
  effectiveFrom: string | null;
  action: string;
  reason: string | null;
  createdAt: string | null;
};

export type RateLookupResult = {
  found: boolean;
  amount: string | null;
  perUnit: string | null;
  rateEntryId: number | null;
  effectiveFrom: string | null;
  message: string | null;
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

// ── Payroll (드라이버 정산) ────────────────────────────────────
// Decimal 필드(baseTotal/accessorialTotal/grandTotal/baseAmount/...)는 문자열로 직렬화한다.
export type PayrollStatus = "DRAFT" | "CONFIRMED" | "PAID" | "VOID";
export type PayrollLineSource = "RESOLVED" | "UNRESOLVED" | "MANUAL";

export type PayrollEntity = {
  id: number;
  driverId: number;
  periodStart: string;
  periodEnd: string;
  status: PayrollStatus;
  baseTotal: string;
  accessorialTotal: string;
  grandTotal: string;
  note: string | null;
  isActive: boolean;
};

export type PayrollLineEntity = {
  id: number;
  legId: number | null;
  workDate: string | null;
  baseAmount: string;
  source: PayrollLineSource;
  rateSnapshot: Record<string, unknown> | null;
  message: string | null;
};

export type PayrollChargeEntity = {
  id: number;
  code: string;
  accessorialId: number | null;
  snapshotUnitAmount: string | null;
  quantity: string;
  amount: string;
  note: string | null;
};

export type PayrollDetailEntity = PayrollEntity & {
  lines: PayrollLineEntity[];
  charges: PayrollChargeEntity[];
};

export type PayrollPreviewLine = {
  legId: number;
  workDate: string | null;
  baseAmount: string;
  source: PayrollLineSource;
  message: string | null;
};

export type PayrollPreview = {
  driverId: number;
  periodStart: string;
  periodEnd: string;
  lineCount: number;
  unresolvedCount: number;
  baseTotal: string;
  lines: PayrollPreviewLine[];
};

export type PayrollPeriodSummary = {
  periodStart: string;
  periodEnd: string;
  count: number;
  driverCount: number;
  baseTotal: string;
  accessorialTotal: string;
  grandTotal: string;
};

export type PayrollBuildPeriodResult = {
  periodStart: string;
  periodEnd: string;
  builtCount: number;
  skippedDrivers: number[];
  settlements: PayrollEntity[];
};

// UI 합성 — driver 이름 join.
export type Payroll = PayrollEntity & { driverName?: string };

// ── Invoice (고객 청구) ────────────────────────────────────────
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "VOID";
export type InvoiceLineSource = "PREFILL" | "MANUAL";

export type InvoiceEntity = {
  id: number;
  customerId: number;
  deliveryOrderId: number | null;
  invoiceNumber: string | null;
  status: InvoiceStatus;
  issueDate: string | null;
  dueDate: string | null;
  costTotal: string;
  chargeTotal: string;
  margin: string; // 서버 computed field
  note: string | null;
  isActive: boolean;
};

export type InvoiceLineEntity = {
  id: number;
  containerId: number | null;
  description: string;
  quantity: string;
  unitAmount: string;
  amount: string;
  source: InvoiceLineSource;
  costAmount: string | null;
  note: string | null;
};

export type InvoiceDetailEntity = InvoiceEntity & {
  lines: InvoiceLineEntity[];
};

// UI 합성 — customer 이름 join.
export type Invoice = InvoiceEntity & { customerName?: string };

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

// H-2 ─────────────────────────────────────────────────────────

// 부가요금 타입 마스터 — 백엔드 AddonResponseSchema 와 1:1 (Decimal → string).
export type AddonEntity = {
  id: number;
  code: string;
  name: string;
  category: AddonCategory;
  unit: AddonUnit;
  amount: string | null;
  percent: string | null;
  freeMinutes: number | null;
  freeDays: number | null;
  autoApply: boolean;
  isSystem: boolean;
  isBillableToCustomer: boolean;
  isPayableToDriver: boolean;
  driverId: number | null;
  note: string | null;
  isActive: boolean;
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

// ─────────────────────────────────────────────────────────────────
// Dual Transaction (반납 + 픽업 1 드라이버 묶음)
// ─────────────────────────────────────────────────────────────────

export type DualTransactionStatus = "PLANNED" | "COMPLETED" | "CANCELLED";

export type DualTransactionEntity = {
  id: number;
  driverId: number;
  truckId: number | null;
  returnLegId: number;
  pickupLegId: number;
  status: DualTransactionStatus;
  scheduledAt: string | null;
  note: string | null;
  isActive: boolean;
};

export type DualTransaction = DualTransactionEntity & { driverName?: string };

// ─────────────────────────────────────────────────────────────────
// Expiring compliance (장비 / DQ 만료 알림) — analytics widget
// ─────────────────────────────────────────────────────────────────

export type ExpiringItem = {
  entityType: "truck" | "chassis" | "driver";
  entityId: number;
  label: string;
  field: "registration" | "insurance" | "inspection" | "license" | "medical" | "twic";
  expiresAt: string;
  daysLeft: number;
};

export type ExpiringComplianceResponse = {
  days: number;
  expiredCount: number;
  soonCount: number;
  items: ExpiringItem[];
};

// ─────────────────────────────────────────────────────────────────
// Phase I — Container-First v3
// ─────────────────────────────────────────────────────────────────

export type HandoverReason =
  | "TERMINAL_CLOSED"
  | "ACCIDENT"
  | "SHIFT_CHANGE"
  | "OTHER";

export type ContainerWorkState =
  | "DRAFT"
  | "PLANNED"
  | "IN_TRANSIT"
  | "AT_STOP"
  | "WAITING_PLAN"
  | "HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type ChargeCategory =
  | "BASE"
  | "WAITING"
  | "EXTRA_STOP"
  | "DRY_RUN"
  | "PENALTY"
  | "SURCHARGE"
  | "ADJUSTMENT"
  | "OTHER";

export type ContainerListEntity = ContainerEntity & {
  workState: ContainerWorkState | null;
  blNumber: string | null;
  bookingNumber: string | null;
  customerId: number | null;
  customerName: string | null;
  direction: "IMPORT" | "EXPORT" | null;
  nextStopId: number | null;
  currentDriverId: number | null;
  currentDriverName: string | null;
  legsTotal: number | null;
  legsCompleted: number | null;
};

export type ContainerStopEntity = {
  id: number;
  containerId: number;
  sequenceNo: number;
  pointType: PointType;
  terminalId: number | null;
  locationId: number | null;
  customerId: number | null;
  pointName: string | null;
  locationName: string | null;
  plannedArrival: string | null;
  plannedDeparture: string | null;
  actualArrival: string | null;
  actualDeparture: string | null;
  note: string | null;
  isActive: boolean;
};

export type LegDriverSegmentEntity = {
  id: number;
  legId: number;
  sequenceNo: number;
  driverId: number;
  driverName: string | null;
  truckId: number | null;
  startedAt: string | null;
  endedAt: string | null;
  handoverReason: HandoverReason | null;
  note: string | null;
  isActive: boolean;
};

export type LegFullEntity = {
  id: number;
  deliveryOrderId: number;
  containerId: number | null;
  moveType: MoveType | null;
  serviceType: ServiceType | null;
  fromPointId: number | null;
  toPointId: number | null;
  fromLocationType: PointType | null;
  toLocationType: PointType | null;
  moveCode: LegMoveCode | null;
  status: LegStatus;
  driverId: number | null;
  driverName: string | null;
  startedAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  reissuedFromLegId: number | null;
  note: string | null;
  isActive: boolean;
  segments: LegDriverSegmentEntity[];
};

export type ContainerFullEntity = {
  container: ContainerListEntity;
  deliveryOrder: {
    id: number | null;
    blNumber: string | null;
    bookingNumber: string | null;
    reference: string | null;
    customerId: number | null;
    customerName: string | null;
    direction: "IMPORT" | "EXPORT" | null;
    eta: string | null;
    terminalId: number | null;
    terminalName: string | null;
    vesselId: number | null;
    vesselName: string | null;
    blReleased: boolean;
  };
  stops: ContainerStopEntity[];
  legs: LegFullEntity[];
  events: ContainerEventEntity[];
};
