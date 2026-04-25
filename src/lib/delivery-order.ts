// D/O 도메인 상수 + 헬퍼.
import type { DeliveryStatus, ShipmentDirection } from "@/types";

export const CONTAINER_NUMBER_PATTERN = /^[A-Z]{4}\d{7}$/;

export const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PLANNING: "PLANNING",
  DISPATCHED: "DISPATCHED",
  YARD_STAGED: "YARD_STAGED",
  FINAL_DELIVERY: "FINAL_DELIVERY",
  EMPTY_STAGED: "EMPTY_STAGED",
  COMPLETED: "COMPLETED",
};

// 상태 색상 (Tailwind 토큰).
export const STATUS_COLOR: Record<DeliveryStatus, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  YARD_STAGED: "bg-amber-100 text-amber-700",
  FINAL_DELIVERY: "bg-violet-100 text-violet-700",
  EMPTY_STAGED: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
};

// status 진행 순서 (timeline 표시용). 실제 전이는 백엔드 게이트가 결정.
export const STATUS_ORDER: DeliveryStatus[] = [
  "PLANNING",
  "DISPATCHED",
  "YARD_STAGED",
  "FINAL_DELIVERY",
  "EMPTY_STAGED",
  "COMPLETED",
];

// 다음 가능한 transition (백엔드 _ALLOWED 와 동일).
export const ALLOWED_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  PLANNING: ["DISPATCHED"],
  DISPATCHED: ["YARD_STAGED", "FINAL_DELIVERY"],
  YARD_STAGED: ["FINAL_DELIVERY"],
  FINAL_DELIVERY: ["EMPTY_STAGED", "COMPLETED"],
  EMPTY_STAGED: ["COMPLETED"],
  COMPLETED: [],
};

export const DIRECTION_LABEL: Record<ShipmentDirection, string> = {
  IMPORT: "IMPORT",
  EXPORT: "EXPORT",
};
