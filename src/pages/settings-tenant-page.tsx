import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  LogOut,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useTenantByIdData } from "@/hooks/queries/use-tenant-by-id-data";
import { useTenantMembersData } from "@/hooks/queries/use-tenant-members-data";
import { useTenantUsageData } from "@/hooks/queries/use-tenant-usage-data";
import { useApiKeysData } from "@/hooks/queries/use-api-keys-data";
import { useUpdateTenant } from "@/hooks/mutations/tenant/use-update-tenant";
import { useDeleteTenant } from "@/hooks/mutations/tenant/use-delete-tenant";
import { useRemoveTenantMember } from "@/hooks/mutations/tenant-member/use-remove-tenant-member";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useSession } from "@/store/session";
import {
  useTenantPreferences,
  useSetTenantPreferences,
  type CurrencyCode,
  type DateFormat,
  type DecimalPlaces,
  type TimeFormat,
  type UnitSystem,
} from "@/store/tenant-preferences";
import {
  useTenantCompanyInfo,
  useSetTenantCompanyInfo,
  type CompanyInfo,
} from "@/store/tenant-company-info";
import {
  getTimezoneLabel,
  getTimezoneOptions,
  type TimezoneOption,
} from "@/lib/timezones";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import type { TenantEntity } from "@/types";

// Settings > Tenant — multi-section configuration page. Each section has its
// own Save button so a mistake in one section doesn't block saving another.
// Currently only tenant-name/email/memo/timezone hit the backend; the rest
// persist locally (see store comments). Display preferences flow through
// `lib/format.ts` so amounts/dates render identically everywhere.

export default function SettingsTenantPage() {
  const params = useParams();
  const tenantId = params.tenantId ? Number(params.tenantId) : undefined;
  const { t } = useTranslation();

  const { data: tenant, error, isPending } = useTenantByIdData(tenantId);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!tenant) return <Fallback />;

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.tenant.title")}
        </h1>
        <p className="text-sm text-black/55">{t("settings.tenant.description")}</p>
      </div>

      <UsageSection tenant={tenant} />
      <TenantInfoSection tenant={tenant} />
      <CompanyInfoSection tenant={tenant} />
      <DisplaySettingsSection />
      <DangerZoneSection tenant={tenant} />
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
        {description && (
          <p className="text-xs text-black/55">{description}</p>
        )}
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
      {label ?? t("common.saveChanges")}
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
// Usage Section
// ---------------------------------------------------------------------------

type PlanQuota = {
  label: string;
  containerQueries: number;
  members: number;
  apiKeys: number;
};

const PLAN_QUOTAS: Record<string, PlanQuota> = {
  free: { label: "Free", containerQueries: 10, members: 3, apiKeys: 1 },
  basic: {
    label: "Basic",
    containerQueries: 100,
    members: 20,
    apiKeys: 5,
  },
  pro: { label: "Pro", containerQueries: 1000, members: 100, apiKeys: 20 },
};

function UsageSection({ tenant }: { tenant: TenantEntity }) {
  const quota = PLAN_QUOTAS[tenant.plan] ?? PLAN_QUOTAS.free;
  const { t } = useTranslation();

  const { data: members } = useTenantMembersData(tenant.id);
  const { data: usage } = useTenantUsageData({ tenantId: tenant.id, days: 30 });
  const { data: apiKeys } = useApiKeysData(tenant.id);

  const memberCount = members?.length ?? 0;
  // Active (non-revoked) keys only. Backend list endpoint already filters
  // is_active=false, so `apiKeys.length` would work too — this extra guard
  // keeps the count correct during the brief post-revoke window before the
  // next refetch drops the row.
  const apiKeyCount = apiKeys?.filter((k) => k.is_active).length ?? 0;
  const containerQueriesThisMonth = usage?.total_count ?? 0;

  return (
    <Section
      title={t("settings.tenant.usage.title")}
      description={t("settings.tenant.usage.description", { plan: quota.label })}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UsageStat
          label={t("settings.tenant.usage.containerQueries")}
          value={containerQueriesThisMonth}
          max={quota.containerQueries}
          suffix={t("settings.tenant.usage.suffix.times")}
        />
        <UsageStat
          label={t("settings.tenant.usage.members")}
          value={memberCount}
          max={quota.members}
          suffix={t("settings.tenant.usage.suffix.people")}
        />
        <UsageStat
          label={t("settings.tenant.usage.apiKeys")}
          value={apiKeyCount}
          max={quota.apiKeys}
          suffix={t("settings.tenant.usage.suffix.items")}
        />
      </div>
    </Section>
  );
}

