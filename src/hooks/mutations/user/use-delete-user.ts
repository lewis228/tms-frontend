import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteUser } from "@/api/user";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { id: number; tenantId: number };

export function useDeleteUser(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tenantId }: Vars) => deleteUser(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
