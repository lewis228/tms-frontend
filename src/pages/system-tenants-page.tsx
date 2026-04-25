import TenantList from "@/components/tenant/tenant-list";

export default function SystemTenantsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">테넌트 (Tenants)</h1>
      <p className="text-xs text-muted-foreground">
        SUPER_ADMIN 전용. 모든 tenant 의 CRUD. 삭제는 CASCADE 로 연관 데이터까지
        영구 삭제됨.
      </p>
      <TenantList />
    </div>
  );
}
