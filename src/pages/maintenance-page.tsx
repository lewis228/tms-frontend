import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/auth-layout";

export default function MaintenancePage() {
  const { t } = useTranslation();
  return (
    <AuthLayout>
      <div className="flex flex-col items-center py-8">
        <h1 className="mb-4 text-4xl font-semibold leading-tight text-black">
          {t("pages.maintenance.title")}
        </h1>
        <img
          src="/images/illustration-maintenance.svg"
          alt={t("pages.maintenance.alt")}
          className="mb-6 h-48 w-48"
        />
        <p className="text-sm text-black/55">
          {t("pages.maintenance.needSupport")}
        </p>
        <a
          href="mailto:byewind@twitter.com"
          className="text-sm text-[#adadfb] hover:underline"
        >
          byewind@twitter.com
        </a>
      </div>
    </AuthLayout>
  );
}
