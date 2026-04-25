import { useState } from "react";
import { useTranslation } from "react-i18next";
import CarrierPerformanceChart from "@/components/reports/carrier-performance-chart";
import CostBreakdownChart from "@/components/reports/cost-breakdown-chart";
import DelayedRoutesCard from "@/components/reports/delayed-routes-card";
import DestinationDonut from "@/components/reports/destination-donut";
import DwellTimeChart from "@/components/reports/dwell-time-chart";
import ExceptionTimeline from "@/components/reports/exception-timeline";
import ReportKpiCard from "@/components/reports/report-kpi-card";
import ShipmentsVolumeChart from "@/components/reports/shipments-volume-chart";
import TimeRangePicker from "@/components/reports/time-range-picker";
import TopCarriersCard from "@/components/reports/top-carriers-card";
import {
  REPORT_KPIS,
  type ReportTimeRange,
} from "@/components/reports/mock-reports";

// Reports overview page. Layout mirrors the reference analytics board
// translated to shipping metrics:
//   ┌ KPI strip (4 cards)                                      Today ▾ ┐
//   ├ Shipments Volume (line, YoY)       │   Top Carriers (list)       ┤
//   ├ Carrier Performance (bar)          │   Destination Region (donut)┤
//
// Phase 1 uses MOCK_REPORTS for every tile — swap to query hooks once the
// backend Reports endpoints are in place. The page owns the time range;
// child components read their own slice of mock data today, but the same
// `range` will become a query parameter later.
export default function ReportsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState<ReportTimeRange>("today");

  return (
    <div className="flex flex-col gap-6 p-7">
      {/* Header row: title/subtitle on the left, time picker pinned to
          the subtitle line on the right. */}
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-black">
            {t("pages.reports.title")}
          </h1>
          <p className="text-sm text-black/55">
            {t("pages.reports.description")}
          </p>
        </div>
        <TimeRangePicker value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {REPORT_KPIS.map((kpi) => (
          <ReportKpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Middle row: line chart (2/3) + top carriers (1/3) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ShipmentsVolumeChart />
        </div>
        <TopCarriersCard />
      </div>

      {/* Bottom row: carrier performance bar + destination donut */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CarrierPerformanceChart />
        <DestinationDonut />
      </div>

      {/* Deep-dive row: exception timeline full width */}
      <ExceptionTimeline />

      {/* Dwell time + cost breakdown side-by-side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DwellTimeChart />
        <CostBreakdownChart />
      </div>

      {/* Top delayed routes */}
      <DelayedRoutesCard />
    </div>
  );
}
