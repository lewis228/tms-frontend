import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCustomer } from "@/api/customer";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  payload: Partial<{
    name: string;
    code: string | null;
    billingAddress: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isActive: boolean;
    note: string | null;
  }>;
};

export function useUpdateCustomer(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateCustomer(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customer.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
