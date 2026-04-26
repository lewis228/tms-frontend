// Right Drawer — URL ?do=:id 와 양방향 동기화.
// useSearchParams 의 `do` 가 있으면 열림, 닫으면 query 제거.
//
// 섹션:
// - 상태 + Status Mover (다음 단계 버튼)
// - 기본 정보 (B/L / Booking / 컨테이너 / 고객사)
// - 일정 (ETA / 픽업/배송/반납 약속, demurrage/detention LFD)
// - 게이트 (bl_released, pier_pass_paid, customs_cleared)
// - 메타 (vessel/terminal/delivery_location/return_location/chassis)
// - 메모 + Leg Timeline (P4-F)
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import DeliveryOrderDetail from "@/components/delivery-order/delivery-order-detail";
import { useDeliveryOrderByIdData } from "@/hooks/queries/use-delivery-order-by-id-data";

export default function DeliveryOrderDrawer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idStr = searchParams.get("do");
  const id = idStr ? Number(idStr) : null;

  const { data, isPending, error } = useDeliveryOrderByIdData(id);

  // URL 의 do 가 사라지면 닫기 처리는 자동 (open=false).
  // 닫기 콜백에선 do 만 제거.
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("do");
      setSearchParams(next, { replace: true });
    }
  };

  // ESC 등 외부 close 시 위 핸들러 동작. 이펙트로 추가 처리 불필요.
  useEffect(() => {
    // no-op: id 변동 시 useDeliveryOrderByIdData 가 자동 fetch.
  }, [id]);

  return (
    <Sheet open={!!id} onOpenChange={handleOpenChange}>
      <SheetContent className="!max-w-2xl !w-full overflow-y-auto sm:!max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-sans">
            {data ? `D/O ${data.containerNumber ?? String(data.id).slice(0, 8)}` : "D/O"}
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          {error && <Fallback />}
          {!error && isPending && <Loader />}
          {!error && !isPending && data && (
            <DeliveryOrderDetail deliveryOrder={data} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
