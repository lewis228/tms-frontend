import { useTranslation } from "react-i18next";

import LocationList from "@/components/location/location-list";

export default function MasterLocationsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">{t("pages.master.locations")}</h1>
      <LocationList />
    </div>
  );
}
