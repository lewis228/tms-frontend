import { useTranslation } from "react-i18next";

import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import RateMatrixTab from "@/components/rate-group/rate-matrix-tab";
import DriverRateAssignmentList from "@/components/driver-rate-assignment/driver-rate-assignment-list";

// 선택된 탭을 검정 배경/흰 글씨로 명확하게(흑백 테마 기본 선택 표시가 약함).
const TAB_SELECTED =
  "data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:font-medium data-[selected]:shadow-sm";

export default function RateGroupsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("rateGroup.hub.title")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("rateGroup.hub.subtitle")}
      </p>

      <Tabs defaultValue="ZONE">
        <TabsList>
          <TabsTab value="ZONE" className={TAB_SELECTED}>
            {t("rateGroup.tabs.zone")}
          </TabsTab>
          <TabsTab value="CITY" className={TAB_SELECTED}>
            {t("rateGroup.tabs.city")}
          </TabsTab>
          <TabsTab value="MILE" className={TAB_SELECTED}>
            {t("rateGroup.tabs.mile")}
          </TabsTab>
          <TabsTab value="HOURLY" className={TAB_SELECTED}>
            {t("rateGroup.tabs.hourly")}
          </TabsTab>
          <TabsTab value="DRIVER" className={TAB_SELECTED}>
            {t("rateGroup.tabs.driver")}
          </TabsTab>
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
