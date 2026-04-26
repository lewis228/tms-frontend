// /ai-intake/* 매핑 — D/O 자동 추출.
//
// 백엔드 provider 는 환경변수로 선택 (gemini / anthropic). 프론트는 동일 contract.
import api from "@/lib/axios";

// 백엔드 EXTRACT_FIELDS 와 1:1 (snake_case 키 그대로 — 백엔드 응답 그대로 받음).
export type AIIntakeFields = {
  bl_number?: string | null;
  booking_number?: string | null;
  reference?: string | null;
  container_number?: string | null;
  container_size?: string | null;
  container_type?: string | null;
  chassis_number?: string | null;
  eta?: string | null;
  pickup_appointment?: string | null;
  delivery_appointment?: string | null;
  return_appointment?: string | null;
  demurrage_lfd?: string | null;
  detention_lfd?: string | null;
};

export type AIIntakeResponse = {
  filename: string;
  sizeBytes: number;
  fields: AIIntakeFields;
  confidence: number;
  provider: string;       // "gemini" | "anthropic"
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
