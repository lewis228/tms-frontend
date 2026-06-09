// /api/v1/analytics/* — Dashboard 집계 endpoint.
import api from "@/lib/axios";
import type { ExpiringComplianceResponse } from "@/types";

export type MarginTrendPoint = {
  bucket: string;
  revenue: string;
  payouts: string;
  margin: string;
};

export type MarginTrendResponse = {
  days: number;
  points: MarginTrendPoint[];
  totalRevenue: string;
  totalPayouts: string;
  totalMargin: string;
};

export type DriverUtilizationRow = {
  driverId: number;
  driverName: string;
  totalLegs: number;
  completedLegs: number;
  inTransitLegs: number;
  utilizationPct: number;
};

export type DriverUtilizationResponse = {
  days: number;
  rows: DriverUtilizationRow[];
};

export type ContainerTurnoverPoint = {
  bucket: string;
  picked: number;
  returned: number;
  streetTurned: number;
};

export type ContainerTurnoverResponse = {
  days: number;
  points: ContainerTurnoverPoint[];
  avgDwellDays: number;
};

export type StreetTurnSavingsResponse = {
  days: number;
  approvedCount: number;
  requestedCount: number;
  rejectedCount: number;
  savingsAmount: string;
  savingPerTurn: string;
};

export async function fetchMarginTrend(days = 30): Promise<MarginTrendResponse> {
  const { data } = await api.get<MarginTrendResponse>(
    "/analytics/margin-trend",
    { params: { days } },
  );
  return data;
}

export async function fetchDriverUtilization(
  days = 7,
): Promise<DriverUtilizationResponse> {
  const { data } = await api.get<DriverUtilizationResponse>(
    "/analytics/driver-utilization",
    { params: { days } },
  );
  return data;
}

export async function fetchContainerTurnover(
  days = 30,
): Promise<ContainerTurnoverResponse> {
  const { data } = await api.get<ContainerTurnoverResponse>(
    "/analytics/container-turnover",
    { params: { days } },
  );
  return data;
}

export async function fetchStreetTurnSavings(
  days = 30,
): Promise<StreetTurnSavingsResponse> {
  const { data } = await api.get<StreetTurnSavingsResponse>(
    "/analytics/street-turn-savings",
    { params: { days } },
  );
  return data;
}

export async function fetchExpiringCompliance(
  days = 30,
): Promise<ExpiringComplianceResponse> {
  const { data } = await api.get<ExpiringComplianceResponse>(
    "/analytics/expiring-compliance",
    { params: { days } },
  );
  return data;
}
