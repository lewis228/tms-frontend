import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dashboard-level preferences — alert thresholds, default filters, and
// notification channels. Purely local state for now; when the backend
// adds a team-scoped preferences resource, lift these into
// `useDashboardPreferencesData` + `useUpdateDashboardPreferences`.
export default function DashboardSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const teamId = params.teamId;

  const [demurrageWarn, setDemurrageWarn] = useState(3);
  const [perDiemWarn, setPerDiemWarn] = useState(2);
  const [defaultRange, setDefaultRange] = useState<
    "7d" | "30d" | "90d" | "all"
  >("30d");
  const [channels, setChannels] = useState({
    email: true,
    slack: false,
    inApp: true,
  });
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );

  const handleSave = () => {
    toast.success(t("pages.dashboardSettings.saved"), {
      position: "top-center",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("pages.dashboardSettings.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("pages.dashboardSettings.subtitle")}
        </p>
      </div>

      <DashboardTabs
        onTrackClick={() => navigate(`/app/${teamId}/ocean/track`)}
      />

      <div className="flex flex-col gap-4">
        {/* Alert thresholds */}
        <SettingsCard
          title={t("pages.dashboardSettings.alertThresholds.title")}
          description={t(
            "pages.dashboardSettings.alertThresholds.description",
          )}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <NumberField
              label={t(
                "pages.dashboardSettings.alertThresholds.demurrage.label",
              )}
              hint={t(
                "pages.dashboardSettings.alertThresholds.demurrage.hint",
              )}
              value={demurrageWarn}
              onChange={setDemurrageWarn}
              unit={t(
                "pages.dashboardSettings.alertThresholds.daysUnit",
              )}
            />
            <NumberField
              label={t(
                "pages.dashboardSettings.alertThresholds.perDiem.label",
              )}
              hint={t(
                "pages.dashboardSettings.alertThresholds.perDiem.hint",
              )}
              value={perDiemWarn}
              onChange={setPerDiemWarn}
              unit={t(
                "pages.dashboardSettings.alertThresholds.daysUnit",
              )}
            />
          </div>
        </SettingsCard>

        {/* Default filters */}
        <SettingsCard
          title={t("pages.dashboardSettings.defaultRange.title")}
          description={t(
            "pages.dashboardSettings.defaultRange.description",
          )}
        >
          <div className="flex flex-wrap gap-2">
            {(["7d", "30d", "90d", "all"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDefaultRange(r)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  defaultRange === r
                    ? "bg-black text-white"
                    : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08] hover:text-black",
                )}
              >
                {t(`pages.dashboardSettings.defaultRange.options.${r}`)}
              </button>
            ))}
          </div>
        </SettingsCard>

        {/* Notification channels */}
        <SettingsCard
          title={t("pages.dashboardSettings.channels.title")}
          description={t("pages.dashboardSettings.channels.description")}
        >
          <div className="flex flex-col divide-y divide-black/[0.06]">
            <ChannelRow
              label={t("pages.dashboardSettings.channels.email.label")}
              hint={t("pages.dashboardSettings.channels.email.hint")}
              checked={channels.email}
              onChange={(v) =>
                setChannels((prev) => ({ ...prev, email: v }))
              }
            />
            <ChannelRow
              label={t("pages.dashboardSettings.channels.slack.label")}
              hint={t("pages.dashboardSettings.channels.slack.hint")}
              checked={channels.slack}
              onChange={(v) =>
                setChannels((prev) => ({ ...prev, slack: v }))
              }
            />
            <ChannelRow
              label={t("pages.dashboardSettings.channels.inApp.label")}
              hint={t("pages.dashboardSettings.channels.inApp.hint")}
              checked={channels.inApp}
              onChange={(v) =>
                setChannels((prev) => ({ ...prev, inApp: v }))
              }
            />
          </div>
        </SettingsCard>

        {/* Density */}
        <SettingsCard
          title={t("pages.dashboardSettings.density.title")}
          description={t("pages.dashboardSettings.density.description")}
        >
          <div className="flex flex-wrap gap-2">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDensity(d)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  density === d
                    ? "bg-black text-white"
                    : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08] hover:text-black",
                )}
              >
                {t(`pages.dashboardSettings.density.options.${d}`)}
              </button>
            ))}
          </div>
        </SettingsCard>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-black px-5 text-sm text-white hover:bg-black/80"
          >
            {t("pages.dashboardSettings.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
      <header className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        <p className="text-xs text-black/55">{description}</p>
      </header>
      {children}
    </section>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  unit,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-black">{label}</span>
      <span className="text-[11px] text-black/55">{hint}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={30}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-9 w-20 rounded-lg border border-black/10 bg-white px-3 text-sm text-black focus:border-black/30 focus:outline-none"
        />
        <span className="text-xs text-black/55">{unit}</span>
      </div>
    </label>
  );
}

function ChannelRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer rounded border-black/30"
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-black">{label}</span>
        <span className="text-xs text-black/55">{hint}</span>
      </div>
    </label>
  );
}
