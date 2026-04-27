import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUser } from "@/api/user";
import { QUERY_KEYS } from "@/lib/constants";
import type { UserRole, UseMutationCallback } from "@/types";

type Vars = {
  teamId: number;
  payload: {
    email: string;
    name: string;
    password: string;
    role: UserRole;
    phone?: string | null;
  };
};

export function useCreateUser(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: Vars) =>
      createUser({ ...payload, teamId }, teamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
