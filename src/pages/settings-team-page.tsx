// Settings > Team — multi-section configuration page. Mirrors ste's
// settings-team-page layout (Team info / Display preferences / Danger
// zone) but wired to TMS's team API + auth store.
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Check, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteTeam,
  fetchTeam,
  updateTeam,
  type TeamWritePayload,
} from "@/api/team";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useTeamPreferences,
  useSetTeamPreferences,
  type CurrencyCode,
  type DateFormat,
  type DecimalPlaces,
  type TimeFormat,
  type UnitSystem,
} from "@/store/team-preferences";
import { QUERY_KEYS } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import type { TeamEntity } from "@/types";

export default function SettingsTeamPage() {
  const params = useParams();
  const teamId = params.teamId ? Number(params.teamId) : undefined;
  const { t } = useTranslation();

  const {
    data: team,
    error,
    isPending,
  } = useQuery({
    queryKey: teamId ? QUERY_KEYS.team.byId(teamId) : QUERY_KEYS.team.all,
    queryFn: () => fetchTeam(teamId!),
    enabled: typeof teamId === "number" && Number.isFinite(teamId),
  });

  if (error) {
    return <div className="p-7 text-sm text-red-500">{generateErrorMessage(error)}</div>;
  }
  if (isPending) {
    return <div className="p-7 text-sm text-black/55">{t("common.loading")}</div>;
  }
  if (!team) {
    return <div className="p-7 text-sm text-black/55">{t("common.noData")}</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.team.title")}
        </h1>
        <p className="text-sm text-black/55">{t("settings.team.description")}</p>
      </div>

      <TeamInfoSection team={team} />
      <DisplaySettingsSection />
      <DangerZoneSection team={team} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section shell
// ---------------------------------------------------------------------------
function Section({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-black/10 bg-white p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-black">{title}</h2>
        {description && <p className="text-xs text-black/55">{description}</p>}
      </div>
      {children}
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-black/5 pt-4">
          {footer}
        </div>
      )}
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-medium text-black/60">{label}</label>
      {children}
      {hint && <p className="text-[11px] leading-4 text-black/55">{hint}</p>}
    </div>
  );
}

function SaveButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-medium text-white hover:bg-black/80 disabled:opacity-40"
    >
      <Check className="h-3.5 w-3.5" />
      {label ?? t("common.save")}
    </Button>
  );
}

function CancelButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-3 py-2 text-xs text-black/60 hover:bg-black/[0.04] hover:text-black"
    >
      {t("common.cancel")}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Team info — wired to PATCH /teams/:id
// ---------------------------------------------------------------------------
function TeamInfoSection({ team }: { team: TeamEntity }) {
  // Re-mount when team.id changes so the form state resets to fresh defaults
  // instead of carrying old draft values across team switches.
  return <TeamInfoSectionInner key={team.id} team={team} />;
}

