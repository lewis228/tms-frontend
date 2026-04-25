import { updateTenant } from "@/api/tenant";
import { QUERY_KEYS } from "@/lib/constants";
import type { TenantEntity, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTenant(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTenant,
    onSuccess: (updated: TenantEntity) => {
      // Patch the tenant-detail cache in place so the Settings page shows the
      // new values instantly without a round-trip. Tenant list views, if/when
      // they exist, should invalidate off of tenant.all.
      queryClient.setQueryData<TenantEntity>(
        QUERY_KEYS.tenant.byId(updated.id),
        updated,
      );
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
