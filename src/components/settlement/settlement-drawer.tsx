// Settlement Right Drawer — URL ?settlement=:id 동기화.
import { useSearchParams } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import SettlementDetail from "@/components/settlement/settlement-detail";
import { useSettlementByIdData } from "@/hooks/queries/use-settlement-by-id-data";

export default function SettlementDrawer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idStr = searchParams.get("settlement");
  const id = idStr ? Number(idStr) : null;

  const { data, isPending, error } = useSettlementByIdData(id);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const next = new URLSearchParams(searchParams);
      next.delete("settlement");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <Sheet open={!!id} onOpenChange={handleOpenChange}>
      <SheetContent className="!max-w-2xl !w-full overflow-y-auto sm:!max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-sans">
            {data ? `Settlement ${String(data.id).slice(0, 8)}` : "Settlement"}
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          {error && <Fallback />}
          {!error && isPending && <Loader />}
          {!error && !isPending && data && (
            <SettlementDetail settlement={data} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
