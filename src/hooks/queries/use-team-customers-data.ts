import { fetchCustomers } from "@/api/customer";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

// `teamId` is passed for cache partitioning only — the actual request is
// team-scoped via the X-Team-Id header that the axios layer attaches. We
// gate with `enabled` so a logged-in user who hasn't picked a team yet
// doesn't fire a request the server would reject.
export function useTeamCustomersData(teamId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.customer.listByTeam(teamId ?? 0),
    queryFn: fetchCustomers,
    enabled: teamId != null,
  });
}
