import { useMutation } from "@tanstack/react-query";

import { resolveRatePreview } from "@/api/rate-resolve";
import type { UseMutationCallback } from "@/types";

// 조회성 POST — 캐시 무효화 없음. 결과는 mutation.data 로 소비한다.
export function useResolveRatePreview(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: resolveRatePreview,
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (err) => callbacks?.onError?.(err),
  });
}
