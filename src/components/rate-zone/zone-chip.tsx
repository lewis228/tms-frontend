// 존 좌표 칩 — 리스트/매트릭스에서 존을 zip·도시 텍스트와 구분되는 뱃지로 렌더.
// 클릭하면 Popover 로 그 존의 멤버(zip/도시) 목록을 즉시 보여준다.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Layers } from "lucide-react";

import Loader from "@/components/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchRateZoneMembers } from "@/api/rate-zone";
import { useZipLabelsData } from "@/hooks/queries/use-zip-labels-data";
import { QUERY_KEYS } from "@/lib/constants";
import type { RateZoneEntity, RateZoneMemberEntity } from "@/types";

const DEFAULT_DOT = "#64748b";

export default function ZoneChip({
  zone,
  compact,
}: {
  zone: RateZoneEntity;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          title={t("rateZone.chip.title")}
          className={`inline-flex items-center gap-1 rounded-full border bg-muted/60 font-medium hover:bg-muted ${
            compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs"
          }`}
        >
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: zone.color ?? DEFAULT_DOT }}
          />
          {compact ? null : <Layers className="size-3 shrink-0 opacity-60" />}
          {zone.name}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <ZoneMembersBody zone={zone} open={open} />
      </PopoverContent>
    </Popover>
  );
}

// 멤버 목록 — 팝오버가 열릴 때만 lazy fetch.
function ZoneMembersBody({
  zone,
  open,
}: {
  zone: RateZoneEntity;
  open: boolean;
}) {
  const { t } = useTranslation();
  const {
    data: members,
    isPending,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.rateZone.members(zone.id),
    queryFn: () => fetchRateZoneMembers(zone.id),
    enabled: open,
  });
  const zips = (members ?? [])
    .map((m) => m.zipCode)
    .filter((z): z is string => !!z);
  const { data: zipLabels } = useZipLabelsData(zips);

  if (error)
    return (
      <span className="text-xs text-muted-foreground">
        {t("rateZone.chip.loadError")}
      </span>
    );
  if (isPending) return <Loader />;

  const memberLabel = (m: RateZoneMemberEntity) => {
    if (m.zipCode) return zipLabels?.get(m.zipCode) ?? m.zipCode;
    return `${m.city ?? ""}${m.state ? `, ${m.state}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-2.5 rounded-full"
          style={{ backgroundColor: zone.color ?? DEFAULT_DOT }}
        />
        <span className="text-sm font-semibold">{zone.name}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase">
          {t(`rateZone.kind.${zone.kind}`)}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground">
        {t("rateZone.chip.memberCount", { count: members.length })}
      </span>
      {members.length === 0 ? (
        <span className="text-xs text-muted-foreground">
          {t("common.noData")}
        </span>
      ) : (
        <ul className="flex max-h-56 flex-col gap-0.5 overflow-y-auto">
          {members.map((m) => (
            <li key={m.id} className="text-xs tabular-nums">
              {memberLabel(m)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
