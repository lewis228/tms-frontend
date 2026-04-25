import {
  useGridColumnConfig,
  type GridColumnDefinition,
} from "@/store/grid-column-config";

// Resolves the ordered + visible column list for a grid instance.
//
// Fixed columns are always included. Reorderable columns are slotted in the
// user-chosen order between the "fixed-before" and "fixed-after" slices
// (so a grid can place a fixed column at the very start AND a fixed one at
// the very end of its definition list and keep both positions stable).
//
// Fallback when the store slot hasn't hydrated yet: return the raw
// definition order filtered by `defaultVisible`. The companion
// `ColumnSettingsButton` primes the slot via `ensureDomain` on mount, so
// this branch is only hit on the very first render after a cold load.
export function useResolvedColumns(
  domainKey: string,
  definitions: GridColumnDefinition[],
): GridColumnDefinition[] {
  const config = useGridColumnConfig(domainKey);
  if (!config) {
    return definitions.filter(
      (d) => d.fixed || (d.defaultVisible ?? true),
    );
  }

  const firstReorderableIndex = definitions.findIndex((d) => !d.fixed);
  const fixedBefore = definitions
    .slice(
      0,
      firstReorderableIndex === -1 ? definitions.length : firstReorderableIndex,
    )
    .filter((d) => d.fixed);
  const fixedAfter =
    firstReorderableIndex === -1
      ? []
      : definitions.slice(firstReorderableIndex).filter((d) => d.fixed);

  const reorderableVisible = config.order
    .map((key) => definitions.find((d) => d.key === key && !d.fixed))
    .filter((d): d is GridColumnDefinition => d !== undefined)
    .filter((d) => config.visible[d.key] ?? true);

  return [...fixedBefore, ...reorderableVisible, ...fixedAfter];
}
