// Resolve the breadcrumb chain + "favorite this page" metadata from the
// shared NAV_CONFIG. Header relies on this so the breadcrumb always stays
// in sync with the sidebar.
import {
  resolveNavMatch,
  resolveFavoriteMeta as resolveNavFavoriteMeta,
  relativizeAppPath,
  type NavIconName,
} from "@/lib/nav-config";

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
 * `[section.label?, leaf.label]`. Detail pages inherit from the parent
 * leaf and append the humanised trailing segments.
 */
export function resolveBreadcrumb(pathname: string): string[] {
  const sub = relativizeAppPath(pathname) ?? "";
  const match = resolveNavMatch(sub);

  if (match) {
    const base: string[] = [];
    if (match.section) base.push(match.section.label);
    base.push(match.leaf.label);

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

  const segments = sub.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) return [];
  return segments.map(humanize);
}

/**
 * Look up the favorite metadata (title + iconName) for a given absolute
 * pathname. Header uses this when toggling the star button.
 */
export function resolveFavoriteMeta(
  pathname: string,
): { title: string; iconName: NavIconName } | null {
  const sub = relativizeAppPath(pathname) ?? "";
  const meta = resolveNavFavoriteMeta(sub);
  if (!meta) return null;
  return { title: meta.label, iconName: meta.iconName };
}
