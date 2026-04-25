import { deleteTenant } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTenant(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTenant,
    onSuccess: ({ tenant_id }) => {
      // Drop the tenant detail + members caches so the UI can't read stale
      // data while the user navigates away. The tenant switcher should
      // refetch its list via tenant.all invalidation.
      queryClient.removeQueries({ queryKey: QUERY_KEYS.tenant.byId(tenant_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenant.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tenantMember.all });
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
