import { Link } from "react-router-dom";

export default function KpiCard({
  label,
  value,
  hint,
  to,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  to?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50/50"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/50"
        : "";

  const inner = (
    <div
      className={
        "flex flex-col gap-1 rounded-md border bg-background p-4 transition-colors " +
        toneClass +
        (to ? " hover:bg-accent/40" : "")
      }
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="contents">
        {inner}
      </Link>
    );
  }
  return inner;
}
