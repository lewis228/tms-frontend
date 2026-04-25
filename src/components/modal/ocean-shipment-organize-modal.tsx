import { useMemo, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronDown,
  Hash,
  Plus,
  Search,
  Tag as TagIcon,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateCustomer } from "@/hooks/mutations/customer/use-create-customer";
import { useUpdateOceanShipment } from "@/hooks/mutations/ocean-shipment/use-update-ocean-shipment";
import { useCreateTag } from "@/hooks/mutations/tag/use-create-tag";
import { useTeamCustomersData } from "@/hooks/queries/use-team-customers-data";
import { useTeamTagsData } from "@/hooks/queries/use-team-tags-data";
import { generateErrorMessage } from "@/lib/error";
import { cn } from "@/lib/utils";
import { useOceanShipmentOrganizeModal } from "@/store/ocean-shipment-organize-modal";
import { useTeamScope } from "@/store/team-scope";
import type {
  CustomerEntity,
  OceanShipmentDetail,
  TagEntity,
} from "@/types";

export default function OceanShipmentOrganizeModal() {
  const modal = useOceanShipmentOrganizeModal();

  const handleOpenChange = (open: boolean) => {
    if (!open) modal.actions.close();
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col gap-5 sm:max-w-[640px]">
        <DialogTitle className="font-sans">
          {modal.isOpen ? (
            <OrganizeModalTitle mbl={modal.shipment.mbl} />
          ) : (
            ""
          )}
        </DialogTitle>
        {modal.isOpen && (
          <OrganizeModalBody
            key={modal.shipment.id}
            shipment={modal.shipment}
            onDone={() => modal.actions.close()}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function OrganizeModalTitle({ mbl }: { mbl: string }) {
  const { t } = useTranslation();
  return (
    <span className="flex flex-col gap-1">
      <span>{t("modal.oceanShipmentOrganize.title")}</span>
      <span className="font-mono text-xs font-normal text-black/55">
        {mbl}
      </span>
    </span>
  );
}

function OrganizeModalBody({
  shipment,
  onDone,
}: {
  shipment: OceanShipmentDetail;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const teamId = useTeamScope();
  const { data: availableTags = [] } = useTeamTagsData(teamId);
  const { data: availableCustomers = [] } = useTeamCustomersData(teamId);

  const [customerId, setCustomerId] = useState<number | null>(
    shipment.customer_id,
  );
  const [refNumbers, setRefNumbers] = useState<string[]>(shipment.ref_numbers);
  const [tagIds, setTagIds] = useState<number[]>(
    shipment.tags.map((tag) => tag.id),
  );

  const { mutate: updateShipment, isPending: isUpdatePending } =
    useUpdateOceanShipment({
      onSuccess: () => {
        toast.success(t("pages.ocean.detail.organizeSaveSuccess"), {
          position: "top-center",
        });
        onDone();
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: createTagMutation } = useCreateTag({
    onSuccess: (created) => {
      if (!tagIds.includes(created.id)) {
        setTagIds((prev) => [...prev, created.id]);
      }
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: createCustomerMutation } = useCreateCustomer({
    onSuccess: (created) => setCustomerId(created.id),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleSave = () => {
    updateShipment({
      shipmentId: shipment.id,
      // Pass 0 for "clear" so the PATCH body distinguishes "unset" from
      // "leave unchanged" (undefined). Backend treats 0 | null as clear.
      customer_id: customerId ?? 0,
      ref_numbers: refNumbers,
      tag_ids: tagIds,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <Field icon={<Users className="h-3 w-3 text-black/55" />} label={t("pages.ocean.track.quick.customerLabel")}>
          <CustomerPicker
            availableCustomers={availableCustomers}
            selectedId={customerId}
            disabled={isUpdatePending}
            onChange={setCustomerId}
            onCreateCustomer={(name) => createCustomerMutation({ name })}
          />
        </Field>

        <Field icon={<Hash className="h-3 w-3 text-black/55" />} label={t("pages.ocean.track.quick.refLabel")}>
          <RefNumberInput
            values={refNumbers}
            onChange={setRefNumbers}
            disabled={isUpdatePending}
          />
        </Field>

        <Field icon={<TagIcon className="h-3 w-3 text-black/55" />} label={t("pages.ocean.track.quick.tagsLabel")}>
          <TagPicker
            availableTags={availableTags}
            selectedIds={tagIds}
            disabled={isUpdatePending}
            onChange={setTagIds}
            onCreateTag={(name) => createTagMutation({ name })}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-black/5 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onDone}
          disabled={isUpdatePending}
          className="h-9 rounded-xl px-3 text-sm font-medium text-black/60 hover:bg-black/[0.04] hover:text-black"
        >
          {t("common.cancel")}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isUpdatePending}
          className="h-9 gap-1.5 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-black/80"
        >
          {isUpdatePending ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-black/50">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ref # chip input — migrated from ocean-shipment-detail-page.tsx when the
// inline editor was converted into this modal. ocean-track-page still has
// its own copy; unify under src/components/ocean/ when a third consumer
// appears.
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
// Customer picker — migrated from ocean-shipment-detail-page.tsx.
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
// Tag picker — migrated from ocean-shipment-detail-page.tsx.
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
        .map((id) => availableTags.find((tag) => tag.id === id))
        .filter((tag): tag is TagEntity => tag !== undefined),
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
    (tag) => tag.name.toLowerCase() === trimmedQuery.toLowerCase(),
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
