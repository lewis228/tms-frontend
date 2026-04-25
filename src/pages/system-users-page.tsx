import SystemUserList from "@/components/system-user/system-user-list";

export default function SystemUsersPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">시스템 사용자 (System Users)</h1>
      <p className="text-xs text-muted-foreground">
        SUPER_ADMIN 전용. tenant 를 선택하면 그 tenant 의 사용자만 표시됨
        (X-Tenant-Id 헤더 사용). SUPER_ADMIN 은 API 로 생성 불가.
      </p>
      <SystemUserList />
    </div>
  );
}
