import {
  useEffect,
  useState,
  type DragEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Check, GripVertical, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useEnsureGridColumnConfig,
  useGridColumnConfig,
  useReorderGridColumnByKey,
  useSetGridColumnVisibility,
  type GridColumnDefinition,
} from "@/store/grid-column-config";
import { cn } from "@/lib/utils";

// Button + popover that toggles column visibility and reorders the
// user-configurable slice of a grid. Matches the Flutter web product grid
// "컬럼 설정" UI:
//   - Fixed columns sit at the top with a greyed checkbox (always on, no
//     drag handle).
//   - Reorderable columns show a real checkbox + a drag grip on the right.
//   - Reordering is HTML5-native drag-and-drop; no extra deps.
//
// Visibility + order are persisted to localStorage via
// `useGridColumnConfigStore` keyed by `domainKey`. The calling grid reads
// the resolved column list with the `useResolvedColumns` helper in this
// file — keeping the store and the UI hook colocated avoids stale imports.

export default function ColumnSettingsButton({
  domainKey,
  definitions,
}: {
  domainKey: string;
  definitions: GridColumnDefinition[];
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Make sure the persisted slot exists / is in sync with the current
  // definition list before the popover opens. Runs on every mount because
  // `ensureDomain` is a no-op when nothing's changed.
  const ensureDomain = useEnsureGridColumnConfig();
  useEffect(() => {
    ensureDomain(domainKey, definitions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainKey]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("common.grid.columnSettings")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-black/60 transition-colors hover:border-black/10 hover:bg-black/[0.02] hover:text-black"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>{t("common.grid.columnSettings")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="end">
        <ColumnList domainKey={domainKey} definitions={definitions} />
      </PopoverContent>
    </Popover>
  );
}

function ColumnList({
  domainKey,
  definitions,
}: {
  domainKey: string;
  definitions: GridColumnDefinition[];
}) {
  const { t } = useTranslation();
  const config = useGridColumnConfig(domainKey);
  const setVisibility = useSetGridColumnVisibility();
  const reorderByKey = useReorderGridColumnByKey();

  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  if (!config) return null;

  const fixed = definitions.filter((d) => d.fixed);
  const reorderable = config.order
    .map((key) => definitions.find((d) => d.key === key && !d.fixed))
    .filter((d): d is GridColumnDefinition => d !== undefined);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, key: string) => {
    setDragKey(key);
    // Required for Firefox to actually start a drag.
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, key: string) => {
    if (!dragKey || dragKey === key) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(key);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetKey: string) => {
    e.preventDefault();
    if (!dragKey || dragKey === targetKey) {
      setDragKey(null);
      setDragOverKey(null);
      return;
    }
    const targetIndex = reorderable.findIndex((d) => d.key === targetKey);
    if (targetIndex !== -1) {
      reorderByKey(domainKey, dragKey, targetIndex);
    }
    setDragKey(null);
    setDragOverKey(null);
  };

  const handleDragEnd = () => {
    setDragKey(null);
    setDragOverKey(null);
  };

  return (
    <div className="max-h-[360px] overflow-y-auto p-1">
      {fixed.map((def) => (
        <FixedRow key={def.key} label={t(def.labelKey)} />
      ))}
      {reorderable.map((def) => {
        const visible = config.visible[def.key] ?? true;
        const isDraggingSelf = dragKey === def.key;
        const isDropTarget = dragOverKey === def.key && dragKey !== def.key;
        return (
          <div
            key={def.key}
            draggable
            onDragStart={(e) => handleDragStart(e, def.key)}
            onDragOver={(e) => handleDragOver(e, def.key)}
            onDrop={(e) => handleDrop(e, def.key)}
            onDragEnd={handleDragEnd}
            onDragLeave={() => {
              // Only clear if leaving the specific row that was hovered —
              // guards against flicker when moving between siblings.
              setDragOverKey((prev) => (prev === def.key ? null : prev));
            }}
            className={cn(
              "flex h-9 items-center gap-2 rounded-md px-2 transition-colors",
              isDraggingSelf && "opacity-40",
              isDropTarget && "bg-black/[0.04]",
            )}
          >
            <button
              type="button"
              onClick={() => setVisibility(domainKey, def.key, !visible)}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
              style={{
                backgroundColor: visible ? "#111827" : "transparent",
                borderColor: visible ? "#111827" : "#d1d5db",
              }}
              aria-label={t("common.grid.toggleColumn", {
                label: t(def.labelKey),
              })}
            >
              {visible && <Check className="h-2.5 w-2.5 text-white" />}
            </button>
            <span className="flex-1 truncate text-xs text-black/80">
              {t(def.labelKey)}
            </span>
            <span
              className="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center text-black/40 active:cursor-grabbing"
              aria-label={t("common.grid.dragHandle")}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FixedRow({ label }: { label: string }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md px-2">
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
        style={{ backgroundColor: "#d1d5db", borderColor: "#d1d5db" }}
        aria-hidden
      >
        <Check className="h-2.5 w-2.5 text-white" />
      </span>
      <span className="flex-1 truncate text-xs text-black/40">{label}</span>
      <span className="h-5 w-5 shrink-0" aria-hidden />
    </div>
  );
}

// The resolver hook lives in `use-resolved-columns.ts` so this file only
// exports a component (fast-refresh requires one component per file).
