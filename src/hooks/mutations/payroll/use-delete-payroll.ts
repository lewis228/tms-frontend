import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePayroll } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useDeletePayroll(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePayroll(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payroll.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
