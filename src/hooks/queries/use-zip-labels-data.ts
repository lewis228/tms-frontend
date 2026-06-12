import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { searchZipCodes } from "@/api/zip-code";
import { QUERY_KEYS } from "@/lib/constants";

// zip 코드 → "90731 · San Pedro" 라벨 맵. 매트릭스 축/리스트 변 라벨에 동네
// 이름을 병기한다. zip 마스터는 정적이므로 staleTime Infinity.
// 입력 zips 는 내부에서 중복 제거 + 정렬해 안정적인 queryKey 를 만든다.
export function useZipLabelsData(zips: string[]) {
  const unique = useMemo(() => Array.from(new Set(zips)).sort(), [zips]);
  const zipsKey = unique.join(",");

  return useQuery({
    queryKey: QUERY_KEYS.zipCode.labels(zipsKey),
    queryFn: async () => {
      const results = await Promise.all(unique.map((z) => searchZipCodes(z)));
      const labels = new Map<string, string>();
      unique.forEach((z, i) => {
        const exact = results[i].find((x) => x.zip === z);
        labels.set(z, exact ? `${z} · ${exact.city}` : z);
      });
      return labels;
    },
    enabled: unique.length > 0,
    staleTime: Infinity,
  });
}
