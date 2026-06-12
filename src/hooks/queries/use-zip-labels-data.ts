import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { searchZipCodes } from "@/api/zip-code";
import { QUERY_KEYS } from "@/lib/constants";

// zip 코드 → "90731 · San Pedro" 라벨 맵. 매트릭스 축/리스트 변 라벨에 동네
// 이름을 병기한다. zip 마스터는 정적이므로 staleTime Infinity.
// 입력 zips 는 내부에서 중복 제거 + 정렬해 안정적인 queryKey 를 만든다.
//
// 요청 수 절감: 백엔드 /zip-codes 는 일괄(batch) 조회가 없고 zip LIKE "{q}%"
// 접두사 검색만 지원한다. zip 1개당 1요청 대신 앞 4자리 접두사 단위로 묶어
// 요청한다 — 4자리 접두사를 공유하는 5자리 zip 은 최대 10개라 기본 limit(20)
// 안에 전부 들어와 누락이 없다. 같은 도시의 zip 은 접두사를 크게 공유하므로
// 존 멤버 100개급(by-city 확장)도 요청 수가 한 자릿수~십수 건으로 준다.
export function useZipLabelsData(zips: string[]) {
  const unique = useMemo(() => Array.from(new Set(zips)).sort(), [zips]);
  const zipsKey = unique.join(",");

  return useQuery({
    queryKey: QUERY_KEYS.zipCode.labels(zipsKey),
    queryFn: async () => {
      const prefixes = Array.from(
        new Set(unique.map((z) => (z.length > 4 ? z.slice(0, 4) : z)))
      );
      const results = await Promise.all(prefixes.map((p) => searchZipCodes(p)));
      const cityByZip = new Map(results.flat().map((x) => [x.zip, x.city]));
      const labels = new Map<string, string>();
      unique.forEach((z) => {
        const city = cityByZip.get(z);
        labels.set(z, city ? `${z} · ${city}` : z);
      });
      return labels;
    },
    enabled: unique.length > 0,
    staleTime: Infinity,
  });
}
