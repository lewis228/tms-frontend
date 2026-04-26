import { useMutation } from "@tanstack/react-query";

import { extractDeliveryOrderFromFile } from "@/api/ai-intake";
import type { UseMutationCallback } from "@/types";

export function useExtractDeliveryOrderFromFile(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: (file: File) => extractDeliveryOrderFromFile(file),
    onSuccess: () => callbacks?.onSuccess?.(),
    onError: (err) => callbacks?.onError?.(err),
  });
}
