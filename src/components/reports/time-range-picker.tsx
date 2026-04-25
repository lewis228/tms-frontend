import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  TIME_RANGES,
  type ReportTimeRange,
} from "@/components/reports/mock-reports";

// Compact trigger shown at the top-right of the overview header. Mirrors
// the reference "Today ▾" control — a popover listing the available
// ranges. Selection is local page state; backend filtering will hang off
// this value once the query hook lands.
export default function TimeRangePicker({
  value,
  onChange,
}: {
  value: ReportTimeRange;
  onChange: (next: ReportTimeRange) => void;
}) {
  const { t } = useTranslation();
  const active = TIME_RANGES.find((r) => r.id === value) ?? TIME_RANGES[0];

  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-xs font-medium text-black/70 transition-colors hover:bg-black/[0.08] hover:text-black">
        {t(active.labelKey)}
        <ChevronDown className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-36 rounded-xl border-black/10 p-1"
      >
        <ul className="flex flex-col">
          {TIME_RANGES.map((r) => {
            const isActive = r.id === value;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onChange(r.id)}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                    isActive
                      ? "bg-black/[0.06] font-medium text-black"
                      : "text-black/70 hover:bg-black/[0.04] hover:text-black",
                  )}
                >
                  {t(r.labelKey)}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
