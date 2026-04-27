import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "@/api/user";
import { QUERY_KEYS } from "@/lib/constants";
import type { UserRole, UseMutationCallback } from "@/types";

type Vars = {
  id: number;
  teamId: number;
  payload: Partial<{
    name: string;
    phone: string | null;
    isActive: boolean;
    role: UserRole;
  }>;
};

export function useUpdateUser(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teamId, payload }: Vars) =>
      updateUser(id, payload, teamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
