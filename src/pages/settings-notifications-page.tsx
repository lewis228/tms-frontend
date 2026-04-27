import { Bell, ChevronRight, Mail, MessageSquare, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/store/auth";
import { cn } from "@/lib/utils";

export default function SettingsNotificationsPage() {
  const user = useCurrentUser();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.notifications.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("settings.notifications.description")}
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white">
        <SectionHeader label={t("settings.notifications.sectionEmail")} />
        <EventNotifyRow enabled={user?.eventNotificationEnabled ?? true} />
        <ComingSoonSwitchRow
          icon={<Mail className="h-3.5 w-3.5" />}
          label={t("settings.notifications.digestLabel")}
          description={t("settings.notifications.digestDescription")}
        />

        <div className="border-t border-black/5" />

        <SectionHeader label={t("settings.notifications.sectionInApp")} />
        <ComingSoonSwitchRow
          icon={<Bell className="h-3.5 w-3.5" />}
          label={t("settings.notifications.pushLabel")}
          description={t("settings.notifications.pushDescription")}
        />

        <div className="border-t border-black/5" />

        <SectionHeader label={t("settings.notifications.sectionExternal")} />
        <ComingSoonLinkRow
          icon={<MessageSquare className="h-3.5 w-3.5" />}
          label={t("settings.notifications.slackLabel")}
          description={t("settings.notifications.slackDescription")}
          value={t("settings.notifications.slackValue")}
        />
        <ComingSoonLinkRow
          icon={<Radio className="h-3.5 w-3.5" />}
          label={t("settings.notifications.webhookLabel")}
          description={t("settings.notifications.webhookDescription")}
          value={t("settings.notifications.webhookValue")}
        />
      </section>
    </div>
  );
}

function EventNotifyRow({ enabled }: { enabled: boolean }) {
  const { t } = useTranslation();
  // TODO(TMS): wire to PATCH /users/me when notification preferences endpoint
  // is finalised. For now display-only.
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-black/55" />
          <span className="text-sm text-black">
            {t("settings.notifications.eventEmailLabel")}
          </span>
        </div>
        <p className="text-xs text-black/55">
          {t("settings.notifications.eventEmailDescription")}
        </p>
      </div>
      <Switch checked={enabled} disabled />
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-6 pb-2 pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-black/55">
        {label}
      </h3>
    </div>
  );
}

function ComingSoonSwitchRow({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-black/55">{icon}</span>
          <span className="text-sm text-black">{label}</span>
          <SoonBadge />
        </div>
        <p className="text-xs text-black/55">{description}</p>
      </div>
      <Switch checked={false} disabled />
    </div>
  );
}

function ComingSoonLinkRow({
  icon,
  label,
  description,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-black/55">{icon}</span>
          <span className="text-sm text-black">{label}</span>
          <SoonBadge />
        </div>
        <p className="text-xs text-black/55">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-sm text-black/55">{value}</span>
        <ChevronRight className="h-3.5 w-3.5 text-black/20" />
      </div>
    </div>
  );
}

function SoonBadge() {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-black/55",
      )}
    >
      {t("common.soon")}
    </span>
  );
}
