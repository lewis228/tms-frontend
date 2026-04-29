// v3 컨테이너 list (Dispatch Workspace 컨테이너 단위 뷰의 메인 데이터 소스)
import { useQuery } from "@tanstack/react-query";

import { fetchContainersV3 } from "@/api/container-v3";
import { QUERY_KEYS, PAGE_SIZE } from "@/lib/constants";
import type { ContainerWorkState } from "@/types";

export function useContainersV3Data(params: {
  page?: number;
  size?: number;
  deliveryOrderId?: number;
  workState?: ContainerWorkState;
  containerNumber?: string;
} = {}) {
  const { page = 1, size = PAGE_SIZE } = params;
  return useQuery({
    queryKey: QUERY_KEYS.containerV3.list({ ...params, page, size }),
    queryFn: () => fetchContainersV3({ ...params, page, size }),
  });
}