function TeamInfoSectionInner({ team }: { team: TeamEntity }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [name, setName] = useState(team.name);
  const [memo, setMemo] = useState(team.memo ?? "");
  const [timezone, setTimezone] = useState(team.timezone ?? "Asia/Seoul");

  const { mutate: update, isPending: isUpdatePending } = useMutation({
    mutationFn: (payload: Partial<TeamWritePayload & { isActive: boolean }>) =>
      updateTeam(team.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.team.all });
      toast.success(t("toast.saved"), { position: "top-center" });
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const isDirty =
    name.trim() !== team.name ||
    (memo.trim() === "" ? null : memo.trim()) !== (team.memo ?? null) ||
    timezone !== (team.timezone ?? "Asia/Seoul");

  const handleCancel = () => {
    setName(team.name);
    setMemo(team.memo ?? "");
    setTimezone(team.timezone ?? "Asia/Seoul");
  };

  const handleSave = () => {
    if (name.trim() === "") {
      toast.error(t("settings.team.info.nameRequired"), {
        position: "top-center",
      });
      return;
    }
    const payload: Partial<TeamWritePayload> = {};
    if (name.trim() !== team.name) payload.name = name.trim();
    const nextMemo = memo.trim() === "" ? null : memo.trim();
    if (nextMemo !== (team.memo ?? null)) payload.memo = nextMemo;
    if (timezone !== (team.timezone ?? "Asia/Seoul")) {
      payload.timezone = timezone;
    }
    if (Object.keys(payload).length === 0) {
      toast.info(t("common.noData"), { position: "top-center" });
      return;
    }
    update(payload);
  };

  return (
    <Section
      title={t("settings.team.info.title")}
      description={t("settings.team.info.description")}
      footer={
        <>
          <CancelButton onClick={handleCancel} disabled={!isDirty || isUpdatePending} />
          <SaveButton
            onClick={handleSave}
            disabled={!isDirty || isUpdatePending}
            label={isUpdatePending ? t("common.saving") : undefined}
          />
        </>
      }
    >
      <FieldGrid>
        <Field label={t("settings.team.info.nameLabel")}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isUpdatePending}
            placeholder={t("settings.team.info.namePlaceholder")}
            maxLength={80}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field label={t("settings.team.info.timezoneLabel")}>
          <Input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={isUpdatePending}
            placeholder="Asia/Seoul"
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field
          label={t("settings.team.info.memoLabel")}
          className="md:col-span-2"
        >
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isUpdatePending}
            placeholder={t("settings.team.info.memoPlaceholder")}
            maxLength={3000}
            className="min-h-24 resize-none rounded-xl border-black/10 text-sm"
          />
          <div className="flex justify-end">
            <span className="text-[11px] text-black/45">
              {memo.length} / 3000
            </span>
          </div>
        </Field>
      </FieldGrid>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Display Settings — local persist
// ---------------------------------------------------------------------------
const CURRENCY_OPTIONS: readonly { value: CurrencyCode; label: string }[] = [
  { value: "KRW", label: "KRW (₩)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "CNY", label: "CNY (¥)" },
];

const DECIMAL_OPTIONS: readonly DecimalPlaces[] = [0, 1, 2, 3, 4];

const DATE_FORMAT_OPTIONS: readonly {
  value: DateFormat;
  label: string;
  example: string;
}[] = [
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD", example: "2026-04-19" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY", example: "04/19/2026" },
  { value: "DD-MMM-YYYY", label: "DD-MMM-YYYY", example: "19-Apr-2026" },
];

function DisplaySettingsSection() {
  const prefs = useTeamPreferences();
  // Snapshot the current prefs as the initial draft. To re-sync when the
  // user clicks Cancel we just rebuild local state from `prefs` lazily.
  return <DisplaySettingsSectionInner prefsSnapshot={prefs} />;
}

function DisplaySettingsSectionInner({
  prefsSnapshot,
}: {
  prefsSnapshot: ReturnType<typeof useTeamPreferences>;
}) {
  const prefs = useTeamPreferences();
  const setPrefs = useSetTeamPreferences();
  const { t } = useTranslation();

  const [draft, setDraft] = useState(prefsSnapshot);

  const isDirty =
    draft.currency !== prefs.currency ||
    draft.decimalPlaces !== prefs.decimalPlaces ||
    draft.dateFormat !== prefs.dateFormat ||
    draft.timeFormat !== prefs.timeFormat ||
    draft.unitSystem !== prefs.unitSystem;

  const handleCancel = () => setDraft(prefs);
  const handleSave = () => {
    if (!isDirty) {
      toast.info(t("common.noData"), { position: "top-center" });
      return;
    }
    setPrefs({
      currency: draft.currency,
      decimalPlaces: draft.decimalPlaces,
      dateFormat: draft.dateFormat,
      timeFormat: draft.timeFormat,
      unitSystem: draft.unitSystem,
    });
    toast.success(t("toast.saved"), { position: "top-center" });
  };

  return (
    <Section
      title={t("settings.team.display.title")}
      description={t("settings.team.display.description")}
      footer={
        <>
          <CancelButton onClick={handleCancel} disabled={!isDirty} />
          <SaveButton onClick={handleSave} disabled={!isDirty} />
        </>
      }
    >
      <FieldGrid>
        <Field label={t("settings.team.display.currencyLabel")}>
          <NativeSelect
            value={draft.currency}
            onChange={(v) =>
              setDraft((prev) => ({ ...prev, currency: v as CurrencyCode }))
            }
            options={CURRENCY_OPTIONS.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
          />
        </Field>

        <Field label={t("settings.team.display.decimalLabel")}>
          <NativeSelect
            value={String(draft.decimalPlaces)}
            onChange={(v) =>
              setDraft((prev) => ({
                ...prev,
                decimalPlaces: Number(v) as DecimalPlaces,
              }))
            }
            options={DECIMAL_OPTIONS.map((n) => ({
              value: String(n),
              label: String(n),
            }))}
          />
        </Field>

        <Field label={t("settings.team.display.dateFormatLabel")}>
          <NativeSelect
            value={draft.dateFormat}
            onChange={(v) =>
              setDraft((prev) => ({ ...prev, dateFormat: v as DateFormat }))
            }
            options={DATE_FORMAT_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
          />
        </Field>

        <Field label={t("settings.team.display.timeFormatLabel")}>
          <ToggleGroup
            value={draft.timeFormat}
            onChange={(v) =>
              setDraft((prev) => ({ ...prev, timeFormat: v as TimeFormat }))
            }
            options={[
              { value: "24h", label: t("settings.team.display.timeFormat24") },
              { value: "12h", label: t("settings.team.display.timeFormat12") },
            ]}
          />
        </Field>

        <Field
          label={t("settings.team.display.unitsLabel")}
          className="md:col-span-2"
        >
          <ToggleGroup
            value={draft.unitSystem}
            onChange={(v) =>
              setDraft((prev) => ({ ...prev, unitSystem: v as UnitSystem }))
            }
            options={[
              { value: "metric", label: t("settings.team.display.metric") },
              {
                value: "imperial",
                label: t("settings.team.display.imperial"),
              },
            ]}
          />
        </Field>
      </FieldGrid>
    </Section>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full appearance-none rounded-xl border border-black/10 bg-white px-3 pr-9 text-sm text-black transition-colors hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/55" />
    </div>
  );
}

function ToggleGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex h-9 items-center gap-1 rounded-xl border border-black/10 bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-black text-white"
              : "text-black/60 hover:bg-black/[0.04] hover:text-black",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Danger zone
// ---------------------------------------------------------------------------
function DangerZoneSection({ team }: { team: TeamEntity }) {
  const openAlertModal = useOpenAlertModal();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: del, isPending: isDeletePending } = useMutation({
    mutationFn: () => deleteTeam(team.id),
    onSuccess: () => {
      queryClient.clear();
      toast.success(t("settings.team.danger.deleteSuccess"), {
        position: "top-center",
      });
      window.location.href = "/app";
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const handleDeleteClick = () => {
    openAlertModal({
      title: t("settings.team.danger.deleteConfirmTitle", { name: team.name }),
      description: t("settings.team.danger.deleteConfirmDescription"),
      onPositive: () => del(),
    });
  };

  return (
    <Section
      title={t("settings.team.danger.title")}
      description={t("settings.team.danger.description")}
    >
      <div className="flex flex-col gap-3">
        <DangerRow
          label={t("settings.team.danger.leaveTitle")}
          description={t("settings.team.danger.leaveDescription")}
          actionLabel={t("settings.team.danger.leaveAction")}
          onClick={() => {
            // TODO(TMS): wire to leave-team mutation when available.
            toast.info(t("common.noData"), { position: "top-center" });
          }}
          icon={<LogOut className="h-3.5 w-3.5" />}
        />
        <DangerRow
          label={t("settings.team.danger.deleteTitle")}
          description={t("settings.team.danger.deleteDescription")}
          actionLabel={t("settings.team.danger.deleteAction")}
          onClick={handleDeleteClick}
          disabled={isDeletePending}
          icon={<Trash2 className="h-3.5 w-3.5" />}
          destructive
        />
      </div>
    </Section>
  );
}

function DangerRow({
  label,
  description,
  actionLabel,
  onClick,
  disabled,
  icon,
  destructive,
}: {
  label: string;
  description: string;
  actionLabel: string;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-white p-4">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold text-black">{label}</span>
        <span className="truncate text-xs text-black/55">{description}</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "shrink-0 gap-1.5 rounded-lg border text-xs",
          destructive
            ? "border-red-500 text-red-500 hover:bg-red-500/[0.08] hover:text-red-500"
            : "border-black/20 text-black/70 hover:bg-black/[0.04] hover:text-black",
        )}
      >
        {icon}
        {actionLabel}
      </Button>
    </div>
  );
}
