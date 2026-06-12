// 요율 조회 — 출발/도착 장소(터미널|야드|거래처)를 zip 으로 해석한 뒤
// POST /rate-sheets/resolve/preview 로 예상 요율 + 해석 경로를 보여준다.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import SearchableSelect from "@/components/searchable-select";
import { fetchCustomer, fetchCustomers } from "@/api/customer";
import { fetchDriver, fetchDrivers } from "@/api/driver";
import { fetchLocation, fetchLocations } from "@/api/location";
import { fetchTerminal, fetchTerminals } from "@/api/terminal";
import { fetchZipCode } from "@/api/zip-code";
import { useRateLookupAddonEstimateData } from "@/hooks/queries/use-rate-lookup-addon-estimate-data";
import { useRateZonesData } from "@/hooks/queries/use-rate-zones-data";
import { useResolveRatePreview } from "@/hooks/mutations/rate-resolve/use-resolve-rate-preview";
import {
  useResolveRatePreviewMulti,
  type RateResolveMultiItem,
} from "@/hooks/mutations/rate-resolve/use-resolve-rate-preview-multi";
import { QUERY_KEYS } from "@/lib/constants";
import { generateErrorMessage } from "@/lib/error";
import { formatAmount, formatDate } from "@/lib/format";
import type {
  CustomerEntity,
  DriverEntity,
  LocationEntity,
  RateMoveType,
  RateResolveResult,
  RateServiceType,
  TerminalEntity,
  ZipCodeEntity,
} from "@/types";

const MOVE_TYPES: RateMoveType[] = ["LOAD", "EMPTY", "NONE"];
const SERVICE_TYPES: RateServiceType[] = ["LIVE", "DROP", "NONE"];
// "ALL" = 전체 조합 일괄 조회 (무브×서비스를 병렬 해석해 표로 보여준다)
type MoveChoice = RateMoveType | "ALL";
type ServiceChoice = RateServiceType | "ALL";
const SELECT_CLASS = "h-9 w-full rounded-md border bg-background px-2 text-sm";

// 포인트 = 타입 토글 + 마스터 선택. 선택 즉시 entity 의 zipId 를 들고 있는다.
type PointType = "TERMINAL" | "YARD" | "CUSTOMER";
type PointState = { type: PointType; id: number | null; zipId: number | null };

