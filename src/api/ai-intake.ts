// /ai-intake/* 매핑 — D/O 자동 추출.
//
// H-1: containers 배열 추출. 헤더 + containers[]. snake_case 그대로.
import api from "@/lib/axios";

export type AIIntakeContainer = {
  container_number?: string | null;
  size?: string | null;
  type?: string | null;
  seal_no?: string | null;
  weight_kg?: number | string | null;
  chassis_number?: string | null;
  pickup_appointment?: string | null;
  delivery_appointment?: string | null;
  return_appointment?: string | null;
  demurrage_lfd?: string | null;
  detention_lfd?: string | null;
  empty_date?: string | null;
  loaded_date?: string | null;
  delivery_location_name?: string | null;
  return_location_name?: string | null;
  service_type?: string | null;
};

export type AIIntakeFields = {
  bl_number?: string | null;
  booking_number?: string | null;
  reference?: string | null;
  customer_name?: string | null;
  vessel_name?: string | null;
  voyage_no?: string | null;
  terminal_name?: string | null;
  eta?: string | null;
  direction?: string | null;
  containers?: AIIntakeContainer[] | null;
};

export type AIIntakeResponse = {
  filename: string;
  sizeBytes: number;
  fields: AIIntakeFields;
  confidence: number;
  provider: string;
};

export async function extractDeliveryOrderFromFile(
  file: File,
): Promise<AIIntakeResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<AIIntakeResponse>(
    "/ai-intake/extract",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
