// 컨테이너 drawer [정산] 탭 — 컨테이너에 매달린 leg 들의 leg_charge 라인 합산.
//
// H-2: MANUAL leg_charge 추가/삭제만 지원. AUTO 매칭 엔진은 H-7 에서.
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { fetchLegChargesByLeg } from "@/api/leg-charge";
import { useLegsByDoData } from "@/hooks/queries/use-legs-by-do-data";
import { useChargeCodesData } from "@/hooks/queries/use-charge-codes-data";
import { useCreateLegCharge } from "@/hooks/mutations/leg-charge/use-create-leg-charge";
import { useDeleteLegCharge } from "@/hooks/mutations/leg-charge/use-delete-leg-charge";
import { useAutoMatchLegCharges } from "@/hooks/mutations/leg-charge/use-auto-match-leg-charges";
import { generateErrorMessage } from "@/lib/error";
import { QUERY_KEYS } from "@/lib/constants";
import type { ContainerEntity, LegChargeEntity } from "@/types";

export default function ContainerSettlement({
  container,
}: {
  container: ContainerEntity;
}) {
  const { t } = useTranslation();
  const { data: legs, isPending: legsPending, error: legsError } =
    useLegsByDoData(container.deliveryOrderId);

  const containerLegs = useMemo(
    () => (legs ?? []).filter((l) => l.containerId === container.id),
    [legs, container.id],
  );

  // 컨테이너에 매달린 leg 들의 leg_charge 를 병렬 fetch
  const chargeQueries = useQueries({
    queries: containerLegs.map((leg) => ({
      queryKey: QUERY_KEYS.legCharge.byLeg(leg.id),
      queryFn: () => fetchLegChargesByLeg(leg.id),
    })),
  });

  const allCharges: LegChargeEntity[] = chargeQueries.flatMap(
    (q) => (q.data ?? []) as LegChargeEntity[],
  );
  const totalAmount = allCharges.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0,
  );
  // P&L 분리: payer 별 매출 / payee 별 지급
  const customerRevenue = allCharges
    .filter((c) => c.payerKind === "CUSTOMER")
    .reduce((s, c) => s + Number(c.amount || 0), 0);
  const driverPayout = allCharges
    .filter((c) => c.payeeKind === "DRIVER")
    .reduce((s, c) => s + Number(c.amount || 0), 0);
  const carrierPayout = allCharges
    .filter((c) => c.payeeKind === "CARRIER")
    .reduce((s, c) => s + Number(c.amount || 0), 0);
  const poolPayout = allCharges
    .filter((c) => c.payeeKind === "POOL")
    .reduce((s, c) => s + Number(c.amount || 0), 0);
  const margin = customerRevenue - driverPayout - carrierPayout - poolPayout;
  const anyChargesLoading = chargeQueries.some((q) => q.isPending);

  if (legsError) return <Fallback />;
  if (legsPending) return <Loader />;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border bg-muted/20 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">
            {t("container.settlement.totalLabel")}
          </span>
          <span className="font-mono text-base font-medium">
            ${totalAmount.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("container.settlement.totalHint", {
            count: allCharges.length,
            legs: containerLegs.length,
          })}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <PnLRow
            label={t("container.settlement.pnl.customerRevenue")}
            value={customerRevenue}
            tone="positive"
          />
          <PnLRow
            label={t("container.settlement.pnl.driverPayout")}
            value={-driverPayout}
            tone="negative"
          />
          <PnLRow
            label={t("container.settlement.pnl.carrierPayout")}
            value={-carrierPayout}
            tone="negative"
          />
          <PnLRow
            label={t("container.settlement.pnl.poolPayout")}
            value={-poolPayout}
            tone="negative"
          />
          <PnLRow
            label={t("container.settlement.pnl.margin")}
            value={margin}
            tone={margin >= 0 ? "positive" : "negative"}
            bold
          />
        </div>
      </div>

      {anyChargesLoading && <Loader />}

      {containerLegs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("container.settlement.noLegs")}
        </p>
      ) : (
        containerLegs.map((leg, idx) => {
          const charges = (chargeQueries[idx]?.data ?? []) as LegChargeEntity[];
          return (
            <LegChargesBlock
              key={leg.id}
              legId={leg.id}
              legLabel={`#${leg.id} · ${leg.step}`}
              charges={charges}
            />
          );
        })
      )}
    </div>
  );
}

