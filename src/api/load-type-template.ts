// /api/v1/load-type-templates/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  LoadDirection,
  LoadTypeTemplateDetailEntity,
  LoadTypeTemplateEntity,
  PagedResponse,
} from "@/types";

// 상세(steps 포함) — 템플릿 프리필용.
export async function fetchLoadTypeTemplate(
  id: number,
): Promise<LoadTypeTemplateDetailEntity> {
  const { data } = await api.get<LoadTypeTemplateDetailEntity>(
    `/load-type-templates/${id}`,
  );
  return data;
}

export async function fetchLoadTypeTemplates(
  params: {
    page?: number;
    size?: number;
    direction?: LoadDirection;
    includeInactive?: boolean;
  } = {},
): Promise<PagedResponse<LoadTypeTemplateEntity>> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    page: params.page,
    size: params.size,
    where__direction__equal: params.direction,
    include_inactive: params.includeInactive,
  };
  const { data } = await api.get<CursorResponse<LoadTypeTemplateEntity>>(
    "/load-type-templates",
    { params: queryParams },
  );
  return adaptCursorToPaged(data, params.page, params.size);
}
