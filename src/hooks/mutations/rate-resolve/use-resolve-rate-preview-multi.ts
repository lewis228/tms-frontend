import { useMutation } from "@tanstack/react-query";

import {
  resolveRatePreview,
  type RateResolvePreviewBody,
} from "@/api/rate-resolve";
import type { RateResolveResult, UseMutationCallback } from "@/types";

export type RateResolveMultiItem = {
  body: RateResolvePreviewBody;
  /** null = 해당 조합 호출 자체가 실패 (found:false 와 구분) */
  result: RateResolveResult | null;
};

// 조회성 POST 묶음 — 무브×서비스 전체 조합을 병렬 해석.
// 일부 조합 실패가 나머지 결과를 막지 않도록 allSettled 로 흡수하되,
// 전 건 실패는 '요율 없음' 으로 위장하지 않도록 에러로 승격해
// onError(토스트) 경로를 살린다. 부분 실패는 result=null 로 표에 전달.
export function useResolveRatePreviewMulti(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: async (
      bodies: RateResolvePreviewBody[]
    ): Promise<RateResolveMultiItem[]> => {
      const settled = await Promise.allSettled(bodies.map(resolveRatePreview));
      const rejected = settled.filter(
        (s): s is PromiseRejectedResult => s.status === "rejected"
      );
      if (settled.length > 0 && rejected.length === settled.length) {
        throw rejected[0].reason;
      }
      return bodies.map((body, i) => {
        const s = settled[i];
        return {
          body,
          result: s.status === "fulfilled" ? s.value : null,
        };
      });
    },
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (err) => callbacks?.onError?.(err),
  });
}
