// /app/:teamId/billing/invoices/:invoiceId — 고객 청구 상세
import { Navigate, useParams } from "react-router-dom";

import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import InvoiceDetail from "@/components/invoice/invoice-detail";
import { useInvoiceByIdData } from "@/hooks/queries/use-invoice-by-id-data";

export default function InvoiceDetailPage() {
  const params = useParams();
  const idStr = params.invoiceId;
  const idNum = idStr ? Number(idStr) : Number.NaN;
  const valid = Number.isFinite(idNum);

  const { data, isPending, error } = useInvoiceByIdData(valid ? idNum : null);

  if (!valid) return <Navigate to=".." relative="path" replace />;
  if (error) return <Fallback />;
  if (isPending) return <Loader />;
  if (!data) return <Fallback />;

  return (
    <div className="flex flex-col gap-4 p-6">
      <InvoiceDetail invoice={data} />
    </div>
  );
}
