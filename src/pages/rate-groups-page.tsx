import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import RateMatrixTab from "@/components/rate-group/rate-matrix-tab";
import DriverRateAssignmentList from "@/components/driver-rate-assignment/driver-rate-assignment-list";

// 선택 탭을 검정 배경/흰 글씨로 명확하게. base-ui Tabs 는 data-active 를 쓰므로
// 래퍼의 data-[selected]: 기본 선택 스타일이 안 먹는다 → 제어형으로 직접 표시.
const TAB_SELECTED = "bg-primary text-primary-foreground font-medium shadow-sm";

const TABS = ["ZONE", "CITY", "MILE", "HOURLY", "DRIVER"] as const;
const TAB_LABEL: Record<(typeof TABS)[number], string> = {
  ZONE: "rateGroup.tabs.zone",
  CITY: "rateGroup.tabs.city",
  MILE: "rateGroup.tabs.mile",
  HOURLY: "rateGroup.tabs.hourly",
  DRIVER: "rateGroup.tabs.driver",
};

export default function RateGroupsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<string>("ZONE");

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("rateGroup.hub.title")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("rateGroup.hub.subtitle")}
      </p>

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
        <TabsList>
          {TABS.map((value) => (
            <TabsTab
              key={value}
              value={value}
              className={tab === value ? TAB_SELECTED : ""}
            >
              {t(TAB_LABEL[value])}
            </TabsTab>
          ))}
        </TabsList>

        <TabsPanel value="ZONE">
          <RateMatrixTab method="ZONE" />
        </TabsPanel>
        <TabsPanel value="CITY">
          <RateMatrixTab method="CITY" />
        </TabsPanel>
        <TabsPanel value="MILE">
          <RateMatrixTab method="MILE" />
        </TabsPanel>
        <TabsPanel value="HOURLY">
          <RateMatrixTab method="HOURLY" />
        </TabsPanel>
        <TabsPanel value="DRIVER">
          <DriverRateAssignmentList />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
