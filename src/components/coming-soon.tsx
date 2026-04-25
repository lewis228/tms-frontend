import { Button } from "@/components/ui/button";
import { Bell, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Shared empty-state for features that are on the roadmap but not yet wired up.
// Keeps the sidebar link click from leading to a dead "page not found" feel —
// instead it lands on a deliberate "coming soon" placeholder that communicates
// the plan and captures interest. Plug new feature pages into this until the
// real UI ships.

export default function ComingSoon({
  icon,
  title,
  subtitle,
  description,
  eta,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  eta?: string;
  // Optional CTA — defaults to a "Notify me" ghost button. Pass null to hide.
  action?: ReactNode | null;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-black/[0.02] text-black/60">
        {icon}
      </div>

      <div className="flex max-w-lg flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black">{title}</h1>
        {subtitle && (
          <p className="text-sm font-medium text-black/60">{subtitle}</p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-black/50">
          {description}
        </p>
      </div>

      {eta && (
        <div className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-black/60">
          <Sparkles className="h-3.5 w-3.5 text-black/55" />
          <span>{eta}</span>
        </div>
      )}

      {action === undefined ? (
        <Button
          type="button"
          variant="outline"
          className="gap-2 rounded-xl border-black/10 px-4 py-2.5 text-sm text-black hover:bg-black/[0.02]"
        >
          <Bell className="h-4 w-4" />
          {t("comingSoon.notify")}
        </Button>
      ) : (
        action
      )}
    </div>
  );
}
