import { useMutation, useQueryClient } from "@tanstack/react-query";

import { voidPayroll } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useVoidPayroll(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => voidPayroll(id),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.payroll.byId(data.id), data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payroll.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
