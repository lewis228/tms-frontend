// Dashboard — KPI 카드 + status 도넛 + 임박 D/O 표.
//
// 데이터 fetch 전략: 클라 측 집계. 백엔드 dashboard endpoint 없음.
// list endpoint (page size 100~200) 합쳐서 KPI / 차트 / urgent 모두 같은 캐시 재활용.
import { useMemo } from "react";

import KpiCard from "@/components/dashboard/kpi-card";
import StatusDonut from "@/components/dashboard/status-donut";
import UrgentList from "@/components/dashboard/urgent-list";
import { pickUrgent } from "@/components/dashboard/urgent";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeliveryOrdersData } from "@/hooks/queries/use-delivery-orders-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useLegsData } from "@/hooks/queries/use-legs-data";
import { useSettlementsData } from "@/hooks/queries/use-settlements-data";
import { STATUS_ORDER } from "@/lib/delivery-order";
import { useCurrentUser } from "@/store/auth";
import type { DeliveryOrderEntity } from "@/types";

function isToday(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();

  const { data: doData, isPending: doPending, error: doError } =
    useDeliveryOrdersData(1);
  const { data: legsData, isPending: legsPending, error: legsError } =
    useLegsData(1, 100);
  const { data: driversData, isPending: driversPending, error: driversError } =
    useDriversData(1);
  const {
    data: settlementsData,
    isPending: settlementsPending,
    error: settlementsError,
  } = useSettlementsData(1, 100);
  const { data: customersData } = useCustomersData(1);

  const stats = useMemo(() => {
    const orders = doData?.items ?? [];
    const inProgress = orders.filter((o) => o.status !== "COMPLETED");
    const todayPickup = orders.filter((o) => isToday(o.pickupAppointment));
    const todayDelivery = orders.filter((o) =>
      isToday(o.deliveryAppointment),
    );
    const todayReturn = orders.filter((o) => isToday(o.returnAppointment));

    const legs = legsData?.items ?? [];
    const pendingLegs = legs.filter(
      (l) => l.status === "PENDING" || l.status === "IN_TRANSIT",
    );

    const drivers = driversData?.items ?? [];
    const activeDrivers = drivers.filter((d) => d.isActive);

    const settlements = settlementsData?.items ?? [];
    const unsettled = settlements.filter(
      (s) => s.settlementStatus !== "APPROVED",
    );

    const byStatus: Record<string, number> = {};
    for (const s of STATUS_ORDER) byStatus[s] = 0;
    for (const o of orders) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

    return {
      inProgress: inProgress.length,
      todayPickup: todayPickup.length,
      todayDelivery: todayDelivery.length,
      todayReturn: todayReturn.length,
      pendingLegs: pendingLegs.length,
      activeDrivers: activeDrivers.length,
      totalDrivers: drivers.length,
      unsettled: unsettled.length,
      donut: STATUS_ORDER.map((s) => ({
        status: s,
        count: byStatus[s] ?? 0,
      })),
      orders,
    };
  }, [doData, legsData, driversData, settlementsData]);

  const urgent = useMemo(
    () => pickUrgent(stats.orders as DeliveryOrderEntity[]),
    [stats.orders],
  );

  if (doError || legsError || driversError || settlementsError)
    return <Fallback />;
  if (doPending || legsPending || driversPending || settlementsPending)
    return <Loader />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email ?? "—"} · {user?.role ?? "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="진행 중 D/O"
          value={stats.inProgress}
          hint={`전체 ${stats.orders.length}건 중`}
          to="/app/dispatch?view=board"
        />
        <KpiCard
          label="오늘 픽업/배송/반납"
          value={`${stats.todayPickup}/${stats.todayDelivery}/${stats.todayReturn}`}
          hint="약속된 D/O 건수"
          to="/app/dispatch?view=timeline"
        />
        <KpiCard
          label="미완료 Leg"
          value={stats.pendingLegs}
          hint="PENDING + IN_TRANSIT"
          to="/app/dispatch/drivers"
        />
        <KpiCard
          label="미정산"
          value={stats.unsettled}
          hint="APPROVED 외 settlement"
          tone={stats.unsettled > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-md border bg-background p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            상태별 D/O 분포
          </h2>
          <StatusDonut data={stats.donut} />
        </section>

        <section className="flex flex-col gap-3">
          <UrgentList rows={urgent} customers={customersData?.items ?? []} />
          <KpiCard
            label="활성 기사"
            value={`${stats.activeDrivers} / ${stats.totalDrivers}`}
            hint="활성 / 전체"
          />
        </section>
      </div>
    </div>
  );
}
