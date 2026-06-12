import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import CityAutocomplete from "@/components/city-autocomplete";
import { useRateZoneMembersData } from "@/hooks/queries/use-rate-zone-members-data";
import { useReplaceRateZoneMembers } from "@/hooks/mutations/rate-zone/use-replace-rate-zone-members";
import { useAddRateZoneMembersByCity } from "@/hooks/mutations/rate-zone/use-add-rate-zone-members-by-city";
import { searchZipCodes } from "@/api/zip-code";
import { type RateZoneMemberInput } from "@/api/rate-zone";
import { generateErrorMessage } from "@/lib/error";
import { QUERY_KEYS } from "@/lib/constants";
import { US_STATES } from "@/lib/us-states";
import type { RateZoneMemberEntity, ZoneKind } from "@/types";

// 존 종류(kind)에 따라 멤버 UI 가 갈린다.
// ZIP 존 = zip 행 편집 + "도시로 추가"(도시→zip 전개 단축키).
// CITY 존 = 도시(city,state) 행 편집만 — zip 전개/입력 UI 없음.
export default function RateZoneMembersPanel({
  zoneId,
  kind,
}: {
  zoneId: number;
  kind: ZoneKind;
}) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateZoneMembersData(zoneId);

  return (
    <div className="mt-2 flex flex-col gap-3 border-t pt-3">
      <span className="text-xs font-medium text-muted-foreground uppercase">
        {t("rateZone.members.title")}
      </span>
      {kind === "ZIP" && <ByCityForm zoneId={zoneId} />}
      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : kind === "ZIP" ? (
        // 멤버 수가 바뀌면(도시추가/저장) Editor 를 새 데이터로 리마운트
        <ZipEditor key={`m-${data.length}`} zoneId={zoneId} initial={data} />
      ) : (
        <CityEditor key={`m-${data.length}`} zoneId={zoneId} initial={data} />
      )}
    </div>
  );
}

// "도시로 추가" — ZIP 존 전용 단축키. city + state → 그 도시 zip 전부를 멤버에 합집합 추가.
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
        {t("rateZone.members.byCityHintZip")}
      </span>
    </div>
  );
}

// ZIP 존 멤버 편집 — 행 = zip 코드 1개.
function ZipEditor({
  zoneId,
  initial,
}: {
  zoneId: number;
  initial: RateZoneMemberEntity[];
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<string[]>(
    initial.flatMap((m) => (m.zipCode != null ? [m.zipCode] : []))
  );

  const { mutate: replaceMembers, isPending: isReplacePending } =
    useReplaceRateZoneMembers({
      onSuccess: () =>
        toast.success(t("toast.saved"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const setRow = (index: number, zip: string) =>
    setRows((prev) => prev.map((r, i) => (i === index ? zip : r)));

  const addRow = () => setRows((prev) => [...prev, ""]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const members = rows.flatMap((zip): RateZoneMemberInput[] =>
      zip.trim() ? [{ zipCode: zip.trim() }] : []
    );
    replaceMembers({ id: zoneId, members });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("rateZone.members.zipCode")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={isReplacePending}
        >
          {t("rateZone.members.addRow")}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="py-2 text-center text-xs text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        rows.map((zip, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto] items-center gap-2"
          >
            <Input
              value={zip}
              onChange={(e) => setRow(index, e.target.value)}
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

// CITY 존 멤버 편집 — 행 = (city, state) 1쌍. zip 전개 없음, zip 은 읽기 전용 팝오버로만 확인.
type CityRow = { city: string; state: string };

function CityEditor({
  zoneId,
  initial,
}: {
  zoneId: number;
  initial: RateZoneMemberEntity[];
}) {
  const { t } = useTranslation();
  const [rows, setRows] = useState<CityRow[]>(
    initial.flatMap((m) =>
      m.city != null ? [{ city: m.city, state: m.state ?? "CA" }] : []
    )
  );

  const { mutate: replaceMembers, isPending: isReplacePending } =
    useReplaceRateZoneMembers({
      onSuccess: () =>
        toast.success(t("toast.saved"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const setRow = (index: number, row: CityRow) =>
    setRows((prev) => prev.map((r, i) => (i === index ? row : r)));

  const addRow = () => setRows((prev) => [...prev, { city: "", state: "CA" }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    const members = rows.flatMap((r): RateZoneMemberInput[] =>
      r.city.trim() ? [{ city: r.city.trim(), state: r.state }] : []
    );
    replaceMembers({ id: zoneId, members });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("rateEntry.coordType.city")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={isReplacePending}
        >
          {t("rateZone.members.addRow")}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="py-2 text-center text-xs text-muted-foreground">
          {t("common.noData")}
        </div>
      ) : (
        rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2"
          >
            <CityAutocomplete
              value={row.city}
              state={row.state}
              onChange={(city) => setRow(index, { ...row, city })}
              placeholder={t("rateZone.members.byCity.cityPlaceholder")}
              disabled={isReplacePending}
            />
            <select
              value={row.state}
              onChange={(e) => setRow(index, { ...row, state: e.target.value })}
              disabled={isReplacePending}
              className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
            >
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>
            <CityZipsPopover city={row.city} state={row.state} />
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

// 도시 행 클릭 → 그 도시의 zip 목록을 읽기 전용으로 보여주는 팝오버.
// 열릴 때만 zip 마스터에서 조회 (q = 도시명 prefix 매칭 → 정확히 일치하는 도시만 필터).
function CityZipsPopover({ city, state }: { city: string; state: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const trimmed = city.trim();

  const { data, isPending } = useQuery({
    queryKey: QUERY_KEYS.zipCode.cityZips(trimmed, state),
    queryFn: () => searchZipCodes(trimmed, state),
    enabled: open && trimmed !== "",
  });

  const zips = (data ?? []).filter(
    (z) => z.city.toLowerCase() === trimmed.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={trimmed === ""}
          className="h-9 rounded-md border bg-background px-2 text-xs text-muted-foreground hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("rateZone.members.zipCode")} ▾
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <div className="border-b px-3 py-2 text-xs font-medium">
          {t("rateZone.members.cityZips", {
            city: trimmed,
            count: zips.length,
          })}
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {isPending ? (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          ) : zips.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              {t("common.noData")}
            </div>
          ) : (
            <ul>
              {zips.map((z) => (
                <li key={z.id} className="px-3 py-1 text-sm">
                  {z.zip} · {z.city}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
