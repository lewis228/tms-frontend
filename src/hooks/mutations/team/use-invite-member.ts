import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inviteMember } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

// 백엔드 InviteMemberRequestSchema 는 `{ user_id, permission_group_id? }` 를 받는다.
// 모달이 이메일을 입력받아 user_id 로 변환한 뒤 이 훅의 mutate 에 전달.
type InviteVars = {
  tenantId: number;
  userId: number;
  permissionGroupId?: number | null;
};

export function useInviteMember(callbacks?: UseMutationCallback) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: InviteVars) =>
      inviteMember(vars.tenantId, {
        userId: vars.userId,
        permissionGroupId: vars.permissionGroupId ?? null,
      }),
    onSuccess: () => {
      // 멤버 목록 / 사용자 목록 캐시 무효화 — Settings/Members 페이지가
      // listUsers 캐시(QUERY_KEYS.user.list) 를 사용하므로 같이 invalidate.
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tenant.all });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
