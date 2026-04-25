// 비로그인 가드 — 이미 로그인 상태면 /app/dashboard 로.
import { Navigate, Outlet } from "react-router-dom";

import GlobalLoader from "@/components/global-loader";
import { useCurrentUser, useIsBootstrapped } from "@/store/auth";

export default function GuestOnlyLayout() {
  const isBootstrapped = useIsBootstrapped();
  const user = useCurrentUser();
  if (!isBootstrapped) return <GlobalLoader />;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <Outlet />;
}
