import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MoreHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Plugin = {
  key: "slack" | "googleSheets" | "figma" | "zapier" | "webhooks";
  displayName: string;
  icon: string | null;
  enabled: boolean;
};

const INITIAL_PLUGINS: Plugin[] = [
  { key: "slack", displayName: "Slack", icon: null, enabled: false },
  { key: "googleSheets", displayName: "Google Sheets", icon: null, enabled: true },
  {
    key: "figma",
    displayName: "Figma",
    icon: "/icons/figma-logo.svg",
    enabled: false,
  },
  { key: "zapier", displayName: "Zapier", icon: null, enabled: false },
  { key: "webhooks", displayName: "Webhooks", icon: null, enabled: true },
];

export default function SettingsPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);
  const { t } = useTranslation();

  const togglePlugin = (idx: number) => {
    setPlugins((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, enabled: !p.enabled } : p)),
    );
  };

  const activeCount = plugins.filter((p) => p.enabled).length;

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.plugins.title")}{" "}
          <span className="text-base font-normal text-black/55">
            ·{" "}
            {t("settings.plugins.active", {
              active: activeCount,
              total: plugins.length,
            })}
          </span>
        </h1>
        <p className="text-sm text-black/55">
          {t("settings.plugins.description")}
        </p>
      </div>

      <section className="max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white">
        {plugins.map((plugin, idx) => (
          <PluginRow
            key={plugin.key}
            plugin={plugin}
            isLast={idx === plugins.length - 1}
            onToggle={() => togglePlugin(idx)}
          />
        ))}
      </section>

      <div className="max-w-3xl rounded-xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-3 text-xs text-black/50">
        {t("settings.plugins.footerNote")}
      </div>
    </div>
  );
}

function PluginRow({
  plugin,
  isLast,
  onToggle,
}: {
  plugin: Plugin;
  isLast: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={
        "flex items-center gap-3 px-6 py-4 transition-colors hover:bg-black/[0.02]" +
        (isLast ? "" : " border-b border-black/5")
      }
    >
      <PluginIcon plugin={plugin} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-black">
          {t(`settings.plugins.items.${plugin.key}.name`)}
        </p>
        <p className="truncate text-xs text-black/55">
          {t(`settings.plugins.items.${plugin.key}.description`)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md p-1 text-black/20 transition-colors hover:bg-black/[0.04] hover:text-black"
          aria-label={t("settings.plugins.moreOptions")}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <Switch checked={plugin.enabled} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}

function PluginIcon({ plugin }: { plugin: Plugin }) {
  if (plugin.icon) {
    return (
      <img
        src={plugin.icon}
        alt={plugin.displayName}
        className="h-9 w-9 shrink-0 rounded-lg border border-black/10 bg-white object-contain p-1.5"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
      {plugin.displayName.charAt(0).toUpperCase()}
    </div>
  );
}
