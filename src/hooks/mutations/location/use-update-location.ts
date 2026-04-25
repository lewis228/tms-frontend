import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateLocation } from "@/api/location";
import { QUERY_KEYS } from "@/lib/constants";
import type { LocationKind, UseMutationCallback } from "@/types";

type Vars = {
  id: string;
  payload: Partial<{
    name: string;
    kind: LocationKind;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    customerId: string | null;
    isActive: boolean;
    note: string | null;
  }>;
};

export function useUpdateLocation(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: Vars) => updateLocation(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.location.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
