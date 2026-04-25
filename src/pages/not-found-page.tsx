import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "@/components/layout/auth-layout";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <AuthLayout>
      <div className="flex flex-col items-center py-8">
        <h1 className="mb-4 text-4xl font-semibold leading-tight text-black">
          {t("pages.notFound.title")}
        </h1>
        <img
          src="/images/illustration-error.svg"
          alt={t("pages.notFound.alt")}
          className="mb-6 h-48 w-48"
        />
        <Link
          to="/app"
          className="text-xs text-black/55 transition-colors hover:text-black hover:underline"
        >
          {t("pages.notFound.backHome")}
        </Link>
      </div>
    </AuthLayout>
  );
}
