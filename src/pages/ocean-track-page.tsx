import {
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Check,
  ChevronDown,
  History,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Fallback from "@/components/fallback";
import Loader from "@/components/loader";
import { createOceanShipment } from "@/api/ocean-shipment";
import { useOceanShipmentsData } from "@/hooks/queries/use-ocean-shipments-data";
import { QUERY_KEYS } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { formatTimeAgo } from "@/lib/time";
import {
  detectCarrierFromMbl,
  findCarrierById,
} from "@/lib/scac";
import { useCarriersData } from "@/hooks/queries/use-carriers-data";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useTeamTagsData } from "@/hooks/queries/use-team-tags-data";
import { useTeamCustomersData } from "@/hooks/queries/use-team-customers-data";
import { useCreateTag } from "@/hooks/mutations/tag/use-create-tag";
import { useCreateCustomer } from "@/hooks/mutations/customer/use-create-customer";
import { useTeamScope } from "@/store/team-scope";
import ColumnSettingsButton from "@/components/grid/column-settings-button";
import { useResolvedColumns } from "@/components/grid/use-resolved-columns";
import type { GridColumnDefinition } from "@/store/grid-column-config";
import type {
  CarrierEntity,
  CustomerEntity,
  OceanShipmentEntity,
  TagEntity,
} from "@/types";

type TabId = "quick" | "bulk" | "history";
type BlType = "bl" | "booking" | "container";

// Form-level row state. Carrier is required at submit time; `customerId`,
// `refNumbers`, `tagIds` are optional metadata. Customer is a FK to the
// team-scoped customers master — stored as an id here so the submit payload
// doesn't need translation.
type TrackRow = {
  id: number;
  bl: string;
  blType: BlType;
  // Selected carrier (from the DB catalogue). Null until the user picks or
  // MBL prefix auto-detects one. Submission is blocked while this is null.
  carrierId: number | null;
  // True when `carrierId` was last set by the auto-detect pass. Flipping
  // this off means the user has picked manually and further edits to the BL
  // should NOT overwrite their choice.
  autoFromBl: boolean;
  // FK to customers.id. Null = unassigned. The picker "None" option clears it.
  customerId: number | null;
  refNumbers: string[];
  // Tag IDs are numeric on the backend — stored here as numbers so the
  // submit payload doesn't need translation.
  tagIds: number[];
};

let nextRowId = 1;
const makeRow = (): TrackRow => ({
  id: nextRowId++,
  bl: "",
  blType: "bl",
  carrierId: null,
  autoFromBl: false,
  customerId: null,
  refNumbers: [],
  tagIds: [],
});

// Every row renders into this CSS grid — also used for the column-header
// pseudo-row above the first data row. Kept at module scope so both stay in
// sync if the proportions are ever tweaked.
const ROW_GRID =
  "grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1.2fr)_minmax(160px,1fr)_minmax(180px,1.2fr)_minmax(180px,1.2fr)_auto]";

export default function OceanTrackPage() {
  const [tab, setTab] = useState<TabId>("quick");
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("pages.ocean.track.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("pages.ocean.track.description")}
        </p>
      </div>

      <TabBar tab={tab} onChange={setTab} />

      {tab === "quick" && <QuickEntry />}
      {tab === "bulk" && (
        <InlineComingSoon
          icon={<Upload className="h-6 w-6" />}
          title={t("pages.ocean.track.bulk.title")}
          description={t("pages.ocean.track.bulk.description")}
        />
      )}
      {tab === "history" && (
        <InlineComingSoon
          icon={<History className="h-6 w-6" />}
          title={t("pages.ocean.track.history.title")}
          description={t("pages.ocean.track.history.description")}
        />
      )}
    </div>
  );
}

