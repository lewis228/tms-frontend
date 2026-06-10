import { useQuery } from "@tanstack/react-query";

import { fetchAddons } from "@/api/addon";
import { QUERY_KEYS } from "@/lib/constants";
import type { AddonCategory } from "@/types";

export function useAddonsData(
  page = 1,
  size = 100,
  category?: AddonCategory,
) {
  return useQuery({
    queryKey: QUERY_KEYS.addon.list({ page, size, category }),
    queryFn: () => fetchAddons({ page, size, category }),
  });
}
