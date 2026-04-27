import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateOnboarding, type OnboardingPatch } from "@/api/team";
import { fetchMe } from "@/api/user";
import { setUser } from "@/store/auth";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

type Vars = { teamId: number; payload: OnboardingPatch };

export function useUpdateOnboarding(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }: Vars) =>
      updateOnboarding(teamId, payload),
    onSuccess: async () => {
      // 응답 자체는 ok 만 — 새 user.teams[].onboarding* 플래그 동기화 위해 me 재조회.
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        // 무시 — 다음 navigation 에서 다시 갱신.
      }
      qc.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
