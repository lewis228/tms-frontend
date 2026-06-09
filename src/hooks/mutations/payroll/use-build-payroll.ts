import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buildPayroll } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";
import type { PayrollDetailEntity, UseMutationCallback } from "@/types";

type Callbacks = Omit<UseMutationCallback, "onSuccess"> & {
  onSuccess?: (data: PayrollDetailEntity) => void;
};

export function useBuildPayroll(callbacks?: Callbacks) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: buildPayroll,
    onSuccess: (data) => {
      qc.resetQueries({ queryKey: QUERY_KEYS.payroll.all });
      callbacks?.onSuccess?.(data);
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
