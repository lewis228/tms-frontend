// /api/v1/location-pings/* — driver 실시간 위치 조회
import api from "@/lib/axios";

export type LocationPingEntity = {
  id: number;
  driverId: number;
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  headingDeg: number | null;
  accuracyM: number | null;
  occurredAt: string;
};

export async function fetchLatestPing(
  driverId: number,
): Promise<LocationPingEntity | null> {
  const { data } = await api.get<LocationPingEntity | null>(
    `/location-pings/latest/${driverId}`,
  );
  return data;
}
