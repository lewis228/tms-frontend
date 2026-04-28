// /app/delivery-orders/:id — deep-link 가능한 풀페이지 detail.
// 같은 데이터 (DeliveryOrderDetail) 를 drawer 가 아니라 풀페이지로.
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import ContainerDrawer from "@/components/container/container-drawer";
import DeliveryOrderDetail from "@/components/delivery-order/delivery-order-detail";
import { useDeliveryOrderByIdData } from "@/hooks/queries/use-delivery-order-by-id-data";

export default function DeliveryOrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const idStr = params.id;
  const idNum = idStr ? Number(idStr) : Number.NaN;
  const valid = Number.isFinite(idNum);

  // hook 은 항상 같은 순서로 호출. 잘못된 id 면 enabled=false 유지.
  const { data, isPending, error } = useDeliveryOrderByIdData(valid ? idNum : null);

  if (!valid) return <Navigate to=".." relative="path" replace />;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate("..", { relative: "path" })}
        >
          <ChevronLeft className="h-4 w-4" /> {t("deliveryOrder.backToList")}
        </Button>
        <h1 className="text-xl font-semibold">
          {t("pages.deliveryOrderDetail.heading")} {data ? `#${data.id}` : ""}
        </h1>
      </div>

      {error && <Fallback />}
      {!error && isPending && <Loader />}
      {!error && !isPending && data && (
        <DeliveryOrderDetail deliveryOrder={data} />
      )}
      <ContainerDrawer />
    </div>
  );
}
