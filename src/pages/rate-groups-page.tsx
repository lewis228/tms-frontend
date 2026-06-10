import { useTranslation } from "react-i18next";

import { Tabs, TabsList, TabsTab, TabsPanel } from "@/components/ui/tabs";
import RateMatrixTab from "@/components/rate-group/rate-matrix-tab";
import DriverRateAssignmentList from "@/components/driver-rate-assignment/driver-rate-assignment-list";

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
          <TabsTab value="ZONE">{t("rateGroup.tabs.zone")}</TabsTab>
          <TabsTab value="CITY">{t("rateGroup.tabs.city")}</TabsTab>
          <TabsTab value="MILE">{t("rateGroup.tabs.mile")}</TabsTab>
          <TabsTab value="HOURLY">{t("rateGroup.tabs.hourly")}</TabsTab>
          <TabsTab value="DRIVER">{t("rateGroup.tabs.driver")}</TabsTab>
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
