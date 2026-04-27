// 403 — 권한 부족 시 ProtectedRoute 가 리다이렉트.
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">{t("auth.forbidden.title")}</h1>
      <p className="text-muted-foreground">{t("auth.forbidden.description")}</p>
      <Link
        to="/app"
        className="text-sm underline underline-offset-4"
      >
        {t("auth.forbidden.back")}
      </Link>
    </div>
  );
}
