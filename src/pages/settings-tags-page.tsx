import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// TMS: tags settings is local-state only for now (UI shell). Wire to a
// backend tags endpoint when introduced.
type SortKey = "name-asc" | "name-desc" | "recent-desc";

type LocalTag = {
  id: number;
  name: string;
  color: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

const INITIAL_TAGS: LocalTag[] = [];

export default function SettingsTagsPage() {
  const { t } = useTranslation();
  const [tags, setTags] = useState<LocalTag[]>(INITIAL_TAGS);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? tags.filter((tag) => tag.name.toLowerCase().includes(q))
      : tags;
    const sorted = [...base].sort((a, b) => {
      if (sortKey === "name-asc") return a.name.localeCompare(b.name);
      if (sortKey === "name-desc") return b.name.localeCompare(a.name);
      const aStamp = a.updatedAt ?? a.createdAt ?? "";
      const bStamp = b.updatedAt ?? b.createdAt ?? "";
      return bStamp.localeCompare(aStamp);
    });
    return sorted;
  }, [tags, query, sortKey]);

  const trimmedNew = newTagName.trim();
  const isDuplicate =
    trimmedNew !== "" &&
    tags.some((tag) => tag.name.toLowerCase() === trimmedNew.toLowerCase());

  const handleCreateTag = () => {
    if (trimmedNew === "" || isDuplicate) return;
    setTags((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: trimmedNew,
        color: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    setNewTagName("");
    setIsCreating(false);
  };

  const handleRenameTag = (id: number, nextName: string) => {
    const trimmed = nextName.trim();
    if (trimmed === "") return;
    setTags((prev) =>
      prev.map((tag) =>
        tag.id === id
          ? { ...tag, name: trimmed, updatedAt: new Date().toISOString() }
          : tag,
      ),
    );
    setEditingId(null);
  };

  const handleDeleteTag = (id: number) => {
    setTags((prev) => prev.filter((tag) => tag.id !== id));
  };

  const showHeroEmpty = tags.length === 0 && query.trim() === "";

  return (
    <div className="flex flex-col gap-7 p-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-black">
          {t("settings.tags.title")}
        </h1>
        <p className="text-sm text-black/55">
          {t("settings.tags.description")}
        </p>
      </div>

      {showHeroEmpty && !isCreating ? (
        <HeroEmptyState onCreate={() => setIsCreating(true)} />
      ) : (
        <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-5">
          <TagsToolbar
            query={query}
            onQueryChange={setQuery}
            sortKey={sortKey}
            onSortChange={setSortKey}
            totalCount={tags.length}
            filteredCount={filteredTags.length}
          />

          {filteredTags.length === 0 && !isCreating ? (
            <EmptyState hasQuery={query.trim() !== ""} />
          ) : (
            <TagsTable
              tags={filteredTags}
              editingId={editingId}
              onStartEdit={setEditingId}
              onCancelEdit={() => setEditingId(null)}
              onCommitEdit={handleRenameTag}
              onDelete={handleDeleteTag}
            />
          )}

          {isCreating ? (
            <CreateTagInlineRow
              value={newTagName}
              onChange={setNewTagName}
              onSubmit={handleCreateTag}
              onCancel={() => {
                setIsCreating(false);
                setNewTagName("");
              }}
              isDuplicate={isDuplicate}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/15 bg-black/[0.015] px-4 py-3 text-xs font-medium text-black/50 transition-colors hover:border-black/25 hover:bg-black/[0.03] hover:text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("settings.tags.createButton")}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

function HeroEmptyState({ onCreate }: { onCreate: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-black/10 bg-white px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/[0.04] text-black/55">
        <Tag className="h-6 w-6" />
      </div>
      <div className="flex max-w-md flex-col gap-1.5">
        <h2 className="text-base font-semibold text-black">
          {t("settings.tags.heroEmptyTitle")}
        </h2>
        <p className="text-sm text-black/50">
          {t("settings.tags.heroEmptyDescription")}
        </p>
      </div>
      <div className="my-1 h-px w-24 bg-black/10" />
      <Button
        type="button"
        onClick={onCreate}
        className="gap-1.5 rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
      >
        <Plus className="h-4 w-4" />
        {t("settings.tags.createButton")}
      </Button>
    </div>
  );
}

function TagsToolbar({
  query,
  onQueryChange,
  sortKey,
  onSortChange,
  totalCount,
  filteredCount,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  sortKey: SortKey;
  onSortChange: (v: SortKey) => void;
  totalCount: number;
  filteredCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] max-w-sm flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/45" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("settings.tags.searchPlaceholder")}
          className="h-9 rounded-xl border-black/10 bg-white pl-8 text-sm placeholder:text-black/45 focus-visible:ring-black/20"
        />
      </div>

      <SortSelect value={sortKey} onChange={onSortChange} />

      <div className="ml-auto flex items-center gap-2 text-xs text-black/55">
        <span>
          {filteredCount === totalCount
            ? t("settings.tags.tagsCount", { count: totalCount })
            : t("settings.tags.tagsCountFiltered", {
                filtered: filteredCount,
                total: totalCount,
              })}
        </span>
      </div>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const { t } = useTranslation();
  const labelKey: Record<SortKey, string> = {
    "name-asc": "settings.tags.sort.nameAsc",
    "name-desc": "settings.tags.sort.nameDesc",
    "recent-desc": "settings.tags.sort.recentDesc",
  };
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="h-9 appearance-none rounded-xl border border-black/10 bg-white pl-3 pr-8 text-xs font-medium text-black/70 transition-colors hover:border-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
      >
        {(Object.keys(labelKey) as SortKey[]).map((k) => (
          <option key={k} value={k}>
            {t(labelKey[k])}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-black/55" />
    </div>
  );
}

function CreateTagInlineRow({
  value,
  onChange,
  onSubmit,
  onCancel,
  isDuplicate,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isDuplicate: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-black/15 bg-black/[0.015] px-4 py-3">
      <Tag className="h-4 w-4 shrink-0 text-black/55" />
      <Input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder={t("settings.tags.newTagPlaceholder")}
        className="h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
      />
      {isDuplicate && (
        <span className="text-xs text-red-500">
          {t("settings.tags.duplicate")}
        </span>
      )}
      <Button
        type="button"
        size="sm"
        disabled={value.trim() === "" || isDuplicate}
        onClick={onSubmit}
        className="h-7 rounded-lg bg-black px-3 text-xs text-white hover:bg-black/80 disabled:opacity-40"
      >
        {t("settings.tags.addTag")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-7 rounded-lg px-2 text-xs text-black/50 hover:bg-black/[0.04] hover:text-black"
      >
        {t("settings.tags.cancel")}
      </Button>
    </div>
  );
}

function TagsTable({
  tags,
  editingId,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onDelete,
}: {
  tags: LocalTag[];
  editingId: number | null;
  onStartEdit: (id: number) => void;
  onCancelEdit: () => void;
  onCommitEdit: (id: number, next: string) => void;
  onDelete: (id: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-black/10">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[2fr_1.2fr_1.2fr_80px] items-center gap-4 border-b border-black/5 bg-black/[0.02] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-black/55">
          <span>{t("settings.tags.columnName")}</span>
          <span>{t("settings.tags.columnFirstAdded")}</span>
          <span>{t("settings.tags.columnLastUsed")}</span>
          <span className="text-right">{t("settings.tags.columnActions")}</span>
        </div>
        <ul className="flex flex-col divide-y divide-black/5">
          {tags.map((tag) => (
            <TagTableRow
              key={tag.id}
              tag={tag}
              isEditing={editingId === tag.id}
              onStartEdit={() => onStartEdit(tag.id)}
              onCancelEdit={onCancelEdit}
              onCommitEdit={(next) => onCommitEdit(tag.id, next)}
              onDelete={() => onDelete(tag.id)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function TagTableRow({
  tag,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onDelete,
}: {
  tag: LocalTag;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCommitEdit: (next: string) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  if (isEditing) {
    return (
      <EditableTagRow
        key={tag.name}
        tag={tag}
        onCancelEdit={onCancelEdit}
        onCommitEdit={onCommitEdit}
        onDelete={onDelete}
      />
    );
  }
  return (
    <li className="grid grid-cols-[2fr_1.2fr_1.2fr_80px] items-center gap-4 px-5 py-3 transition-colors hover:bg-black/[0.02]">
      <div className="flex min-w-0 items-center">
        <TagChip name={tag.name} color={tag.color} />
      </div>
      <span className="text-sm text-black/50">
        {tag.createdAt ?? t("common.none")}
      </span>
      <span className="text-sm text-black/50">
        {tag.updatedAt ?? t("common.none")}
      </span>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onStartEdit}
          className="h-7 w-7 text-black/45 hover:bg-black/[0.04] hover:text-black"
          aria-label={t("settings.tags.editAria", { name: tag.name })}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 text-black/45 hover:bg-red-500/10 hover:text-red-500"
          aria-label={t("settings.tags.deleteAria", { name: tag.name })}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

function EditableTagRow({
  tag,
  onCancelEdit,
  onCommitEdit,
  onDelete,
}: {
  tag: LocalTag;
  onCancelEdit: () => void;
  onCommitEdit: (next: string) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(tag.name);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === tag.name) {
      onCancelEdit();
      return;
    }
    onCommitEdit(trimmed);
  };

  return (
    <li className="grid grid-cols-[2fr_1.2fr_1.2fr_80px] items-center gap-4 bg-black/[0.015] px-5 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: tag.color ?? "#9ca3af" }}
        />
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") onCancelEdit();
          }}
          onBlur={commit}
          className="h-7 flex-1 rounded-lg border border-black/10 bg-white px-2 text-xs outline-none focus:border-black/30"
        />
      </div>
      <span className="text-sm text-black/50">{tag.createdAt ?? "—"}</span>
      <span className="text-sm text-black/50">{tag.updatedAt ?? "—"}</span>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-7 w-7 text-black/45 hover:bg-red-500/10 hover:text-red-500"
          aria-label={t("settings.tags.deleteAria", { name: tag.name })}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </li>
  );
}

function TagChip({ name, color }: { name: string; color: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-black/80">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color ?? "#9ca3af" }}
      />
      {name}
    </span>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-black/10 bg-black/[0.015] py-12 text-center">
      <Tag className="h-6 w-6 text-black/20" />
      <p className="text-sm font-medium text-black/60">
        {hasQuery
          ? t("settings.tags.emptyTitleFiltered")
          : t("settings.tags.emptyTitle")}
      </p>
      <p className="text-xs text-black/55">
        {hasQuery
          ? t("settings.tags.emptyHintFiltered")
          : t("settings.tags.emptyHint")}
      </p>
    </div>
  );
}
