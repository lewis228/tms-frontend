// /app/delivery-orders/:id — deep-link 가능한 풀페이지 detail.
// 같은 데이터 (DeliveryOrderDetail) 를 drawer 가 아니라 풀페이지로.
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import DeliveryOrderDetail from "@/components/delivery-order/delivery-order-detail";
import { useDeliveryOrderByIdData } from "@/hooks/queries/use-delivery-order-by-id-data";

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const idStr = params.id;
  if (!idStr) return <Navigate to="/app/delivery-orders" replace />;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return <Navigate to="/app/delivery-orders" replace />;

  const { data, isPending, error } = useDeliveryOrderByIdData(id);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate("/app/delivery-orders")}
        >
          <ChevronLeft className="h-4 w-4" /> 목록
        </Button>
        <h1 className="text-xl font-semibold">
          D/O {data ? `#${data.id}` : ""}
        </h1>
      </div>

      {error && <Fallback />}
      {!error && isPending && <Loader />}
      {!error && !isPending && data && (
        <DeliveryOrderDetail deliveryOrder={data} />
      )}
    </div>
  );
}
