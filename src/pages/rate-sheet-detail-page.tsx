// /app/:teamId/rates/rate-sheets/:sheetId — 요율 매트릭스 슬롯 상세
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import DetailLayout, { type DetailTab } from "@/components/detail-layout";
import RateGrid from "@/components/rate-sheet/rate-grid";
import RateHistoryTable from "@/components/rate-sheet/rate-history-table";
import RateLookupPanel from "@/components/rate-sheet/rate-lookup-panel";
import { useRateSheetByIdData } from "@/hooks/queries/use-rate-sheet-by-id-data";

export default function RateSheetDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const sheetIdStr = params.sheetId;
  const sheetId = sheetIdStr ? Number(sheetIdStr) : 0;

  const { data, isPending, error } = useRateSheetByIdData(sheetId || null);

  if (!sheetIdStr) return <Navigate to="/app" replace />;
  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!data) return <Fallback />;

  const tabs: DetailTab[] = [
    {
      value: "entries",
      label: t("rateSheet.tabs.entries"),
      content: <RateGrid sheetId={sheetId} kind={data.kind} />,
    },
    {
      value: "history",
      label: t("rateSheet.tabs.history"),
      content: <RateHistoryTable sheetId={sheetId} />,
    },
    {
      value: "lookup",
      label: t("rateSheet.tabs.lookup"),
      content: <RateLookupPanel sheetId={sheetId} kind={data.kind} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-6">
      <DetailLayout
        title={t(`rateSheet.kind.${data.kind}`)}
        subtitle={t("rateSheet.detail.subtitle", {
          group: `#${data.rateGroupId}`,
        })}
        meta={
          <>
            <span>
              {t("rateSheet.field.moveType")}:{" "}
              {data.moveType ? t(`rateSheet.moveType.${data.moveType}`) : "—"}
            </span>
            <span>
              {t("rateSheet.field.rowPoint")}:{" "}
              {data.rowPointId != null ? `#${data.rowPointId}` : "—"}
            </span>
            <span>
              {t("rateSheet.field.openEntryCount")}:{" "}
              {data.openEntryCount.toLocaleString()}
            </span>
          </>
        }
        tabs={tabs}
      />
    </div>
  );
}