function todayISO(): string {
  // 로컬 날짜 기준 — UTC toISOString() 은 시차로 하루가 어긋날 수 있다.
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RateLookupPage() {
  const { t } = useTranslation();

  const {
    mutate: resolvePreview,
    isPending: isResolvePreviewPending,
    data: result,
  } = useResolveRatePreview({
    onError: (error) =>
      toast.error(generateErrorMessage(error), { position: "top-center" }),
  });
  const {
    mutate: resolvePreviewMulti,
    isPending: isResolvePreviewMultiPending,
    data: multiResult,
  } = useResolveRatePreviewMulti({
    onError: (error) =>
      toast.error(generateErrorMessage(error), { position: "top-center" }),
  });

  const [from, setFrom] = useState<PointState>({
    type: "TERMINAL",
    id: null,
    zipId: null,
  });
  const [dest, setDest] = useState<PointState>({
    type: "CUSTOMER",
    id: null,
    zipId: null,
  });
  const [move, setMove] = useState<MoveChoice>("ALL");
  const [service, setService] = useState<ServiceChoice>("ALL");
  const [workDate, setWorkDate] = useState(todayISO());
  const [driverId, setDriverId] = useState<number | null>(null);
  // 조회 시점 스냅샷 — 결과 카드는 라이브 입력이 아니라 제출 당시 값을 쓴다.
  const [submittedDriverId, setSubmittedDriverId] = useState<number | null>(
    null
  );
  const [submittedKey, setSubmittedKey] = useState<string | null>(null);
  // 마지막 제출이 단건(카드)인지 전체 조합(표)인지 — 결과 영역 분기.
  const [submittedMode, setSubmittedMode] = useState<"single" | "multi">(
    "single"
  );

  // 선택된 포인트의 zipId → zip/city/state 해석 (resolve body 의 원천).
  // §4 훅 순서 예외: 이 쿼리들은 from/dest state 에 의존해 useState 뒤에 둔다.
  const { data: fromZip, error: fromZipError } = useQuery({
    queryKey: QUERY_KEYS.zipCode.byId(from.zipId ?? 0),
    queryFn: () => fetchZipCode(from.zipId!),
    enabled: from.zipId != null,
  });
  const { data: destZip, error: destZipError } = useQuery({
    queryKey: QUERY_KEYS.zipCode.byId(dest.zipId ?? 0),
    queryFn: () => fetchZipCode(dest.zipId!),
    enabled: dest.zipId != null,
  });

  const fromZipData = from.zipId != null ? fromZip : undefined;
  const destZipData = dest.zipId != null ? destZip : undefined;
  const canSubmit = !!fromZipData && !!destZipData && !!workDate;
  const isPending = isResolvePreviewPending || isResolvePreviewMultiPending;
  // 제출 입력 직렬화 키 — 결과가 현재 입력과 어긋나면 stale 힌트 표시.
  const currentKey = JSON.stringify({
    from,
    dest,
    move,
    service,
    workDate,
    driverId,
  });
  const hasResult =
    submittedMode === "single" ? result != null : multiResult != null;
  const isStale =
    hasResult && submittedKey != null && currentKey !== submittedKey;

  const handleSubmit = () => {
    if (!fromZipData || !destZipData || !workDate) return;
    setSubmittedDriverId(driverId);
    setSubmittedKey(currentKey);

    const place = {
      fromZip: fromZipData.zip,
      fromCity: fromZipData.city,
      fromState: fromZipData.state,
      destZip: destZipData.zip,
      destCity: destZipData.city,
      destState: destZipData.state,
    };
    const moves = move === "ALL" ? MOVE_TYPES : [move];
    const services = service === "ALL" ? SERVICE_TYPES : [service];

    if (moves.length === 1 && services.length === 1) {
      setSubmittedMode("single");
      resolvePreview({
        driverId,
        workDate,
        moveType: moves[0],
        serviceType: services[0],
        ...place,
      });
      return;
    }

    setSubmittedMode("multi");
    resolvePreviewMulti(
      moves.flatMap((m) =>
        services.map((s) => ({
          driverId,
          workDate,
          moveType: m,
          serviceType: s,
          ...place,
        }))
      )
    );
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("rateLookup.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("rateLookup.description")}
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-md border bg-muted/20 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <PointField
            label={t("rateLookup.form.origin")}
            value={from}
            onChange={setFrom}
            zip={fromZipData ?? null}
            zipError={from.zipId != null && fromZipError != null}
            disabled={isPending}
          />
          <PointField
            label={t("rateLookup.form.dest")}
            value={dest}
            onChange={setDest}
            zip={destZipData ?? null}
            zipError={dest.zipId != null && destZipError != null}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Field label={t("rateEntry.field.move")}>
            <select
              className={SELECT_CLASS}
              value={move}
              onChange={(e) => setMove(e.target.value as MoveChoice)}
              disabled={isPending}
            >
              <option value="ALL">{t("common.all")}</option>
              {MOVE_TYPES.map((m) => (
                <option key={m} value={m}>
                  {t(`rateEntry.move.${m}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("rateEntry.field.service")}>
            <select
              className={SELECT_CLASS}
              value={service}
              onChange={(e) => setService(e.target.value as ServiceChoice)}
              disabled={isPending}
            >
              <option value="ALL">{t("common.all")}</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {t(`rateEntry.service.${s}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("rateLookup.form.workDate")}>
            <Input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              disabled={isPending}
              className="h-9"
            />
          </Field>
          <Field label={t("rateLookup.form.driver")}>
            <SearchableSelect<DriverEntity>
              value={driverId}
              onSelect={(id) => setDriverId(id)}
              fetchList={(q) =>
                fetchDrivers({ q, size: 50, activeOnly: true }).then(
                  (r) => r.items
                )
              }
              fetchById={fetchDriver}
              queryKeyBase={["driver", "search"]}
              getLabel={(d) => d.name}
              emptyLabel={t("rateLookup.form.driverNone")}
              disabled={isPending}
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isPending || !canSubmit}>
            {t("rateLookup.form.submit")}
          </Button>
        </div>
      </section>

      {isStale && (
        <p className="text-xs text-muted-foreground">
          {t("rateLookup.result.stale")}
        </p>
      )}
      {submittedMode === "single" && result && (
        <ResultCard result={result} driverId={submittedDriverId} />
      )}
      {submittedMode === "multi" && multiResult && (
        <MultiResultTable items={multiResult} />
      )}
    </div>
  );
}

// ── 전체 조합 결과 표 (무브×서비스 일괄 조회) ──
// 요율이 해석된 조합만 보여준다 — 미해석 조합 나열은 노이즈라 건수로만 요약.
function MultiResultTable({ items }: { items: RateResolveMultiItem[] }) {
  const { t } = useTranslation();

  const found = items.filter(
    (it): it is RateResolveMultiItem & { result: RateResolveResult } =>
      it.result != null && it.result.found,
  );
  const skipped = items.length - found.length;

  if (found.length === 0) {
    return (
      <section className="rounded-md border bg-muted/30 p-4">
        <h2 className="text-sm font-semibold">{t("rateLookup.notFound")}</h2>
        <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{t("rateLookup.multi.title")}</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rateEntry.field.move")}</TableHead>
              <TableHead>{t("rateEntry.field.service")}</TableHead>
              <TableHead className="text-right">
                {t("rateEntry.field.amount")}
              </TableHead>
              <TableHead>{t("rateLookup.result.matchPath")}</TableHead>
              <TableHead>{t("rateLookup.result.effective")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {found.map(({ body, result }) => {
              const key = `${body.moveType}-${body.serviceType}`;
              return (
                <ResultRow key={key} body={body}>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatAmount(result.baseAmount, "USD")}
                    {result.perUnit != null && result.quantity != null && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({formatAmount(result.perUnit, "USD")} ×{" "}
                        {result.quantity})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {result.method && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                          {result.method}
                        </span>
                      )}
                      {result.matchStep && (
                        <span className="text-xs">
                          {t(`rateLookup.step.${result.matchStep}`)}
                        </span>
                      )}
                      {result.viaDefaultGroup && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                          {t("rateLookup.badge.viaDefault")}
                        </span>
                      )}
                      {result.assignmentFallback && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                          {t("rateLookup.badge.assignmentFallback")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(result.effectiveFrom)} ~{" "}
                    {result.effectiveTo
                      ? formatDate(result.effectiveTo)
                      : t("rateLookup.result.untilNow")}
                  </TableCell>
                </ResultRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {skipped > 0 && (
        <p className="text-xs text-muted-foreground">
          {t("rateLookup.multi.skipped", { count: skipped })}
        </p>
      )}
    </section>
  );
}

// 공통 행 prefix — 무브/서비스 라벨 두 칸 + 나머지(children).
function ResultRow({
  body,
  children,
}: {
  body: RateResolveMultiItem["body"];
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <TableRow>
      <TableCell className="text-sm">
        {t(`rateEntry.move.${body.moveType}`)}
      </TableCell>
      <TableCell className="text-sm">
        {body.serviceType ? t(`rateEntry.service.${body.serviceType}`) : "—"}
      </TableCell>
      {children}
    </TableRow>
  );
}

// ── 포인트 선택 (타입 토글 + 마스터 SearchableSelect + zip 라벨) ──
function PointField({
  label,
  value,
  onChange,
  zip,
  zipError,
  disabled,
}: {
  label: string;
  value: PointState;
  onChange: (v: PointState) => void;
  zip: ZipCodeEntity | null;
  zipError?: boolean;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const types: PointType[] = ["TERMINAL", "YARD", "CUSTOMER"];

  const select = (id: number | null, zipId: number | null) =>
    onChange({ ...value, id, zipId });

  return (
    <Field label={label}>
      <div className="flex flex-col gap-1">
        <div className="flex w-fit items-center gap-1 rounded-md bg-muted p-0.5">
          {types.map((pt) => (
            <button
              key={pt}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ type: pt, id: null, zipId: null })}
              className={`rounded px-2 py-0.5 text-xs ${value.type === pt ? "bg-background shadow-sm" : ""}`}
            >
              {t(`rateLookup.form.pointType.${pt.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {value.type === "TERMINAL" && (
          <SearchableSelect<TerminalEntity>
            value={value.id}
            onSelect={(id, item) => select(id, item?.zipId ?? null)}
            fetchList={(q) =>
              fetchTerminals({ q, size: 50 }).then((r) => r.items)
            }
            fetchById={fetchTerminal}
            queryKeyBase={["terminal", "search"]}
            getLabel={(x) => x.name}
            disabled={disabled}
          />
        )}
        {value.type === "YARD" && (
          <SearchableSelect<LocationEntity>
            value={value.id}
            onSelect={(id, item) => select(id, item?.zipId ?? null)}
            fetchList={(q) =>
              fetchLocations({ q, size: 50, kind: "YARD" }).then((r) => r.items)
            }
            fetchById={fetchLocation}
            queryKeyBase={["location", "search", "YARD"]}
            getLabel={(x) => x.name}
            disabled={disabled}
          />
        )}
        {value.type === "CUSTOMER" && (
          <SearchableSelect<CustomerEntity>
            value={value.id}
            onSelect={(id, item) => select(id, item?.zipId ?? null)}
            fetchList={(q) =>
              fetchCustomers({ q, size: 50 }).then((r) => r.items)
            }
            fetchById={fetchCustomer}
            queryKeyBase={["customer", "search"]}
            getLabel={(x) => x.name}
            disabled={disabled}
          />
        )}

        {value.id != null && value.zipId == null && (
          <span className="text-xs text-amber-600">
            {t("rateLookup.noZipWarning")}
          </span>
        )}
        {zipError && (
          <span className="text-xs text-amber-600">
            {t("rateLookup.zipLoadError")}
          </span>
        )}
        {zip && (
          <span className="text-xs text-muted-foreground">
            {zip.zip} · {zip.city}, {zip.state}
          </span>
        )}
      </div>
    </Field>
  );
}

// ── 해석 결과 카드 ──
function ResultCard({
  result,
  driverId,
}: {
  result: RateResolveResult;
  driverId: number | null;
}) {
  const { t } = useTranslation();
  // §5 early-return 규칙 의도적 예외: 존 이름은 코스메틱 enrichment 라서
  // 이 쿼리의 로딩/에러로 결과 카드를 막지 않고 `#id` 폴백으로 우아하게 처리한다.
  const { data: zonesData } = useRateZonesData();

  if (!result.found) {
    return (
      <section className="rounded-md border bg-muted/30 p-4">
        <h2 className="text-sm font-semibold">{t("rateLookup.notFound")}</h2>
        <p className="text-sm text-muted-foreground">
          {result.message ?? t("common.noData")}
        </p>
      </section>
    );
  }

  const zones = zonesData?.items ?? [];
  const zoneName =
    result.zoneId != null
      ? (zones.find((z) => z.id === result.zoneId)?.name ?? `#${result.zoneId}`)
      : null;

  return (
    <section className="flex flex-col gap-3 rounded-md border p-4">
      <div>
        <h2 className="text-sm font-semibold">
          {t("rateLookup.result.title")}
        </h2>
        <p className="text-3xl font-bold">
          {formatAmount(result.baseAmount, "USD")}
        </p>
        {result.perUnit != null && result.quantity != null && (
          <p className="text-xs text-muted-foreground">
            {formatAmount(result.perUnit, "USD")} × {result.quantity}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {t("rateLookup.result.matchPath")}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {result.method && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
              {result.method}
            </span>
          )}
          {result.matchStep && (
            <span className="text-sm">
              {t(`rateLookup.step.${result.matchStep}`)}
            </span>
          )}
          {result.viaDefaultGroup && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
              {t("rateLookup.badge.viaDefault")}
            </span>
          )}
          {result.assignmentFallback && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
              {t("rateLookup.badge.assignmentFallback")}
            </span>
          )}
        </div>
        {zoneName && (
          <span className="text-xs text-muted-foreground">
            {t("rateLookup.result.zone")}: {zoneName}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {t("rateLookup.result.effective")}: {formatDate(result.effectiveFrom)}{" "}
          ~{" "}
          {result.effectiveTo
            ? formatDate(result.effectiveTo)
            : t("rateLookup.result.untilNow")}
        </span>
      </div>

      {driverId != null && (
        <AddonEstimate driverId={driverId} baseAmount={result.baseAmount} />
      )}
    </section>
  );
}

// ── 기사 Add-on 예상 (기사 선택 + 해석 성공 시에만) ──
function AddonEstimate({
  driverId,
  baseAmount,
}: {
  driverId: number;
  baseAmount: string | null;
}) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateLookupAddonEstimateData(driverId);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const base = baseAmount != null ? Number(baseAmount) : null;
  // 백엔드 charge engine 과 동일하게 addon.unit 으로 분기한다.
  // PERCENT → 비율 × 기본요율, FLAT → 유효 금액(총액), 그 외(MILE/HOUR/MINUTE/DAY)
  // → 단가 + 단위 접미사 (라인 총액 아님). 비-PERCENT unit 의 잔여 percent 는 무시.
  const rows = data.flatMap((row) => {
    const { addon, override } = row;
    if (addon.unit === "PERCENT") {
      const percent = override?.percent ?? addon.percent;
      if (percent == null) return [];
      const label = `${(Number(percent) * 100).toFixed(0)}% → ${
        base != null ? formatAmount(base * Number(percent), "USD") : "—"
      }`;
      return [{ addon, display: label }];
    }
    const amount = override?.amount ?? addon.amount;
    if (amount == null) return [];
    if (addon.unit === "FLAT") {
      return [{ addon, display: formatAmount(amount, "USD") }];
    }
    return [
      {
        addon,
        display: `${formatAmount(amount, "USD")}${t(`rateLookup.perUnit.${addon.unit}`)}`,
      },
    ];
  });

  return (
    <div className="flex flex-col gap-1 border-t pt-3">
      <span className="text-xs font-medium text-muted-foreground uppercase">
        {t("rateLookup.addonTitle")}
      </span>
      <p className="text-[11px] text-muted-foreground">
        {t("rateLookup.addonHint")}
      </p>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("common.noData")}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map(({ addon, display }) => (
            <li
              key={addon.id}
              className="flex items-center justify-between text-xs"
            >
              <span>
                <span className="font-mono">{addon.code}</span> · {addon.name}
              </span>
              <span className="font-medium">{display}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
