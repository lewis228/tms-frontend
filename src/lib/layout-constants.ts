// Single source of truth for layout width constraints. Adjusting these
// values re-flows the entire app consistently.
//
// Architecture:
// - `defaultMinWidth` is applied automatically by TeamScopedLayout's main
//   column wrapper, so every page gets a floor without opting in.
// - Per-page overrides happen via `<PageShell minWidth={...} maxWidth={...}>`
//   (see components/layout/page-shell.tsx). The shell defines the outer
//   floor; PageShell can only widen the floor further (narrower minWidth
//   values lose to the outer `min-w-[defaultMinWidth]` because CSS takes
//   the max of stacked min-widths).
//
// Concept maps to Flutter's `ConstrainedBox(minWidth, maxWidth)` and the
// pattern used in `flutter_web/.../screen_layout_builder.dart`.
export const LAYOUT = {
  /** Applied to every page by the layout shell. Pages too narrow for this
   * trigger a horizontal scrollbar inside the main column instead of
   * squishing against the sidebars. */
  defaultMinWidth: 750,

  /** Use on data-table heavy pages (Shipments list, Members, etc.) where
   * dense columns need breathing room. */
  tableMinWidth: 1200,

  /** Dashboard-style pages with 3–4 KPI cards plus a timeline. */
  dashboardMinWidth: 1100,

  /** Settings / form pages — readable column instead of stretched inputs
   * on wide monitors. Pair with a maxWidth to center. */
  formMaxWidth: 900,

  /** Read-heavy content pages (detail views, docs). Keeps line length
   * comfortable on ultrawide. */
  contentMaxWidth: 1400,
} as const;
