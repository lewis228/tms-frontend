import { useQuery } from "@tanstack/react-query";

import { fetchSettlementAuditLogs } from "@/api/settlement";
import { QUERY_KEYS } from "@/lib/constants";

export function useSettlementAuditLogsData(id: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.settlement.auditLogs(id ?? -1),
    queryFn: () => fetchSettlementAuditLogs(id!),
    enabled: !!id,
  });
}
