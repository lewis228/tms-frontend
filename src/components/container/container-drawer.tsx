// Container Drawer — URL ?container=:id 와 양방향 동기화.
// 탭 4개: 기본정보 / Legs / 이벤트 / 정산(stub).
//
// D/O Drawer 와 같은 sheet 패턴. ?do 와 ?container 가 동시에 있으면
// 둘 다 열림 (D/O drawer 위에 container drawer 가 stack).
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import ContainerForm from "@/components/container/container-form";
import ContainerLegList from "@/components/container/container-leg-list";
import ContainerEventTimeline from "@/components/container/container-event-timeline";
import ContainerSettlement from "@/components/container/container-settlement";
import { useContainerByIdData } from "@/hooks/queries/use-container-by-id-data";

type Tab = "basic" | "legs" | "events" | "settlement";

const TABS: { value: Tab; labelKey: string }[] = [
  { value: "basic", labelKey: "container.tab.basic" },
  { value: "legs", labelKey: "container.tab.legs" },
  { value: "events", labelKey: "container.tab.events" },
  { value: "settlement", labelKey: "container.tab.settlement" },
];

export default function ContainerDrawer() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const idStr = searchParams.get("container");
  const id = idStr ? Number(idStr) : null;
  const [tab, setTab] = useState<Tab>("basic");

  const { data, isPending, error } = useContainerByIdData(id);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("container");
      setSearchParams(next, { replace: true });
    }
  };

  const title = data
    ? `${t("container.drawer.title")} ${data.containerNumber ?? `#${data.id}`}`
    : t("container.drawer.title");

  return (
    <Sheet open={!!id} onOpenChange={handleOpenChange}>
      <SheetContent className="!max-w-3xl !w-full overflow-y-auto sm:!max-w-3xl">
        <SheetHeader>
          <SheetTitle className="font-sans">{title}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6 pt-3">
          {error && <Fallback />}
          {!error && isPending && <Loader />}
          {!error && !isPending && data && (
            <>
              <div className="mb-4 flex border-b">
                {TABS.map((t0) => (
                  <button
                    key={t0.value}
                    type="button"
                    onClick={() => setTab(t0.value)}
                    className={`relative px-4 py-2 text-sm transition-colors ${
                      tab === t0.value
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(t0.labelKey)}
                    {tab === t0.value && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
              {tab === "basic" && <ContainerForm container={data} />}
              {tab === "legs" && <ContainerLegList container={data} />}
              {tab === "events" && (
                <ContainerEventTimeline containerId={data.id} />
              )}
              {tab === "settlement" && <ContainerSettlement container={data} />}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
