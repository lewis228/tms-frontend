import { useMutation, useQueryClient } from "@tanstack/react-query";

import { importRateGroupEntriesCsv } from "@/api/rate-group";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";

export function useImportRateGroupEntries(
  groupId: number,
  callbacks?: UseMutationCallback,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { csv: string; dryRun?: boolean }) =>
      importRateGroupEntriesCsv(groupId, vars.csv, vars.dryRun ?? false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.rateGroup.entries(groupId) });
      callbacks?.onSuccess?.();
    },
    onError: (err) => callbacks?.onError?.(err),
  });
}
