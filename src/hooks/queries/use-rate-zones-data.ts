import { useQuery } from "@tanstack/react-query";

import { fetchRateZones } from "@/api/rate-zone";
import { QUERY_KEYS } from "@/lib/constants";

// 존 마스터는 소규모 가정 — rate-lookup 존 이름 맵과 존 목록(매트릭스 축
// 라벨/칩 포함)이 한 페이지 응답에 의존한다. 백엔드 커서 페이지네이션은
// take 만 인식하고(page/size 무시) 상한 검증이 없으므로, 100개 초과 시
// zoneById/zoneName 이 조용히 누락되던 한도를 500 으로 키운다.
// 꽉 차면(=잘림 가능) 콘솔 경고로 조용한 라벨 붕괴를 노출한다.
const TAKE = 500;

export function useRateZonesData(page: number = 1) {
  return useQuery({
    queryKey: QUERY_KEYS.rateZone.list({ page, size: TAKE }),
    queryFn: async () => {
      const data = await fetchRateZones({ page, size: TAKE });
      if (data.items.length >= TAKE) {
        console.warn(
          `useRateZonesData: zone count reached take=${TAKE} — labels may be truncated`
        );
      }
      return data;
    },
  });
}
