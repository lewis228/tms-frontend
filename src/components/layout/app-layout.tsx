// 앱 레이아웃 — 사이드바 + Outlet.
import { Outlet } from "react-router-dom";

import Sidebar from "@/components/layout/sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
