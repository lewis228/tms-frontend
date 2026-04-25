import { createCustomer } from "@/api/customer";
import { QUERY_KEYS } from "@/lib/constants";
import type { CustomerEntity } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Quick Entry needs the newly created customer echoed back so the picker can
// auto-select it on enter-to-create — parameterless UseMutationCallback won't
// cut it. Mirrors useCreateTag.
type Callbacks = {
  onSuccess?: (created: CustomerEntity) => void;
  onError?: (error: Error) => void;
};

export function useCreateCustomer(callbacks?: Callbacks) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: (created) => {
      // `all` covers every team bucket — cheap because the customer list is
      // small and creation is rare.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customer.all });
      if (callbacks?.onSuccess) callbacks.onSuccess(created);
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
