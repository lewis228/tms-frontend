import { cn } from "@/lib/utils";

// Per-page width constraint wrapper. Pages are free to skip this — the
// outer layout already guarantees a global minimum via
// `lib/layout-constants.ts > defaultMinWidth`. Use PageShell only when a
// specific page needs a WIDER floor (e.g. dense tables) or a ceiling (e.g.
// forms that look silly stretched across ultrawide displays).
//
// - `minWidth` widens the floor for this page. Narrower values than the
//   layout default are ignored because CSS stacks min-widths (outer floor
//   wins). Pass values >= LAYOUT.defaultMinWidth.
// - `maxWidth` caps horizontal expansion and auto-centers the block via
//   `margin-inline: auto`. Omit to keep the "fill available width" default.
// - `className` stacks with the layout styles — handy for padding / gap
//   tweaks per page without leaking into the shell.
export default function PageShell({
  children,
  minWidth,
  maxWidth,
  className,
}: {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}) {
  return (
    <div
      style={{
        minWidth: minWidth !== undefined ? `${minWidth}px` : undefined,
        maxWidth: maxWidth !== undefined ? `${maxWidth}px` : undefined,
        marginInline: maxWidth !== undefined ? "auto" : undefined,
      }}
      className={cn("w-full", className)}
    >
      {children}
    </div>
  );
}
