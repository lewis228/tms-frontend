import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

type CookieKey = "functional" | "analytics" | "marketing";
type CookieState = Record<CookieKey, boolean>;
const INITIAL_COOKIES: CookieState = {
  functional: true,
  analytics: true,
  marketing: false,
};

export default function SettingsPrivacyPage() {
  const [cookies, setCookies] = useState<CookieState>(INITIAL_COOKIES);
  const { t } = useTranslation();

  const toggleCookie = (key: CookieKey) => {
    setCookies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.privacy.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("settings.privacy.description")}
        </p>
      </div>

      <section className="max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white">
        <CookieSettingsRow cookies={cookies} onToggle={toggleCookie} />
        <div className="border-t border-black/5" />
        <PrivacyRow
          label={t("settings.privacy.history.title")}
          description={t("settings.privacy.history.description")}
          value={t("settings.privacy.history.value")}
        />
        <div className="border-t border-black/5" />
        <PrivacyRow
          label={t("settings.privacy.export.title")}
          description={t("settings.privacy.export.description")}
          value={t("settings.privacy.export.value")}
        />
        <div className="border-t border-black/5" />
        <PrivacyRow
          label={t("settings.privacy.deleteWorkspace.title")}
          description={t("settings.privacy.deleteWorkspace.description")}
          value={t("settings.privacy.deleteWorkspace.value")}
          destructive
        />
      </section>

      <div className="max-w-3xl rounded-xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-3 text-xs text-black/50">
        {t("settings.privacy.footerNote")}
      </div>
    </div>
  );
}

function CookieSettingsRow({
  cookies,
  onToggle,
}: {
  cookies: CookieState;
  onToggle: (key: CookieKey) => void;
}) {
  const { t } = useTranslation();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-black/[0.02]"
        >
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-black">
              {t("settings.privacy.cookie.title")}
            </span>
            <span className="text-xs text-black/55">
              {t("settings.privacy.cookie.description")}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-sm text-black/60">
              {t("settings.privacy.cookie.customize")}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-black/20" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="right" sideOffset={16} className="w-80">
        <div className="flex flex-col gap-4">
          <CookieToggleRow
            title={t("settings.privacy.cookie.strictTitle")}
            description={t("settings.privacy.cookie.strictDescription")}
            checked
            disabled
          />
          <CookieToggleRow
            title={t("settings.privacy.cookie.functionalTitle")}
            description={t("settings.privacy.cookie.functionalDescription")}
            checked={cookies.functional}
            onCheckedChange={() => onToggle("functional")}
          />
          <CookieToggleRow
            title={t("settings.privacy.cookie.analyticsTitle")}
            description={t("settings.privacy.cookie.analyticsDescription")}
            checked={cookies.analytics}
            onCheckedChange={() => onToggle("analytics")}
          />
          <CookieToggleRow
            title={t("settings.privacy.cookie.marketingTitle")}
            description={t("settings.privacy.cookie.marketingDescription")}
            checked={cookies.marketing}
            onCheckedChange={() => onToggle("marketing")}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CookieToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold text-black">{title}</span>
        <span className="text-xs leading-4 text-black/55">{description}</span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

function PrivacyRow({
  label,
  description,
  value,
  destructive,
}: {
  label: string;
  description: string;
  value: string;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-black/[0.02]"
    >
      <div className="flex min-w-0 flex-col">
        <span
          className={
            destructive
              ? "text-sm font-semibold text-red-500"
              : "text-sm font-semibold text-black"
          }
        >
          {label}
        </span>
        <span className="text-xs text-black/55">{description}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-sm text-black/60">{value}</span>
        <ChevronRight className="h-3.5 w-3.5 text-black/20" />
      </div>
    </button>
  );
}
