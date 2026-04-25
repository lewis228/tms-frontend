import { fetchTags } from "@/api/tag";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

// `teamId` is passed for cache partitioning only — the actual request is
// team-scoped via the X-Team-Id header that the axios layer attaches. We
// gate with `enabled` so a logged-in user who hasn't picked a team yet
// doesn't fire a request the server would reject.
//
// Accepts `null` too because `useTeamScope()` returns `number | null` while
// `useParams().teamId` is `string | undefined` — callers shouldn't have to
// coalesce at every site. Normalise both to "not ready" via `!= null`.
export function useTeamTagsData(teamId: number | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.tag.listByTeam(teamId ?? 0),
    queryFn: fetchTags,
    enabled: teamId != null,
  });
}
