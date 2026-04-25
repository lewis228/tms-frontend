import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createDriver } from "@/api/driver";
import { QUERY_KEYS } from "@/lib/constants";
import type { DriverCreatedResponse, UseMutationCallback } from "@/types";

// CreatedResponse 가 tempPassword 를 포함하므로 callback.onSuccess 에서 별도 인자 받음.
type Callbacks = Omit<UseMutationCallback, "onSuccess"> & {
  onSuccess?: (created: DriverCreatedResponse) => void;
};

export function useCreateDriver(callbacks?: Callbacks) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDriver,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.driver.all });
      callbacks?.onSuccess?.(data);
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
