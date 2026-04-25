import { resolveNavMatch } from "@/lib/nav-config";

export { resolveFavoriteMeta } from "@/lib/nav-config";

// Kebab/snake → Title Case. Used as a last-resort label when a route isn't
// in the nav config (e.g. a detail page with an unmapped dynamic segment).
function humanize(segment: string): string {
  return segment
    .split(/[-_]/)
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Resolve the breadcrumb chain for the current URL. Primary source is the
 * shared `NAV_CONFIG` — if the route matches a known leaf, the crumbs are
 * `[section.label?, leaf.label]`. Detail pages (e.g. `/ocean/shipments/42`)
 * inherit from the parent leaf and append the humanised trailing segments.
 */
export function resolveBreadcrumb(pathname: string): string[] {
  const match = resolveNavMatch(pathname);

  const teamScoped = pathname.match(/^\/app\/\d+(.*)$/);
  const sub = teamScoped ? teamScoped[1] : "";

  if (match) {
    const base: string[] = [];
    if (match.section) base.push(match.section.label);
    base.push(match.leaf.label);

    // On detail pages, append the trailing path segments (ids, sub-resources)
    // so the Header crumb reflects where the user actually is.
    if (match.leaf.path && sub.startsWith(match.leaf.path + "/")) {
      const trailing = sub.slice(match.leaf.path.length + 1);
      const extras = trailing
        .split("/")
        .filter((s) => s.length > 0)
        .map(humanize);
      return [...base, ...extras];
    }
    return base;
  }

  // Completely unknown path — fall back to humanising every segment so the
  // Header is never blank.
  const segments = sub.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) return [];
  return segments.map(humanize);
}
