// 403 — 권한 부족 시 ProtectedRoute 가 리다이렉트.
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">403 — Forbidden</h1>
      <p className="text-muted-foreground">
        해당 페이지에 접근할 권한이 없습니다.
      </p>
      <Link
        to="/app/dashboard"
        className="text-sm underline underline-offset-4"
      >
        Dashboard 로 이동
      </Link>
    </div>
  );
}
