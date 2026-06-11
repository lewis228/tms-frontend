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
import { type RateZoneMemberInput } from "@/api/rate-zone";
import { generateErrorMessage } from "@/lib/error";
import { US_STATES } from "@/lib/us-states";
import type { RateZoneMemberEntity } from "@/types";

// 멤버 행 = zip 1개 XOR (city,state) 1쌍.
type Row =
  | { kind: "zip"; zipCode: string }
  | { kind: "city"; city: string; state: string };

function toRow(m: RateZoneMemberEntity): Row {
  if (m.zipCode != null) return { kind: "zip", zipCode: m.zipCode };
  return { kind: "city", city: m.city ?? "", state: m.state ?? "CA" };
}

export default function RateZoneMembersPanel({ zoneId }: { zoneId: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateZoneMembersData(zoneId);

  return (
    <div className="mt-2 flex flex-col gap-3 border-t pt-3">
      <span className="text-xs font-medium text-muted-foreground uppercase">
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
      toast.success(t("rateZone.members.byCity.added"), {
        position: "top-center",
      });
      setCity("");
    },
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  return (
    <div className="flex flex-col gap-1 rounded-md bg-muted/40 p-2">
      <span className="text-[10px] text-muted-foreground uppercase">
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
          onClick={() =>
            city.trim() && addByCity({ id: zoneId, city: city.trim(), state })
          }
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
  const [rows, setRows] = useState<Row[]>(initial.map(toRow));

  const { mutate: replaceMembers, isPending: isReplacePending } =
    useReplaceRateZoneMembers({
      onSuccess: () =>
        toast.success(t("toast.saved"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const setRow = (index: number, row: Row) => {
    setRows((prev) => prev.map((r, i) => (i === index ? row : r)));
  };

  const setRowKind = (index: number, kind: Row["kind"]) => {
    setRow(
      index,
      kind === "zip"
        ? { kind: "zip", zipCode: "" }
        : { kind: "city", city: "", state: "CA" }
    );
  };

  const addRow = () =>
    setRows((prev) => [...prev, { kind: "zip", zipCode: "" }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const members = rows.flatMap((r): RateZoneMemberInput[] =>
      r.kind === "zip"
        ? r.zipCode.trim()
          ? [{ zipCode: r.zipCode.trim() }]
          : []
        : r.city.trim()
          ? [{ city: r.city.trim(), state: r.state }]
          : []
    );
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

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 text-xs text-muted-foreground">
        <span>{t("rateZone.members.type")}</span>
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
            className="grid grid-cols-[auto_1fr_auto] items-center gap-2"
          >
            <select
              value={row.kind}
              onChange={(e) => setRowKind(index, e.target.value as Row["kind"])}
              disabled={isReplacePending}
              className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
              aria-label={t("rateZone.members.type")}
            >
              <option value="zip">{t("rateEntry.coordType.zip")}</option>
              <option value="city">{t("rateEntry.coordType.city")}</option>
            </select>
            {row.kind === "zip" ? (
              <Input
                value={row.zipCode}
                onChange={(e) =>
                  setRow(index, { kind: "zip", zipCode: e.target.value })
                }
                disabled={isReplacePending}
                maxLength={16}
                placeholder={t("rateZone.members.zipCode")}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={row.city}
                  onChange={(e) =>
                    setRow(index, { ...row, city: e.target.value })
                  }
                  disabled={isReplacePending}
                  maxLength={120}
                  placeholder={t("rateZone.members.byCity.cityPlaceholder")}
                  className="flex-1"
                />
                <select
                  value={row.state}
                  onChange={(e) =>
                    setRow(index, { ...row, state: e.target.value })
                  }
                  disabled={isReplacePending}
                  className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
                >
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
