import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buildPeriodPayroll } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";
import type { PayrollBuildPeriodResult, UseMutationCallback } from "@/types";

type Callbacks = Omit<UseMutationCallback, "onSuccess"> & {
  onSuccess?: (data: PayrollBuildPeriodResult) => void;
};

export function useBuildPeriodPayroll(callbacks?: Callbacks) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: buildPeriodPayroll,
    onSuccess: (data) => {
      qc.resetQueries({ queryKey: QUERY_KEYS.payroll.all });
      callbacks?.onSuccess?.(data);
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
