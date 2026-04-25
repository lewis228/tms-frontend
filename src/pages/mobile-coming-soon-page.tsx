import { Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MobileComingSoonPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <Smartphone className="mb-4 h-10 w-10 text-black" />
      <h1 className="mb-2 text-xl font-semibold text-black">
        {t("comingSoon.pageTitles.mobile")}
      </h1>
      <p className="max-w-sm text-sm text-black/60">
        {t("comingSoon.pageDescriptions.mobile")}
      </p>
    </div>
  );
}