function UsageStat({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
}) {
  const ratio = max === 0 ? 0 : Math.min(1, value / max);
  const percentage = Math.round(ratio * 100);
  const barColor =
    ratio >= 0.9
      ? "bg-red-500"
      : ratio >= 0.75
        ? "bg-amber-500"
        : "bg-black";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-black/50">{label}</span>
        <span className="text-[11px] text-black/45">{percentage}%</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-black">
          {value.toLocaleString()}
        </span>
        <span className="text-xs text-black/55">
          / {max.toLocaleString()} {suffix}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tenant Info Section (name / memo / timezone) — hits `PATCH /tenant`
// ---------------------------------------------------------------------------

function TenantInfoSection({ tenant }: { tenant: TenantEntity }) {
  const [name, setName] = useState(tenant.name);
  const [memo, setMemo] = useState(tenant.memo ?? "");
  const [timezone, setTimezone] = useState(tenant.timezone ?? "Asia/Seoul");
  const { t } = useTranslation();

  const { mutate: updateTenant, isPending: isUpdateTenantPending } = useUpdateTenant({
    onSuccess: () => {
      toast.success(t("settings.tenant.info.saveSuccess"), {
        position: "top-center",
      });
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  useEffect(() => {
    setName(tenant.name);
    setMemo(tenant.memo ?? "");
    setTimezone(tenant.timezone ?? "Asia/Seoul");
  }, [tenant.id, tenant.name, tenant.memo, tenant.timezone]);

  const isDirty =
    name.trim() !== tenant.name ||
    (memo.trim() === "" ? null : memo.trim()) !== (tenant.memo ?? null) ||
    timezone !== (tenant.timezone ?? "Asia/Seoul");

  const handleCancel = () => {
    setName(tenant.name);
    setMemo(tenant.memo ?? "");
    setTimezone(tenant.timezone ?? "Asia/Seoul");
  };

  const handleSave = () => {
    if (name.trim() === "") {
      toast.error(t("settings.tenant.info.nameRequired"), {
        position: "top-center",
      });
      return;
    }
    const payload: {
      name?: string;
      memo?: string | null;
      timezone?: string | null;
    } = {};
    if (name.trim() !== tenant.name) payload.name = name.trim();
    const nextMemo = memo.trim() === "" ? null : memo.trim();
    if (nextMemo !== (tenant.memo ?? null)) payload.memo = nextMemo;
    if (timezone !== (tenant.timezone ?? "Asia/Seoul")) {
      payload.timezone = timezone;
    }
    if (Object.keys(payload).length === 0) {
      toast.info(t("common.noChanges"), { position: "top-center" });
      return;
    }
    updateTenant({ tenantId: tenant.id, payload });
  };

  return (
    <Section
      title={t("settings.tenant.info.title")}
      description={t("settings.tenant.info.description")}
      footer={
        <>
          <CancelButton
            onClick={handleCancel}
            disabled={!isDirty || isUpdateTenantPending}
          />
          <SaveButton
            onClick={handleSave}
            disabled={!isDirty || isUpdateTenantPending}
            label={isUpdateTenantPending ? t("common.saving") : undefined}
          />
        </>
      }
    >
      <FieldGrid>
        <Field label={t("settings.tenant.info.nameLabel")}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isUpdateTenantPending}
            placeholder={t("settings.tenant.info.namePlaceholder")}
            maxLength={80}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field label={t("settings.tenant.info.timezoneLabel")}>
          <TimezonePicker
            value={timezone}
            onChange={setTimezone}
            disabled={isUpdateTenantPending}
          />
        </Field>

        <Field
          label={t("settings.tenant.info.memoLabel")}
          className="md:col-span-2"
        >
          <Textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={isUpdateTenantPending}
            placeholder={t("settings.tenant.info.memoPlaceholder")}
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

function TimezonePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t } = useTranslation();
  const options: TimezoneOption[] = useMemo(() => getTimezoneOptions(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 text-left text-sm transition-colors hover:border-black/20 disabled:opacity-50"
        >
          <span className="truncate text-black">{getTimezoneLabel(value)}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-black/55" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-black/45" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("settings.tenant.timezone.searchPlaceholder")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/45"
          />
        </div>
        <ul className="max-h-[280px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-xs text-black/55">
              {t("settings.tenant.timezone.noResults")}
            </li>
          ) : (
            filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                    o.id === value
                      ? "bg-black/[0.04] text-black"
                      : "text-black/70 hover:bg-black/[0.03] hover:text-black",
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {o.id === value && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-black" />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Company Info Section — email on backend, rest in per-tenant local persist
// ---------------------------------------------------------------------------

function CompanyInfoSection({ tenant }: { tenant: TenantEntity }) {
  const stored = useTenantCompanyInfo(tenant.id);
  const setStored = useSetTenantCompanyInfo();
  const { t } = useTranslation();

  const [email, setEmail] = useState(tenant.email ?? "");
  const [draft, setDraft] = useState<CompanyInfo>(stored);

  const { mutate: updateTenant, isPending: isUpdateTenantPending } = useUpdateTenant({
    onSuccess: () => {
      toast.success(t("settings.tenant.company.saveSuccess"), {
        position: "top-center",
      });
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  useEffect(() => {
    setEmail(tenant.email ?? "");
  }, [tenant.id, tenant.email]);

  useEffect(() => {
    setDraft(stored);
    // Re-sync when the tenant changes (stored is keyed by tenantId so the
    // reference itself becomes a new object on tenant switch).
  }, [stored]);

  const update = <K extends keyof CompanyInfo>(key: K, value: CompanyInfo[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const isEmailDirty =
    (email.trim() === "" ? null : email.trim()) !== (tenant.email ?? null);
  const isCompanyDirty =
    draft.businessName !== stored.businessName ||
    draft.registrationNumber !== stored.registrationNumber ||
    draft.address !== stored.address ||
    draft.representative !== stored.representative ||
    draft.phone !== stored.phone;
  const isDirty = isEmailDirty || isCompanyDirty;

  const handleCancel = () => {
    setEmail(tenant.email ?? "");
    setDraft(stored);
  };

  const handleSave = () => {
    // Backend-backed email patches first; company info persists locally on
    // success. If the PATCH fails we leave the local draft alone so the
    // user can retry without losing their edits.
    const nextEmail = email.trim() === "" ? null : email.trim();
    if (isEmailDirty) {
      updateTenant(
        { tenantId: tenant.id, payload: { email: nextEmail } },
        {
          onSuccess: () => {
            if (isCompanyDirty) setStored(tenant.id, draft);
          },
        },
      );
      return;
    }
    if (isCompanyDirty) {
      setStored(tenant.id, draft);
      toast.success(t("settings.tenant.company.saveSuccess"), {
        position: "top-center",
      });
      return;
    }
    toast.info(t("common.noChanges"), { position: "top-center" });
  };

  return (
    <Section
      title={t("settings.tenant.company.title")}
      description={t("settings.tenant.company.description")}
      footer={
        <>
          <CancelButton
            onClick={handleCancel}
            disabled={!isDirty || isUpdateTenantPending}
          />
          <SaveButton
            onClick={handleSave}
            disabled={!isDirty || isUpdateTenantPending}
            label={isUpdateTenantPending ? t("common.saving") : undefined}
          />
        </>
      }
    >
      <FieldGrid>
        <Field label={t("settings.tenant.company.businessName")}>
          <Input
            value={draft.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            maxLength={120}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field label={t("settings.tenant.company.registrationNumber")}>
          <Input
            value={draft.registrationNumber}
            onChange={(e) => update("registrationNumber", e.target.value)}
            placeholder="123-45-67890"
            maxLength={40}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field label={t("settings.tenant.company.representative")}>
          <Input
            value={draft.representative}
            onChange={(e) => update("representative", e.target.value)}
            maxLength={80}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field label={t("settings.tenant.company.phone")}>
          <Input
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+82-2-1234-5678"
            maxLength={40}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field
          label={t("settings.tenant.company.email")}
          hint={t("settings.tenant.company.emailHint")}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isUpdateTenantPending}
            placeholder="billing@example.com"
            maxLength={255}
            className="rounded-xl border-black/10 text-sm"
          />
        </Field>

        <Field label={t("settings.tenant.company.address")} className="md:col-span-2">
          <Textarea
            value={draft.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder={t("settings.tenant.company.addressPlaceholder")}
            maxLength={500}
            className="min-h-20 resize-none rounded-xl border-black/10 text-sm"
          />
          <div className="flex justify-end">
            <span className="text-[11px] text-black/45">
              {draft.address.length} / 500
            </span>
          </div>
        </Field>
      </FieldGrid>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Display Settings — currency / decimal / date / time / units (local persist)
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
  const prefs = useTenantPreferences();
  const setPrefs = useSetTenantPreferences();
  const { t } = useTranslation();

  const [draft, setDraft] = useState(prefs);

  useEffect(() => {
    setDraft(prefs);
  }, [prefs]);

  const isDirty =
    draft.currency !== prefs.currency ||
    draft.decimalPlaces !== prefs.decimalPlaces ||
    draft.dateFormat !== prefs.dateFormat ||
    draft.timeFormat !== prefs.timeFormat ||
    draft.unitSystem !== prefs.unitSystem;

  const handleCancel = () => setDraft(prefs);
  const handleSave = () => {
    if (!isDirty) {
      toast.info(t("common.noChanges"), { position: "top-center" });
      return;
    }
    setPrefs({
      currency: draft.currency,
      decimalPlaces: draft.decimalPlaces,
      dateFormat: draft.dateFormat,
      timeFormat: draft.timeFormat,
      unitSystem: draft.unitSystem,
    });
    toast.success(t("settings.tenant.display.saveSuccess"), {
      position: "top-center",
    });
  };

  return (
    <Section
      title={t("settings.tenant.display.title")}
      description={t("settings.tenant.display.description")}
      footer={
        <>
          <CancelButton onClick={handleCancel} disabled={!isDirty} />
          <SaveButton onClick={handleSave} disabled={!isDirty} />
        </>
      }
    >
      <FieldGrid>
        <Field
          label={t("settings.tenant.display.currencyLabel")}
          hint={t("settings.tenant.display.currencyHint", {
            example: formatPreviewAmount(
              1234567.89,
              draft.currency,
              draft.decimalPlaces,
            ),
          })}
        >
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

        <Field
          label={t("settings.tenant.display.decimalLabel")}
          hint={t("settings.tenant.display.decimalHint")}
        >
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

        <Field
          label={t("settings.tenant.display.dateFormatLabel")}
          hint={t("settings.tenant.display.dateFormatHint", {
            example:
              DATE_FORMAT_OPTIONS.find((o) => o.value === draft.dateFormat)
                ?.example ?? "",
          })}
        >
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

        <Field label={t("settings.tenant.display.timeFormatLabel")}>
          <ToggleGroup
            value={draft.timeFormat}
            onChange={(v) =>
              setDraft((prev) => ({ ...prev, timeFormat: v as TimeFormat }))
            }
            options={[
              { value: "24h", label: t("settings.tenant.display.timeFormat24") },
              { value: "12h", label: t("settings.tenant.display.timeFormat12") },
            ]}
          />
        </Field>

        <Field
          label={t("settings.tenant.display.unitsLabel")}
          hint={t("settings.tenant.display.unitsHint")}
          className="md:col-span-2"
        >
          <ToggleGroup
            value={draft.unitSystem}
            onChange={(v) =>
              setDraft((prev) => ({ ...prev, unitSystem: v as UnitSystem }))
            }
            options={[
              { value: "metric", label: t("settings.tenant.display.metric") },
              {
                value: "imperial",
                label: t("settings.tenant.display.imperial"),
              },
            ]}
          />
        </Field>
      </FieldGrid>
    </Section>
  );
}

function formatPreviewAmount(
  value: number,
  currency: CurrencyCode,
  decimalPlaces: DecimalPlaces,
): string {
  const symbol: Record<CurrencyCode, string> = {
    KRW: "₩",
    USD: "$",
    EUR: "€",
    JPY: "¥",
    CNY: "¥",
  };
  return `${symbol[currency]}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  })}`;
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
// Danger Zone — leave / delete
// ---------------------------------------------------------------------------

function DangerZoneSection({ tenant }: { tenant: TenantEntity }) {
  const navigate = useNavigate();
  const session = useSession();
  const openAlertModal = useOpenAlertModal();
  const { t } = useTranslation();

  const currentUserId = session
    ? typeof session.user.id === "number"
      ? session.user.id
      : Number(session.user.id)
    : null;

  const { mutate: leaveTenant, isPending: isLeaveTenantPending } =
    useRemoveTenantMember({
      onSuccess: () => {
        toast.success(t("settings.tenant.danger.leaveSuccess"), {
          position: "top-center",
        });
        navigate("/app", { replace: true });
      },
      onError: (error) => {
        toast.error(generateErrorMessage(error), { position: "top-center" });
      },
    });

  const { mutate: deleteTenant, isPending: isDeleteTenantPending } = useDeleteTenant({
    onSuccess: () => {
      toast.success(t("settings.tenant.danger.deleteSuccess"), {
        position: "top-center",
      });
      navigate("/app", { replace: true });
    },
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const handleLeaveClick = () => {
    if (currentUserId === null) return;
    openAlertModal({
      title: t("settings.tenant.danger.leaveConfirmTitle"),
      description: t("settings.tenant.danger.leaveConfirmDescription"),
      onPositive: () => leaveTenant({ tenantId: tenant.id, userId: currentUserId }),
    });
  };

  const handleDeleteClick = () => {
    openAlertModal({
      title: t("settings.tenant.danger.deleteConfirmTitle", { name: tenant.name }),
      description: t("settings.tenant.danger.deleteConfirmDescription"),
      onPositive: () => deleteTenant(tenant.id),
    });
  };

  const isPending = isLeaveTenantPending || isDeleteTenantPending;

  return (
    <Section
      title={t("settings.tenant.danger.title")}
      description={t("settings.tenant.danger.description")}
    >
      <div className="flex flex-col gap-3">
        <DangerRow
          label={t("settings.tenant.danger.leaveTitle")}
          description={t("settings.tenant.danger.leaveDescription")}
          actionLabel={t("settings.tenant.danger.leaveAction")}
          onClick={handleLeaveClick}
          disabled={isPending || currentUserId === null}
          icon={<LogOut className="h-3.5 w-3.5" />}
        />
        <DangerRow
          label={t("settings.tenant.danger.deleteTitle")}
          description={t("settings.tenant.danger.deleteDescription")}
          actionLabel={t("settings.tenant.danger.deleteAction")}
          onClick={handleDeleteClick}
          disabled={isPending}
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
