import { fetchApiKeys } from "@/api/api-key";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useApiKeysData(teamId?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.apiKey.listByTeam(teamId ?? 0),
    queryFn: () => fetchApiKeys(teamId!),
    enabled: !!teamId,
  });
}
