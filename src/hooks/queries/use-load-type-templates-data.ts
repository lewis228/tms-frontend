import { useQuery } from "@tanstack/react-query";

import { fetchLoadTypeTemplates } from "@/api/load-type-template";
import { PAGE_SIZE, QUERY_KEYS } from "@/lib/constants";
import type { LoadDirection } from "@/types";

export function useLoadTypeTemplatesData(
  params: {
    page?: number;
    size?: number;
    direction?: LoadDirection;
    includeInactive?: boolean;
  } = {},
) {
  const page = params.page ?? 1;
  const size = params.size ?? PAGE_SIZE;
  return useQuery({
    queryKey: QUERY_KEYS.loadTypeTemplate.list({
      page,
      size,
      direction: params.direction,
      includeInactive: params.includeInactive,
    }),
    queryFn: () =>
      fetchLoadTypeTemplates({
        page,
        size,
        direction: params.direction,
        includeInactive: params.includeInactive,
      }),
  });
}
