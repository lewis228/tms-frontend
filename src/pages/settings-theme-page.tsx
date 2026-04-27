import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ThemeMode = "system" | "light" | "dark";

const ACCENT_COLORS = [
  "#a78bfa",
  "#eab308",
  "#ef4444",
  "#3b82f6",
  "#f97316",
  "#22c55e",
] as const;

export default function SettingsThemePage() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [fontSize, setFontSize] = useState(2);
  const [accent, setAccent] = useState<string>(ACCENT_COLORS[0]);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.theme.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("settings.theme.description")}
        </p>
      </div>

      <section className="flex max-w-3xl flex-col gap-6 rounded-2xl border border-black/10 bg-white p-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-black">
            {t("settings.theme.modeLabel")}
          </h3>
          <div className="flex gap-4">
            {(["system", "light", "dark"] as const).map((m) => (
              <ThemePreview
                key={m}
                mode={m}
                isSelected={theme === m}
                onSelect={() => setTheme(m)}
              />
            ))}
          </div>
        </div>

        <Separator className="bg-black/10" />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-black">
            {t("settings.theme.fontSizeLabel")}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-black/55">Aa</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFontSize(i)}
                aria-label={t("settings.theme.fontSizeAria", { index: i + 1 })}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-colors",
                  fontSize === i
                    ? "border-black bg-black"
                    : "border-black/20 hover:border-black/40",
                )}
              />
            ))}
            <span className="text-base font-medium text-black">Aa</span>
          </div>
        </div>

        <Separator className="bg-black/10" />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-black">
            {t("settings.theme.accentLabel")}
          </h3>
          <div className="flex gap-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                aria-label={t("settings.theme.accentAria", { color: c })}
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
              >
                {accent === c && (
                  <svg
                    className="h-4 w-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-3xl rounded-xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-3 text-xs text-black/50">
        {t("settings.theme.footerNote")}
      </div>
    </div>
  );
}

function ThemePreview({
  mode,
  isSelected,
  onSelect,
}: {
  mode: ThemeMode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const isDark = mode === "dark";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-colors",
        isSelected ? "border-black" : "border-transparent hover:border-black/10",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-16 overflow-hidden rounded-lg border border-black/10",
          isDark ? "bg-black" : "bg-white",
        )}
      >
        <div
          className={cn("h-full w-4", isDark ? "bg-gray-800" : "bg-black")}
        />
        <div className="flex-1 p-1">
          <div
            className={cn(
              "mb-1 h-1 w-full rounded",
              isDark ? "bg-gray-600" : "bg-black/10",
            )}
          />
          <div
            className={cn(
              "h-1 w-3/4 rounded",
              isDark ? "bg-gray-600" : "bg-black/10",
            )}
          />
        </div>
      </div>
      <span className="text-xs capitalize text-black/60">
        {t(`settings.theme.mode.${mode}`)}
      </span>
    </button>
  );
}
