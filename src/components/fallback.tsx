import { TriangleAlertIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Fallback() {
  const { t } = useTranslation();
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10">
      <TriangleAlertIcon className="size-6" />
      <div className="text-sm">{t("errors.GENERIC_FALLBACK")}</div>
    </div>
  );
}