function LegChargesBlock({
  legId,
  legLabel,
  charges,
}: {
  legId: number;
  legLabel: string;
  charges: LegChargeEntity[];
}) {
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);

  const { data: chargeCodesData } = useChargeCodesData(1, 100);
  const codes = useMemo(
    () => chargeCodesData?.items ?? [],
    [chargeCodesData],
  );
  const codeNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of codes) m.set(c.id, c.code);
    return m;
  }, [codes]);

  const [chargeCodeId, setChargeCodeId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createCharge, isPending: isCreatePending } = useCreateLegCharge({
    onSuccess: () => {
      setAmount("");
      setDescription("");
      setAdding(false);
      toast.success(t("container.settlement.addedToast"), { position: "top-center" });
    },
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });
  const { mutate: deleteCharge, isPending: isDeletePending } = useDeleteLegCharge(
    legId,
    {
      onSuccess: () =>
        toast.success(t("container.settlement.deletedToast"), { position: "top-center" }),
      onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
    },
  );
  const { mutate: autoMatch, isPending: isAutoMatchPending } = useAutoMatchLegCharges({
    onSuccess: () =>
      toast.success(t("container.settlement.autoMatchedToast"), { position: "top-center" }),
    onError: (e) => toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  const handleAdd = () => {
    if (!chargeCodeId || amount.trim() === "") {
      toast.error(t("container.settlement.validation.required"), { position: "top-center" });
      return;
    }
    createCharge({
      legId,
      chargeCodeId,
      amount,
      source: "MANUAL",
      description: description.trim() || null,
    });
  };

  const subtotal = charges.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="rounded-md border p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">{legLabel}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => autoMatch(legId)}
            disabled={isAutoMatchPending}
          >
            {t("container.settlement.autoMatch")}
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {charges.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("container.settlement.noCharges")}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {charges.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 border-b py-1.5 text-xs last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono">
                  {codeNameById.get(c.chargeCodeId) ?? `#${c.chargeCodeId}`}
                </span>
                <span
                  className={
                    "rounded px-1.5 py-0.5 " +
                    (c.source === "AUTO"
                      ? "bg-emerald-100 text-emerald-700"
                      : c.source === "EVENT"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {c.source}
                </span>
                {c.payerKind && (
                  <span className="text-muted-foreground">
                    💰{c.payerKind}
                  </span>
                )}
                {c.payeeKind && (
                  <span className="text-muted-foreground">
                    →{c.payeeKind}
                  </span>
                )}
                {c.description && (
                  <span className="text-muted-foreground">{c.description}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono">${c.amount}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDeletePending}
                  onClick={() => {
                    if (window.confirm(t("container.settlement.deleteConfirm"))) {
                      deleteCharge(c.id);
                    }
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!adding ? (
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            + {t("container.settlement.addLine")}
          </Button>
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select
            value={chargeCodeId ?? ""}
            onChange={(e) => setChargeCodeId(e.target.value ? Number(e.target.value) : null)}
            disabled={isCreatePending}
            className="h-9 rounded-md border bg-background px-3 text-xs"
          >
            <option value="">— {t("container.settlement.selectCode")} —</option>
            {codes.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isCreatePending}
            placeholder={t("container.settlement.amountPlaceholder")}
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreatePending}
            placeholder={t("container.settlement.notePlaceholder")}
            className="col-span-2"
          />
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdding(false)} disabled={isCreatePending}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isCreatePending}>
              {t("common.add")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PnLRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: number;
  tone: "positive" | "negative";
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </span>
      <span
        className={
          "font-mono " +
          (bold ? "font-semibold " : "") +
          (tone === "positive" ? "text-green-700" : "text-red-700")
        }
      >
        {value >= 0 ? "+" : ""}${value.toFixed(2)}
      </span>
    </div>
  );
}
