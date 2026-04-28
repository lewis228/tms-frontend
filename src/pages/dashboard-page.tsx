// Dashboard — KPI 카드 + status 도넛 + 임박 D/O 표.
//
// 데이터 fetch 전략: 클라 측 집계. 백엔드 dashboard endpoint 없음.
// list endpoint (page size 100~200) 합쳐서 KPI / 차트 / urgent 모두 같은 캐시 재활용.
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import KpiCard from "@/components/dashboard/kpi-card";
import StatusDonut from "@/components/dashboard/status-donut";
import UrgentList from "@/components/dashboard/urgent-list";
import { pickUrgent } from "@/components/dashboard/urgent";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { fetchContainers } from "@/api/container";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeliveryOrdersData } from "@/hooks/queries/use-delivery-orders-data";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useLegsData } from "@/hooks/queries/use-legs-data";
import { useSettlementsData } from "@/hooks/queries/use-settlements-data";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { STATUS_ORDER } from "@/lib/delivery-order";
import { useCurrentUser } from "@/store/auth";
import type { ContainerEntity, DeliveryOrderEntity } from "@/types";

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
  const { t } = useTranslation();
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
  const { data: containersData } = useQuery({
    queryKey: QUERY_KEYS.container.list({ size: 200 }),
    queryFn: () => fetchContainers({ size: 200 }),
  });

  const stats = useMemo(() => {
    const orders = doData?.items ?? [];
    const containers: ContainerEntity[] = containersData?.items ?? [];
    const inProgress = orders.filter((o) => o.status !== "COMPLETED");
    // H-1: appointments 가 컨테이너로 이전. KPI 는 컨테이너 단위로 집계.
    const todayPickup = containers.filter((c) => isToday(c.pickupAppointment));
    const todayDelivery = containers.filter((c) => isToday(c.deliveryAppointment));
    const todayReturn = containers.filter((c) => isToday(c.returnAppointment));

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
      containers,
    };
  }, [doData, legsData, driversData, settlementsData, containersData]);

  const urgent = useMemo(
    () =>
      pickUrgent(
        stats.orders as DeliveryOrderEntity[],
        stats.containers as ContainerEntity[],
      ),
    [stats.orders, stats.containers],
  );

  if (doError || legsError || driversError || settlementsError)
    return <Fallback />;
  if (doPending || legsPending || driversPending || settlementsPending)
    return <Loader />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email ?? "—"} · {user?.role ?? "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label={t("dashboard.kpi.inProgress")}
          value={stats.inProgress}
          hint={t("dashboard.kpi.inProgressHint", {
            count: stats.orders.length,
          })}
          to="dispatch?view=board"
        />
        <KpiCard
          label={t("dashboard.kpi.todayPDR")}
          value={`${stats.todayPickup}/${stats.todayDelivery}/${stats.todayReturn}`}
          hint={t("dashboard.kpi.todayPDRHint")}
          to="dispatch?view=timeline"
        />
        <KpiCard
          label={t("dashboard.kpi.pendingLegs")}
          value={stats.pendingLegs}
          hint={t("dashboard.kpi.pendingLegsHint")}
          to="dispatch/drivers"
        />
        <KpiCard
          label={t("dashboard.kpi.unsettled")}
          value={stats.unsettled}
          hint={t("dashboard.kpi.unsettledHint")}
          tone={stats.unsettled > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-md border bg-background p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("dashboard.section.statusDistribution")}
          </h2>
          <StatusDonut data={stats.donut} />
        </section>

        <section className="flex flex-col gap-3">
          <UrgentList rows={urgent} customers={customersData?.items ?? []} />
          <KpiCard
            label={t("dashboard.kpi.activeDrivers")}
            value={`${stats.activeDrivers} / ${stats.totalDrivers}`}
            hint={t("dashboard.kpi.activeDriversHint")}
          />
        </section>
      </div>
    </div>
  );
}
