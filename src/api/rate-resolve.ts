// /api/v1/rate-sheets/resolve/preview 매핑 — 요율 종합 해석 미리보기.
// (axios baseURL 이 이미 /api/v1 포함)
import api from "@/lib/axios";
import type { RateMoveType, RateResolveResult, RateServiceType } from "@/types";

export type RateResolvePreviewBody = {
  driverId?: number | null;
  workDate: string; // YYYY-MM-DD
  moveType: RateMoveType;
  serviceType?: RateServiceType | null;
  fromZip?: string;
  fromCity?: string;
  fromState?: string;
  destZip?: string;
  destCity?: string;
  destState?: string;
  miles?: string;
  hours?: string;
};

export async function resolveRatePreview(
  body: RateResolvePreviewBody
): Promise<RateResolveResult> {
  const { data } = await api.post<RateResolveResult>(
    "/rate-sheets/resolve/preview",
    body
  );
  return data;
}
