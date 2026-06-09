// /api/v1/load-type-templates/* 매핑.
import api from "@/lib/axios";
import { adaptCursorToPaged, type CursorResponse } from "@/lib/pagination";
import type {
  LoadDirection,
  LoadTypeTemplateEntity,
  PagedResponse,
} from "@/types";

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
