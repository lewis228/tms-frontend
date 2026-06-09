// /app/:teamId/billing/settlements/:settlementId — 드라이버 정산 상세
import { Navigate, useParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import SettlementDetail from "@/components/payroll/settlement-detail";
import { usePayrollByIdData } from "@/hooks/queries/use-payroll-by-id-data";

export default function SettlementDetailPage() {
  const params = useParams();
  const idStr = params.settlementId;
  const idNum = idStr ? Number(idStr) : Number.NaN;
  const valid = Number.isFinite(idNum);

  const { data, isPending, error } = usePayrollByIdData(valid ? idNum : null);

  if (!valid) return <Navigate to=".." relative="path" replace />;
  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!data) return <Fallback />;

  return (
    <div className="flex flex-col gap-4 p-6">
      <SettlementDetail settlement={data} />
    </div>
  );
}
