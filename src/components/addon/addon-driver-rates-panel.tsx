// 한 add-on 의 기사별 금액 override 패널 — 마스터 정의는 그대로, 금액만 기사별로.
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/searchable-select";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { fetchDriver, fetchDrivers } from "@/api/driver";
import { useAddonDriverRatesData } from "@/hooks/queries/use-addon-driver-rates-data";
import { useUpsertAddonDriverRate } from "@/hooks/mutations/addon/use-upsert-addon-driver-rate";
import { useDeleteAddonDriverRate } from "@/hooks/mutations/addon/use-delete-addon-driver-rate";
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { generateErrorMessage } from "@/lib/error";
import { QUERY_KEYS } from "@/lib/constants";
import type { AddonEntity, DriverEntity } from "@/types";

const SEARCH_SIZE = 20;

export default function AddonDriverRatesPanel({ addon }: { addon: AddonEntity }) {
  const { t } = useTranslation();
  const isPercent = addon.unit === "PERCENT";

  const { data: rates, isPending, error } = useAddonDriverRatesData(addon.id);
  const { data: driversData } = useDriversData();
  const driverName = useMemo(() => {
    const m = new Map<number, string>();
    driversData?.items.forEach((d) => m.set(d.id, d.name));
    return m;
  }, [driversData]);

  const [driverId, setDriverId] = useState<number | null>(null);
  const [value, setValue] = useState("");

  const { mutate: upsertRate, isPending: isUpsertPending } =
    useUpsertAddonDriverRate(addon.id, {
      onSuccess: () => {
        toast.success(t("toast.saved"), { position: "top-center" });
        setDriverId(null);
        setValue("");
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });
  const { mutate: deleteRate } = useDeleteAddonDriverRate(addon.id, {
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleAdd = () => {
    if (driverId == null || !value.trim()) return;
    upsertRate(
      isPercent
        ? { driverId, percent: value.trim(), amount: null }
        : { driverId, amount: value.trim(), percent: null },
    );
  };

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-2 rounded-md bg-muted/40 p-3">
      <span className="text-[10px] font-medium uppercase text-muted-foreground">
        {t("addon.driverRates.title")} — {addon.code} (
        {t("addon.driverRates.defaultValue")}:{" "}
        {isPercent ? `${addon.percent ?? "—"}` : `$${addon.amount ?? "—"}`})
      </span>

      {/* 추가/수정 입력 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-56">
          <SearchableSelect<DriverEntity>
            value={driverId}
            onSelect={(id) => setDriverId(id)}
            fetchList={(q) =>
              fetchDrivers({ q, size: SEARCH_SIZE, activeOnly: true }).then(
                (r) => r.items,
              )
            }
            fetchById={fetchDriver}
            queryKeyBase={QUERY_KEYS.driver.all}
            getLabel={(d) => d.name}
            placeholder={t("addon.driverRates.driverPlaceholder")}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isPercent ? "0.18" : "0.00"}
          inputMode="decimal"
          className="h-9 w-28"
          disabled={isUpsertPending}
        />
        <span className="text-xs text-muted-foreground">
          {isPercent
            ? t("addon.driverRates.percentHint")
            : t("addon.driverRates.amountHint")}
        </span>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={isUpsertPending || driverId == null || !value.trim()}
        >
          {t("addon.driverRates.add")}
        </Button>
      </div>

      {/* 기사별 override 목록 */}
      {rates.length === 0 ? (
        <span className="py-1 text-xs text-muted-foreground">
          {t("addon.driverRates.empty")}
        </span>
      ) : (
        <div className="flex flex-col gap-1">
          {rates.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded border bg-background px-2 py-1 text-sm"
            >
              <span className="font-medium">
                {driverName.get(r.driverId) ?? `#${r.driverId}`}
              </span>
              <span className="font-mono text-xs">
                {isPercent ? (r.percent ?? "—") : `$${r.amount ?? "—"}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => deleteRate(r.driverId)}
              >
                {t("common.delete")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
