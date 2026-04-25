import api from "@/lib/axios";
import type {
  CursorPaginated,
  OceanShipmentDetail,
  OceanShipmentEntity,
} from "@/types";

// Backend filter shape. Matches PaginateShipmentRequestSchema on the server.
// Kept as a loose record — the server ignores unknown keys, but the named
// fields below are the ones the UI actually exposes today.
export type OceanShipmentListParams = {
  // Cursor from prior page (backend uses id-based cursors under the hood).
  where__id__less_than?: number;
  // Optional first-page hint to request the total count too. Omit on
  // subsequent pages so the backend skips the COUNT query.
  include_total?: boolean;
  // Page size; backend default is fine for dashboards.
  take?: number;
  // Tracking-level status (`pending` / `tracking` / `failed` / `stopped` /
  // `cancelled` / `awaiting_manifest`). Used by the `Stopped Tracking` tab
  // and for surfacing the badge column, **not** by the physical-state tabs.
  where__status__equal?: string;
  // Carrier filter — dropdown sends the carriers.id FK (not a free-form
  // name). Matches backend `PaginateShipmentRequestSchema.where__carrier_id__equal`.
  where__carrier_id__equal?: number;
  // "Recently Added" tab — ISO-8601 UTC string; backend matches on
  // ShipmentModel.created_at >= value.
  where__created_at__more_than_or_equal?: string;
  // Physical-state tabs ("On Ship" / "Arrived"). Comma-separated list of
  // ContainerPhysicalStatus values — the server returns shipments whose
  // **any** container is in one of the listed states. Valid values:
  //   registered / gate_in / loaded / on_ship / discharged / gate_out /
  //   empty_returned / unknown
  where__any_container_physical_status__in?: string;
};

export async function fetchOceanShipments(
  params: OceanShipmentListParams = {},
) {
  const { data } = await api.get<CursorPaginated<OceanShipmentEntity>>(
    "/ocean/shipments",
    { params },
  );
  return data;
}

export async function fetchOceanShipmentById(shipmentId: number) {
  const { data } = await api.get<OceanShipmentDetail>(
    `/ocean/shipments/${shipmentId}`,
  );
  return data;
}

export async function createOceanShipment({
  mbl,
  carrier_id,
  customer_id,
  ref_numbers,
  tag_ids,
}: {
  mbl: string;
  // carrier_id references the backend `carriers` table. Required at this
  // layer — the form gates submission on selection, and the server 422s
  // missing / zero values.
  carrier_id: number;
  // Phase B metadata — all optional. `customer_id` references the team-scoped
  // customers table. `tag_ids` must reference tags owned by the current team;
  // the server 400s on cross-team ids.
  customer_id?: number | null;
  ref_numbers?: string[] | null;
  tag_ids?: number[] | null;
}) {
  const { data } = await api.post<OceanShipmentEntity>("/ocean/shipments", {
    mbl,
    carrier_id,
    customer_id,
    ref_numbers,
    tag_ids,
  });
  return data;
}

export async function updateOceanShipment({
  shipmentId,
  customer_id,
  ref_numbers,
  tag_ids,
}: {
  shipmentId: number;
  // Pass `null` or `0` to clear the customer link; omit to leave unchanged.
  customer_id?: number | null;
  ref_numbers?: string[] | null;
  tag_ids?: number[] | null;
}) {
  const { data } = await api.patch<OceanShipmentEntity>(
    `/ocean/shipments/${shipmentId}`,
    { customer_id, ref_numbers, tag_ids },
  );
  return data;
}

export async function stopOceanShipment(shipmentId: number) {
  await api.delete(`/ocean/shipments/${shipmentId}`);
  // Echo the id back so mutation hooks can target cache entries without a
  // re-fetch — the server returns 204 No Content.
  return { id: shipmentId };
}

export async function resubmitOceanShipment(shipmentId: number) {
  // Server returns the shipment with status flipped back to "pending" and
  // re-dispatches the scrape task. Same shape as fetch/create response.
  const { data } = await api.post<OceanShipmentEntity>(
    `/ocean/shipments/${shipmentId}/resubmit`,
  );
  return data;
}

// "Track by MBL" — single-shot lookup without creating a shipment. Backed by
// the existing GET /ocean/track endpoint. Response mirrors the detail shape.
export async function trackByMbl(mbl: string) {
  const { data } = await api.get<{
    shipment: OceanShipmentEntity;
    containers: OceanShipmentDetail["containers"];
    events: OceanShipmentDetail["events"];
  }>("/ocean/track", { params: { mbl } });
  return data;
}
