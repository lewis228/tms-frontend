import { Bell, Megaphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  titleKey: string;
  date: string;
};

const ANNOUNCEMENTS: Announcement[] = [
  { id: "1", titleKey: "announcements.items.mobileTab", date: "2026-04-20" },
  { id: "2", titleKey: "announcements.items.fileAttachment", date: "2026-03-27" },
  { id: "3", titleKey: "announcements.items.customDocs", date: "2026-03-23" },
  { id: "4", titleKey: "announcements.items.labelPrint", date: "2026-02-23" },
  { id: "5", titleKey: "announcements.items.labelDesign", date: "2026-01-15" },
  { id: "6", titleKey: "announcements.items.customReport", date: "2025-12-02" },
  { id: "7", titleKey: "announcements.items.priceTemplate", date: "2025-11-25" },
];

export default function AnnouncementsPopover() {
  const { t } = useTranslation();
  const isEmpty = ANNOUNCEMENTS.length === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-black/55 transition-colors hover:bg-black/[0.04] hover:text-black"
          aria-label={t("rightPanel.notifications")}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] overflow-hidden rounded-2xl border-black/10 p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-black">
            {t("announcements.title")}
          </h3>
        </div>
        {isEmpty ? (
          <div className="flex items-center justify-center px-4 py-10 text-xs text-black/55">
            {t("announcements.empty")}
          </div>
        ) : (
          <ul className="max-h-[420px] overflow-y-auto py-1">
            {ANNOUNCEMENTS.map((a, i) => (
              <li key={a.id}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-black/[0.04]",
                    i !== ANNOUNCEMENTS.length - 1 &&
                      "border-b border-black/[0.04]",
                  )}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/[0.04] text-black/70">
                    <Megaphone className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-black">
                      {t(a.titleKey)}
                    </span>
                    <span className="text-xs text-black/55">{a.date}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
