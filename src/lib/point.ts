// Typed Point 값 (PointPicker 입출력) — 컴포넌트와 분리해 fast-refresh 규칙 준수.
import type { PointType } from "@/types";

export type PointValue = {
  pointType: PointType | null;
  terminalId: number | null;
  locationId: number | null;
  customerId: number | null;
};

export const EMPTY_POINT: PointValue = {
  pointType: null,
  terminalId: null,
  locationId: null,
  customerId: null,
};
