import api from "@/lib/axios";

// Backend shape mirrors `VesselResponseSchema` in
// `backend_tracking-api/src/vessel/schemas/response.py`. Keep these two in
// sync when extending the payload — frontend reads snake_case directly.

export type VesselPositionEntity = {
  latitude: number;
  longitude: number;
  speed_knots: number | null;
  heading_degrees: number | null;
  navigation_status: string | null;
  reported_at: string | null;
};

export type VesselEntity = {
  id: number;
  mmsi: string | null;
  imo_number: string | null;
  name: string;
  flag: string | null;
  call_sign: string | null;
  length_m: number | null;
  breadth_m: number | null;
  gross_tonnage: number | null;
  vessel_type_code: number | null;
  year_built: number | null;
  owner: string | null;
  position: VesselPositionEntity | null;
};

// Team-scoped list of vessels (joined via ocean_shipments.vessel_id).
// Team id is resolved server-side via the auth dependency — no param needed
// client-side. Empty array if no shipments are tracked yet.
export async function fetchFleetVessels(): Promise<VesselEntity[]> {
  const { data } = await api.get<VesselEntity[]>("/api/v1/fleet/vessels");
  return data;
}
