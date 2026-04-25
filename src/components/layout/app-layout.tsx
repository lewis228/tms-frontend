// 앱 레이아웃 — 사이드바 + Header + Outlet.
import { Outlet } from "react-router-dom";

import AppHeader from "@/components/layout/app-header";
import Sidebar from "@/components/layout/sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
