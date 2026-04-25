// 앱 상단 슬림 헤더. 우측에 Bell. (Search/Theme 는 추후 phase.)
import NotificationsBell from "@/components/layout/notifications-bell";

export default function AppHeader() {
  return (
    <header className="flex h-12 items-center justify-end gap-2 border-b bg-background px-4">
      <NotificationsBell />
    </header>
  );
}