function TabBar({
  tab,
  onChange,
}: {
  tab: TabId;
  onChange: (next: TabId) => void;
}) {
  const { t } = useTranslation();
  const tabs: { id: TabId; label: string; icon: ReactNode; soon?: boolean }[] =
    [
      {
        id: "quick",
        label: t("pages.ocean.track.tab.quick"),
        icon: <Plus className="h-4 w-4" />,
      },
      {
        id: "bulk",
        label: t("pages.ocean.track.tab.bulk"),
        icon: <Upload className="h-4 w-4" />,
        soon: true,
      },
      {
        id: "history",
        label: t("pages.ocean.track.tab.history"),
        icon: <History className="h-4 w-4" />,
        soon: true,
      },
    ];

  return (
    <div className="flex items-center gap-6 border-b border-black/10">
      {tabs.map((entry) => {
        const isActive = tab === entry.id;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onChange(entry.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 py-3 text-sm transition-colors",
              isActive
                ? "border-black font-medium text-black"
                : "border-transparent text-black/55 hover:text-black",
            )}
          >
            {entry.icon}
            <span>{entry.label}</span>
            {entry.soon && (
              <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-black/55">
                {t("common.soon")}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Entry — all rows share the same horizontal grid layout
// ---------------------------------------------------------------------------

function QuickEntry() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const teamId = params.teamId;
  const scopedTeamId = useTeamScope();
  const { data: tags = [] } = useTeamTagsData(scopedTeamId);
  const { data: customers = [] } = useTeamCustomersData(scopedTeamId);
  // Carrier catalogue from the backend — drives auto-detect + the picker.
  // Default empty array keeps callsites safe before the first fetch lands.
  const { data: carriers = [] } = useCarriersData({ supported_only: true });
  const { mutate: createTagMutation } = useCreateTag({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });
  const { mutate: createCustomerMutation } = useCreateCustomer({
    onError: (error) => {
      toast.error(generateErrorMessage(error), { position: "top-center" });
    },
  });

  const [rows, setRows] = useState<TrackRow[]>(() => [makeRow()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRow = (id: number, patch: Partial<TrackRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const handleBlChange = (id: number, next: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const detected = detectCarrierFromMbl(next, carriers);
        if (r.carrierId === null || r.autoFromBl) {
          return {
            ...r,
            bl: next,
            carrierId: detected?.id ?? r.carrierId,
            autoFromBl: detected !== null,
          };
        }
        return { ...r, bl: next };
      }),
    );
  };

  const handleCarrierIdChange = (id: number, carrierId: number | null) => {
    updateRow(id, { carrierId, autoFromBl: false });
  };

  const handleAddRow = () => setRows((prev) => [...prev, makeRow()]);

  const handleRemoveRow = (id: number) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.id !== id),
    );
  };

  const handleCreateTagForRow = (rowId: number, name: string) => {
    if (scopedTeamId === undefined) return;
    createTagMutation(
      { name },
      {
        onSuccess: (created) => {
          setRows((prev) =>
            prev.map((r) =>
              r.id === rowId
                ? {
                    ...r,
                    tagIds: r.tagIds.includes(created.id)
                      ? r.tagIds
                      : [...r.tagIds, created.id],
                  }
                : r,
            ),
          );
        },
      },
    );
  };

  const handleCreateCustomerForRow = (rowId: number, name: string) => {
    if (scopedTeamId === undefined) return;
    createCustomerMutation(
      { name },
      {
        onSuccess: (created) => {
          setRows((prev) =>
            prev.map((r) =>
              r.id === rowId ? { ...r, customerId: created.id } : r,
            ),
          );
        },
      },
    );
  };

  // Two-stage validity: a row counts if it has both a BL and a carrier.
  // We surface carrier-less rows as an error toast so the user knows why the
  // submit button is disabled (rather than silently ignoring them).
  const rowsWithBl = rows.filter((r) => r.bl.trim() !== "");
  const validRows = rowsWithBl.filter((r) => r.carrierId !== null);
  const carrierMissingCount = rowsWithBl.length - validRows.length;
  const submitCount = validRows.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rowsWithBl.length === 0) {
      toast.error(t("pages.ocean.track.quick.emptyBl"), {
        position: "top-center",
      });
      return;
    }
    if (carrierMissingCount > 0) {
      toast.error(t("pages.ocean.track.quick.carrierRequired"), {
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);
    const results = await Promise.allSettled(
      validRows.map((r) =>
        createOceanShipment({
          // carrierId is non-null here — `validRows` guarantees it.
          mbl: r.bl.trim().toUpperCase(),
          carrier_id: r.carrierId as number,
          customer_id: r.customerId,
          ref_numbers: r.refNumbers.length > 0 ? r.refNumbers : null,
          tag_ids: r.tagIds.length > 0 ? r.tagIds : null,
        }),
      ),
    );
    setIsSubmitting(false);

    const succeeded = results.filter(
      (r): r is PromiseFulfilledResult<OceanShipmentEntity> =>
        r.status === "fulfilled",
    );
    const failed = results.filter((r) => r.status === "rejected");

    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.oceanShipment.all });

    if (failed.length === 0) {
      toast.success(
        t("pages.ocean.track.quick.allSuccess", { count: succeeded.length }),
        { position: "top-center" },
      );
      if (succeeded.length === 1) {
        navigate(`/app/${teamId}/ocean/shipments/${succeeded[0].value.id}`);
        return;
      }
      setRows([makeRow()]);
      return;
    }

    if (succeeded.length === 0) {
      toast.error(t("pages.ocean.track.quick.allFailed"), {
        position: "top-center",
      });
      const firstError = (failed[0] as PromiseRejectedResult).reason;
      toast.error(generateErrorMessage(firstError), { position: "top-center" });
      return;
    }

    toast(
      t("pages.ocean.track.quick.partialSuccess", {
        succeeded: succeeded.length,
        failed: failed.length,
      }),
      { position: "top-center" },
    );
    const failedIds = new Set(
      validRows
        .map((r, i) => (results[i].status === "rejected" ? r.id : null))
        .filter((x): x is number => x !== null),
    );
    setRows((prev) => prev.filter((r) => failedIds.has(r.id)));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Form card ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-black/10 bg-white"
      >
        <div className="flex items-start gap-2 border-b border-black/5 px-6 py-3">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-black/55" />
          <p className="text-xs leading-relaxed text-black/60">
            {t("pages.ocean.track.quick.hint")}
          </p>
        </div>

        {/* Column headers — rendered once above the row stack. Same grid
            template as each row so the cells line up on desktop; collapses
            visually on mobile (headers hidden, each field gets its own
            label inside the row). */}
        <div
          className={cn(
            ROW_GRID,
            "hidden border-b border-black/5 px-6 py-3 lg:grid",
          )}
        >
          <ColumnHeader label={t("pages.ocean.track.quick.blLabel")} />
          <ColumnHeader label={t("pages.ocean.track.quick.shippingLineLabel")} />
          <ColumnHeader
            label={t("pages.ocean.track.quick.customerLabel")}
            optional
          />
          <ColumnHeader
            label={t("pages.ocean.track.quick.refLabel")}
            optional
          />
          <ColumnHeader
            label={t("pages.ocean.track.quick.tagsLabel")}
            optional
          />
          <span />
        </div>

        <div className="flex flex-col divide-y divide-black/5">
          {rows.map((row) => (
            <TrackRowEditor
              key={row.id}
              row={row}
              canRemove={rows.length > 1}
              disabled={isSubmitting}
              availableTags={tags}
              availableCustomers={customers}
              availableCarriers={carriers}
              onBlChange={(next) => handleBlChange(row.id, next)}
              onBlTypeChange={(next) => updateRow(row.id, { blType: next })}
              onCarrierIdChange={(next) => handleCarrierIdChange(row.id, next)}
              onCustomerIdChange={(next) =>
                updateRow(row.id, { customerId: next })
              }
              onCreateCustomer={(name) =>
                handleCreateCustomerForRow(row.id, name)
              }
              onRefNumbersChange={(next) =>
                updateRow(row.id, { refNumbers: next })
              }
              onTagIdsChange={(next) => updateRow(row.id, { tagIds: next })}
              onCreateTag={(name) => handleCreateTagForRow(row.id, name)}
              onRemove={() => handleRemoveRow(row.id)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-6 py-4">
          <button
            type="button"
            onClick={handleAddRow}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-medium text-black/70 transition-colors hover:border-black/20 hover:text-black disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("pages.ocean.track.quick.addAnother")}
          </button>
          <Button
            type="submit"
            disabled={isSubmitting || submitCount === 0}
            className="group gap-2 rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-black/80"
          >
            {isSubmitting
              ? t("pages.ocean.track.quick.submitting")
              : submitCount === 1
                ? t("pages.ocean.track.quick.submitOne")
                : t("pages.ocean.track.quick.submitMany", {
                    count: Math.max(submitCount, 1),
                  })}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </form>

      {/* ── Recently Added ────────────────────────────────── */}
      <RecentlyAdded />
    </div>
  );
}

function ColumnHeader({
  label,
  optional,
}: {
  label: string;
  optional?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium text-black/50">
      {label}
      {optional && (
        <span className="text-[10px] font-normal text-black/45">
          {t("common.optional")}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Row editor — one horizontal line per row on desktop; stacks on mobile.
// ---------------------------------------------------------------------------

function TrackRowEditor({
  row,
  canRemove,
  disabled,
  availableTags,
  availableCustomers,
  availableCarriers,
  onBlChange,
  onBlTypeChange,
  onCarrierIdChange,
  onCustomerIdChange,
  onCreateCustomer,
  onRefNumbersChange,
  onTagIdsChange,
  onCreateTag,
  onRemove,
}: {
  row: TrackRow;
  canRemove: boolean;
  disabled: boolean;
  availableTags: TagEntity[];
  availableCustomers: CustomerEntity[];
  availableCarriers: CarrierEntity[];
  onBlChange: (next: string) => void;
  onBlTypeChange: (next: BlType) => void;
  onCarrierIdChange: (next: number | null) => void;
  onCustomerIdChange: (next: number | null) => void;
  onCreateCustomer: (name: string) => void;
  onRefNumbersChange: (next: string[]) => void;
  onTagIdsChange: (next: number[]) => void;
  onCreateTag: (name: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const detected = useMemo(
    () => detectCarrierFromMbl(row.bl, availableCarriers),
    [row.bl, availableCarriers],
  );
  const selected = findCarrierById(row.carrierId, availableCarriers);
  const showMismatch =
    detected !== null &&
    selected !== null &&
    detected.id !== selected.id &&
    !row.autoFromBl;

  return (
    <div className="flex flex-col gap-2 px-6 py-4">
      <div className={cn(ROW_GRID, "items-start")}>
        <FieldCell label={t("pages.ocean.track.quick.blLabel")}>
          <BlInput
            value={row.bl}
            type={row.blType}
            onValueChange={onBlChange}
            onTypeChange={onBlTypeChange}
            disabled={disabled}
          />
        </FieldCell>
        <FieldCell label={t("pages.ocean.track.quick.shippingLineLabel")}>
          <ShippingLinePicker
            value={row.carrierId}
            autoDetected={row.autoFromBl}
            disabled={disabled}
            carriers={availableCarriers}
            onChange={onCarrierIdChange}
          />
        </FieldCell>
        <FieldCell
          label={t("pages.ocean.track.quick.customerLabel")}
          optional
        >
          <CustomerPicker
            availableCustomers={availableCustomers}
            selectedId={row.customerId}
            disabled={disabled}
            onChange={onCustomerIdChange}
            onCreateCustomer={onCreateCustomer}
          />
        </FieldCell>
        <FieldCell label={t("pages.ocean.track.quick.refLabel")} optional>
          <RefNumberInput
            values={row.refNumbers}
            onChange={onRefNumbersChange}
            disabled={disabled}
          />
        </FieldCell>
        <FieldCell label={t("pages.ocean.track.quick.tagsLabel")} optional>
          <TagPicker
            availableTags={availableTags}
            selectedIds={row.tagIds}
            disabled={disabled}
            onChange={onTagIdsChange}
            onCreateTag={onCreateTag}
          />
        </FieldCell>
        <div className="flex justify-end lg:pt-0">
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label={t("pages.ocean.track.quick.removeRow")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-black/55 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="hidden h-10 w-10 lg:block" aria-hidden />
          )}
        </div>
      </div>

      {showMismatch && detected && selected && (
        <p className="text-xs text-amber-600">
          {t("pages.ocean.track.quick.shippingLineMismatch", {
            prefix: detected.scac,
            detected: detected.name,
            selected: selected.name,
          })}
        </p>
      )}
    </div>
  );
}

// Mobile-only inline label so stacked rows stay legible. Hidden on desktop
// because the top-of-card column header row already labels each column.
function FieldCell({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[11px] font-medium text-black/50 lg:hidden">
        {label}
        {optional && (
          <span className="text-[10px] font-normal text-black/45">
            {t("common.optional")}
          </span>
        )}
      </span>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BL input + type fused control
// ---------------------------------------------------------------------------

function BlInput({
  value,
  type,
  onValueChange,
  onTypeChange,
  disabled,
}: {
  value: string;
  type: BlType;
  onValueChange: (next: string) => void;
  onTypeChange: (next: BlType) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex h-10 w-full items-center gap-0 overflow-hidden rounded-xl border border-black/10 bg-white transition-colors focus-within:border-black/30">
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        placeholder={t("pages.ocean.track.quick.blPlaceholder")}
        maxLength={40}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-black outline-none placeholder:text-black/45 disabled:opacity-50"
        autoCapitalize="characters"
        spellCheck={false}
      />
      <div className="h-5 w-px shrink-0 bg-black/10" />
      <BlTypeSelect value={type} onChange={onTypeChange} disabled={disabled} />
    </div>
  );
}

function BlTypeSelect({
  value,
  onChange,
  disabled,
}: {
  value: BlType;
  onChange: (next: BlType) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const options: { value: BlType; label: string }[] = [
    { value: "bl", label: t("pages.ocean.track.quick.typeBl") },
    { value: "booking", label: t("pages.ocean.track.quick.typeBooking") },
    { value: "container", label: t("pages.ocean.track.quick.typeContainer") },
  ];
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BlType)}
        disabled={disabled}
        className="h-9 appearance-none bg-transparent pl-3 pr-7 text-xs text-black/60 outline-none focus:text-black disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-black/55" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shipping line picker — Popover + search + filtered list
// ---------------------------------------------------------------------------

function ShippingLinePicker({
  value,
  autoDetected,
  disabled,
  carriers,
  onChange,
}: {
  value: number | null;
  autoDetected: boolean;
  disabled?: boolean;
  carriers: CarrierEntity[];
  onChange: (next: number | null) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return carriers;
    return carriers.filter(
      (line) =>
        line.name.toLowerCase().includes(q) ||
        line.scac.toLowerCase().includes(q),
    );
  }, [query, carriers]);

  const selected = findCarrierById(value, carriers);

  const handleSelect = (line: CarrierEntity) => {
    onChange(line.id);
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
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 text-left text-sm transition-colors hover:border-black/20 disabled:opacity-50",
            open && "border-black/30",
          )}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-black">{selected.name}</span>
              {autoDetected && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  {t("pages.ocean.track.quick.shippingLineAuto")}
                </span>
              )}
            </span>
          ) : (
            <span className="truncate text-black/45">
              {t("pages.ocean.track.quick.shippingLinePlaceholder")}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-black/55" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-black/45" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("pages.ocean.track.quick.shippingLineSearch")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/45"
          />
        </div>
        <ul className="max-h-[280px] overflow-y-auto p-1">
          {/* "None" row — present so the user can reset an auto-detected
              carrier. Selecting it clears `carrierId`; submission is then
              blocked with a toast until the user picks a real carrier. */}
          <li>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
                setQuery("");
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                value === null
                  ? "bg-black/[0.04] text-black"
                  : "text-black/55 hover:bg-black/[0.03] hover:text-black",
              )}
            >
              <span className="truncate italic">
                {t("pages.ocean.track.quick.shippingLineNone")}
              </span>
              {value === null && (
                <Check className="h-3.5 w-3.5 shrink-0 text-black" />
              )}
            </button>
          </li>
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-xs text-black/55">
              {t("pages.ocean.track.quick.shippingLineNoResults")}
            </li>
          ) : (
            filtered.map((line) => {
              const isSelected = line.id === value;
              return (
                <li key={line.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(line)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-black/[0.04] text-black"
                        : "text-black/70 hover:bg-black/[0.03] hover:text-black",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate">{line.name}</span>
                      <span className="shrink-0 font-mono text-[10px] text-black/45">
                        {line.scac}
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-black" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Ref # chip input
// ---------------------------------------------------------------------------

function RefNumberInput({
  values,
  onChange,
  disabled,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed === "") return;
    if (values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
      return;
    }
    if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeAt = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2 py-1.5 transition-colors focus-within:border-black/30">
      {values.map((v, idx) => (
        <span
          key={`${v}-${idx}`}
          className="inline-flex items-center gap-1 rounded-lg bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] text-black"
        >
          {v}
          <button
            type="button"
            onClick={() => removeAt(idx)}
            disabled={disabled}
            aria-label={t("pages.ocean.track.quick.refRemoveAria", { value: v })}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/10 hover:text-black disabled:opacity-50"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        disabled={disabled}
        placeholder={
          values.length === 0
            ? t("pages.ocean.track.quick.refPlaceholder")
            : ""
        }
        className="min-w-[80px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-black/45 disabled:opacity-50"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tag picker — Popover + search + select existing + inline create
// ---------------------------------------------------------------------------

function TagPicker({
  availableTags,
  selectedIds,
  disabled,
  onChange,
  onCreateTag,
}: {
  availableTags: TagEntity[];
  selectedIds: number[];
  disabled: boolean;
  onChange: (next: number[]) => void;
  onCreateTag: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedTags = useMemo(
    () =>
      selectedIds
        .map((id) => availableTags.find((t) => t.id === id))
        .filter((t): t is TagEntity => t !== undefined),
    [selectedIds, availableTags],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return availableTags;
    return availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(q),
    );
  }, [availableTags, query]);

  const trimmedQuery = query.trim();
  const exactMatch = availableTags.find(
    (t) => t.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const canCreate = trimmedQuery !== "" && !exactMatch;

  const toggleTag = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeTag = (id: number) => {
    onChange(selectedIds.filter((x) => x !== id));
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreateTag(trimmedQuery);
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
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-black/10 bg-white px-2 py-1.5 text-left transition-colors hover:border-black/20 disabled:opacity-50",
            open && "border-black/30",
          )}
        >
          {selectedTags.length === 0 ? (
            <span className="px-1 text-sm text-black/45">
              {t("pages.ocean.track.quick.tagsPlaceholder")}
            </span>
          ) : (
            selectedTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[11px] font-medium text-black"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: tag.color ?? "#9ca3af" }}
                />
                {tag.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag.id);
                  }}
                  disabled={disabled}
                  aria-label={t("pages.ocean.track.quick.tagRemoveAria", {
                    name: tag.name,
                  })}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/10 hover:text-black disabled:opacity-50"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))
          )}
          <span className="ml-auto text-black/45">
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-black/45" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder={t("pages.ocean.track.quick.tagsSearch")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/45"
          />
        </div>
        <ul className="max-h-[240px] overflow-y-auto p-1">
          {filtered.length === 0 && !canCreate ? (
            <li className="px-3 py-4 text-center text-xs text-black/55">
              {t("pages.ocean.track.quick.tagsNoResults")}
            </li>
          ) : (
            filtered.map((tag) => {
              const isSelected = selectedIds.includes(tag.id);
              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-black/[0.04] text-black"
                        : "text-black/70 hover:bg-black/[0.03] hover:text-black",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color ?? "#9ca3af" }}
                      />
                      <span className="truncate">{tag.name}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-black" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        {canCreate && (
          <div className="border-t border-black/5 p-1">
            <button
              type="button"
              onClick={handleCreate}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-black/80 transition-colors hover:bg-black/[0.03] hover:text-black"
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-black/50" />
              <span className="truncate">
                {t("pages.ocean.track.quick.tagsCreateNew", {
                  name: trimmedQuery,
                })}
              </span>
            </button>
          </div>
        )}
        <div className="border-t border-black/5 px-3 py-2 text-[11px] text-black/55">
          {t("pages.ocean.track.quick.tagsManageHint")}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Customer picker — Popover + search + enter-to-create (single select)
// Mirrors TagPicker but constrained to one selection. `— None —` row clears
// the FK without having to open and dismiss the popover.
// ---------------------------------------------------------------------------

function CustomerPicker({
  availableCustomers,
  selectedId,
  disabled,
  onChange,
  onCreateCustomer,
}: {
  availableCustomers: CustomerEntity[];
  selectedId: number | null;
  disabled: boolean;
  onChange: (next: number | null) => void;
  onCreateCustomer: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => availableCustomers.find((c) => c.id === selectedId) ?? null,
    [selectedId, availableCustomers],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return availableCustomers;
    return availableCustomers.filter((c) =>
      c.name.toLowerCase().includes(q),
    );
  }, [availableCustomers, query]);

  const trimmedQuery = query.trim();
  const exactMatch = availableCustomers.find(
    (c) => c.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const canCreate = trimmedQuery !== "" && !exactMatch;

  const handleSelect = (id: number | null) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const handleCreate = () => {
    if (!canCreate) return;
    onCreateCustomer(trimmedQuery);
    setQuery("");
    setOpen(false);
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
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-3 text-left text-sm transition-colors hover:border-black/20 disabled:opacity-50",
            open && "border-black/30",
          )}
        >
          {selected ? (
            <span className="truncate text-black">{selected.name}</span>
          ) : (
            <span className="truncate text-black/45">
              {t("pages.ocean.track.quick.customerPlaceholder")}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-black/55" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-black/45" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                handleCreate();
              }
            }}
            placeholder={t("pages.ocean.track.quick.customerSearch")}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/45"
          />
        </div>
        <ul className="max-h-[240px] overflow-y-auto p-1">
          {/* "None" row — always shown so the user can clear the selection
              without closing the popover. */}
          <li>
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                selectedId === null
                  ? "bg-black/[0.04] text-black"
                  : "text-black/55 hover:bg-black/[0.03] hover:text-black",
              )}
            >
              <span className="truncate italic">
                {t("pages.ocean.track.quick.customerNone")}
              </span>
              {selectedId === null && (
                <Check className="h-3.5 w-3.5 shrink-0 text-black" />
              )}
            </button>
          </li>
          {filtered.length === 0 && !canCreate ? (
            <li className="px-3 py-4 text-center text-xs text-black/55">
              {t("pages.ocean.track.quick.customerNoResults")}
            </li>
          ) : (
            filtered.map((customer) => {
              const isSelected = customer.id === selectedId;
              return (
                <li key={customer.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(customer.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-black/[0.04] text-black"
                        : "text-black/70 hover:bg-black/[0.03] hover:text-black",
                    )}
                  >
                    <span className="truncate">{customer.name}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-black" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
        {canCreate && (
          <div className="border-t border-black/5 p-1">
            <button
              type="button"
              onClick={handleCreate}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-black/80 transition-colors hover:bg-black/[0.03] hover:text-black"
            >
              <Plus className="h-3.5 w-3.5 shrink-0 text-black/50" />
              <span className="truncate">
                {t("pages.ocean.track.quick.customerCreateNew", {
                  name: trimmedQuery,
                })}
              </span>
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Recently Added — reuses ocean shipments list query (take: 5)
//
// Column layout is **user-configurable** via the ColumnSettingsButton at the
// top-right — fixed columns (MBL / Line / Actions) stay locked, the rest
// can be toggled off or reordered. Resolved column order comes from the
// `useResolvedColumns` helper which reads from `grid-column-config` store.
// ---------------------------------------------------------------------------

// Stable grid identity — used as the persistence key in grid-column-config.
const RECENTLY_ADDED_DOMAIN = "ocean.track.recentlyAdded";

type RecentlyAddedColumnKey =
  | "request"
  | "line"
  | "reference"
  | "customer"
  | "added"
  | "status"
  | "actions";

type RecentlyAddedColumnDef = GridColumnDefinition & {
  key: RecentlyAddedColumnKey;
  headerClassName?: string;
  cellClassName?: string;
  // Per-column min width hint used to size the header grid so horizontal
  // scrolling kicks in before content starts overflowing.
  minWidth: number;
  render: (args: {
    shipment: OceanShipmentEntity;
    teamId: string | undefined;
    t: (k: string, opts?: Record<string, unknown>) => string;
  }) => ReactNode;
};

const RECENTLY_ADDED_COLUMNS: RecentlyAddedColumnDef[] = [
  {
    key: "request",
    labelKey: "pages.ocean.track.recently.colRequest",
    fixed: true,
    minWidth: 200,
    render: ({ shipment, teamId }) => (
      <Link
        to={`/app/${teamId}/ocean/shipments/${shipment.id}`}
        className="flex min-w-0 flex-col gap-0.5"
      >
        <span className="truncate font-mono text-sm font-medium text-black">
          {shipment.mbl}
        </span>
        <span className="truncate text-[11px] text-black/55">
          Bill of Lading
        </span>
      </Link>
    ),
  },
  {
    key: "line",
    labelKey: "pages.ocean.track.recently.colLine",
    fixed: true,
    minWidth: 160,
    render: ({ shipment }) => (
      <span className="block truncate text-sm text-black/80">
        {shipment.carrier?.name ?? "-"}
      </span>
    ),
  },
  {
    key: "reference",
    labelKey: "pages.ocean.track.recently.colReference",
    minWidth: 140,
    render: ({ shipment }) => {
      const refs = shipment.ref_numbers ?? [];
      const firstRef = refs[0];
      const extraRefs = Math.max(refs.length - 1, 0);
      if (!firstRef) {
        return <span className="text-black/40">-</span>;
      }
      return (
        <span className="flex min-w-0 items-center gap-1">
          <span className="truncate font-mono text-sm text-black/80">
            {firstRef}
          </span>
          {extraRefs > 0 && (
            <span className="shrink-0 rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-black/55">
              +{extraRefs}
            </span>
          )}
        </span>
      );
    },
  },
  {
    key: "customer",
    labelKey: "pages.ocean.track.recently.colCustomer",
    minWidth: 140,
    render: ({ shipment }) =>
      shipment.customer ? (
        <span className="block truncate text-sm text-black/80">
          {shipment.customer.name}
        </span>
      ) : (
        <span className="text-black/40">-</span>
      ),
  },
  {
    key: "added",
    labelKey: "pages.ocean.track.recently.colAdded",
    minWidth: 110,
    render: ({ shipment }) => (
      <span className="block truncate text-xs text-black/50">
        {shipment.created_at ? formatTimeAgo(shipment.created_at) : "-"}
      </span>
    ),
  },
  {
    key: "status",
    labelKey: "pages.ocean.track.recently.colStatus",
    minWidth: 120,
    render: ({ shipment }) => <StatusBadge status={shipment.status} />,
  },
  {
    key: "actions",
    labelKey: "pages.ocean.track.recently.colActions",
    fixed: true,
    minWidth: 90,
    headerClassName: "text-right",
    cellClassName: "text-right",
    render: ({ shipment, teamId, t }) => (
      <Link
        to={`/app/${teamId}/ocean/shipments/${shipment.id}`}
        className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1 text-xs font-medium text-black/70 transition-colors hover:border-black/20 hover:text-black"
      >
        {t("pages.ocean.track.recently.view")}
      </Link>
    ),
  },
];

function RecentlyAdded() {
  const { t } = useTranslation();
  const params = useParams();
  const teamId = params.teamId;

  const { data, error, isPending } = useOceanShipmentsData({ take: 5 });

  const columns = useResolvedColumns(
    RECENTLY_ADDED_DOMAIN,
    RECENTLY_ADDED_COLUMNS,
  ) as RecentlyAddedColumnDef[];

  // Total min-width of the content grid. Triggers the grid-level horizontal
  // scrollbar once the host card is narrower than this — the *page* only
  // starts scrolling once it's narrower than the global `defaultMinWidth`
  // (see lib/layout-constants.ts), so the grid scroll always shows first.
  const tableMinWidth = columns.reduce((sum, c) => sum + c.minWidth, 0);

  return (
    <section className="rounded-2xl border border-black/10 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-6 py-4">
        <h2 className="text-sm font-semibold text-black">
          {t("pages.ocean.track.recently.title")}
        </h2>
        <div className="flex items-center gap-3">
          <Link
            to={`/app/${teamId}/ocean/shipments`}
            className="text-xs text-black/55 underline-offset-2 transition-colors hover:text-black hover:underline"
          >
            {t("pages.ocean.track.recently.viewAll")}
          </Link>
          <ColumnSettingsButton
            domainKey={RECENTLY_ADDED_DOMAIN}
            definitions={RECENTLY_ADDED_COLUMNS}
          />
        </div>
      </div>

      <div className="p-2">
        {error ? (
          <div className="p-4">
            <Fallback />
          </div>
        ) : isPending ? (
          <div className="p-4">
            <Loader />
          </div>
        ) : data.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.03] text-black/45">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-black/70">
              {t("pages.ocean.track.recently.empty")}
            </span>
          </div>
        ) : (
          // `overflow-x-auto` makes the grid itself scroll when its inner
          // `min-width` exceeds the section's available width. The parent
          // section doesn't enforce min-width of its own, so the page-level
          // horizontal scroll (750px floor) only shows up at genuinely
          // narrow viewports — grid scroll appears first.
          <div className="overflow-x-auto">
            <div style={{ minWidth: `${tableMinWidth}px` }}>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-black/5 hover:bg-transparent">
                    {columns.map((col) => (
                      <TableHead
                        key={col.key}
                        style={{ minWidth: `${col.minWidth}px` }}
                        className={cn(
                          "text-xs font-medium text-black/55",
                          col.headerClassName,
                        )}
                      >
                        {t(col.labelKey)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((s) => (
                    <TableRow
                      key={s.id}
                      className="border-b border-black/5 hover:bg-black/[0.02]"
                    >
                      {columns.map((col) => (
                        // Every cell enforces single-line + ellipsis — the
                        // column `render` functions return inline spans/links
                        // that already truncate, but `max-w-0` + `whitespace-nowrap`
                        // on the cell itself is what actually lets truncation
                        // activate inside a table-layout: auto grid.
                        <TableCell
                          key={col.key}
                          style={{ minWidth: `${col.minWidth}px` }}
                          className={cn(
                            "max-w-0 overflow-hidden truncate whitespace-nowrap py-3",
                            col.cellClassName,
                          )}
                        >
                          {col.render({ shipment: s, teamId, t })}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  tracking: "bg-emerald-50 text-emerald-700",
  awaiting_manifest: "bg-slate-100 text-slate-700",
  failed: "bg-red-50 text-red-700",
  stopped: "bg-slate-100 text-slate-700",
  cancelled: "bg-slate-100 text-slate-500",
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const className = STATUS_CLASS[status] ?? "bg-black/[0.04] text-black/60";
  const label =
    status in STATUS_CLASS ? t(`pages.ocean.list.status.${status}`) : status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inline "coming soon" panel — used for Bulk and History tabs
// ---------------------------------------------------------------------------

function InlineComingSoon({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-black/10 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-black/[0.02] text-black/55">
        {icon}
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        <p className="text-xs leading-relaxed text-black/50">{description}</p>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-black/10 px-2 py-1 text-[10px] text-black/50">
        <Sparkles className="h-3 w-3 text-black/55" />
        <span>{t("pages.ocean.track.comingSoonBadge")}</span>
      </div>
    </div>
  );
}
