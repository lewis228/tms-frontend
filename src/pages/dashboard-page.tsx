// Phase 2 Foundation placeholder — Phase 7 Dashboard 에서 실제 위젯 추가.
import { useCurrentRole, useCurrentTenantId, useCurrentUser } from "@/store/auth";

export default function DashboardPage() {
  const user = useCurrentUser();
  const role = useCurrentRole();
  const tenantId = useCurrentTenantId();

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        TMS Pro Phase 2 Foundation. 실제 위젯은 Phase 7 에서 추가.
      </p>
      <div className="space-y-1 rounded-lg border p-4 text-sm">
        <div>
          <span className="text-muted-foreground">User:</span>{" "}
          {user?.email ?? "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Role:</span> {role ?? "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Tenant:</span>{" "}
          {tenantId ?? "—"}
        </div>
      </div>
    </div>
  );
}
