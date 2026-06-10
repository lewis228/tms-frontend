import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useRateZoneMembersData } from "@/hooks/queries/use-rate-zone-members-data";
import { useReplaceRateZoneMembers } from "@/hooks/mutations/rate-zone/use-replace-rate-zone-members";
import { useAddRateZoneMembersByCity } from "@/hooks/mutations/rate-zone/use-add-rate-zone-members-by-city";
import { generateErrorMessage } from "@/lib/error";
import { US_STATES } from "@/lib/us-states";
import type { RateZoneMemberEntity } from "@/types";

type Row = { zipCode: string };

export default function RateZoneMembersPanel({ zoneId }: { zoneId: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateZoneMembersData(zoneId);

  return (
    <div className="mt-2 flex flex-col gap-3 border-t pt-3">
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {t("rateZone.members.title")}
      </span>
      <ByCityForm zoneId={zoneId} />
      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : (
        // 멤버 수가 바뀌면(도시추가/저장) Editor 를 새 데이터로 리마운트
        <Editor key={`m-${data.length}`} zoneId={zoneId} initial={data} />
      )}
    </div>
  );
}

// "도시로 추가" — city + state → 그 도시 zip 전부를 멤버에 합집합 추가.
function ByCityForm({ zoneId }: { zoneId: number }) {
  const { t } = useTranslation();
  const [city, setCity] = useState("");
  const [state, setState] = useState("CA");

  const { mutate: addByCity, isPending } = useAddRateZoneMembersByCity({
    onSuccess: () => {
      toast.success(t("rateZone.members.byCity.added"), { position: "top-center" });
      setCity("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  return (
    <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-2">
      <span className="text-[10px] uppercase text-muted-foreground">
        {t("rateZone.members.byCity.title")}
      </span>
      <div className="flex items-center gap-2">
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={isPending}
          placeholder={t("rateZone.members.byCity.cityPlaceholder")}
          className="h-9 flex-1"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          disabled={isPending}
          className="h-9 w-24 rounded-md border bg-background px-2 text-sm"
        >
          {US_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.code}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          onClick={() => city.trim() && addByCity({ id: zoneId, city: city.trim(), state })}
          disabled={isPending || !city.trim()}
        >
          {t("rateZone.members.byCity.expand")}
        </Button>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {t("rateZone.members.byCity.help")}
      </span>
    </div>
  );
}

function Editor({
  zoneId,
  initial,
}: {
  zoneId: number;
  initial: RateZoneMemberEntity[];
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>(
    initial.map((m) => ({ zipCode: m.zipCode })),
  );

  const { mutate: replaceMembers, isPending: isReplacePending } =
    useReplaceRateZoneMembers({
      onSuccess: () =>
        toast.success(t("toast.saved"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const updateRow = (index: number, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, { zipCode: "" }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const members = rows
      .map((r) => ({ zipCode: r.zipCode.trim() }))
      .filter((m) => m.zipCode);
    replaceMembers({ id: zoneId, members });
  };

  return (
    <>
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={isReplacePending}
        >
          {t("rateZone.members.addRow")}
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-2 text-xs text-muted-foreground">
        <span>{t("rateZone.members.zipCode")}</span>
        <span />
      </div>
      {rows.length === 0 ? (
        <div className="py-2 text-center text-xs text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto] items-center gap-2"
          >
            <Input
              value={row.zipCode}
              onChange={(e) => updateRow(index, { zipCode: e.target.value })}
              disabled={isReplacePending}
              maxLength={16}
              placeholder={t("rateZone.members.zipCode")}
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => removeRow(index)}
              disabled={isReplacePending}
            >
              {t("common.remove")}
            </Button>
          </div>
        ))
      )}
      <div className="flex justify-end pt-1">
        <Button size="sm" onClick={handleSave} disabled={isReplacePending}>
          {t("rateZone.members.save")}
        </Button>
      </div>
    </>
  );
}
