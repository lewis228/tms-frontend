import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addPayrollCharge, type PayrollChargeAddPayload } from "@/api/payroll";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: PayrollChargeAddPayload;
};

export function useAddPayrollCharge(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => addPayrollCharge(id, payload),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.payroll.byId(data.id), data);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.payroll.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
