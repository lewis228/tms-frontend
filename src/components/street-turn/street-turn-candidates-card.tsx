// Street Turn 추천 카드 — H-11. 매칭 가능한 IMPORT 컨테이너 X EXPORT D/O 추천.
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useStreetTurnCandidatesData } from "@/hooks/queries/use-street-turn-candidates-data";
import { useCreateStreetTurn } from "@/hooks/mutations/street-turn/use-create-street-turn";
import { generateErrorMessage } from "@/lib/error";
import { formatAmount } from "@/lib/format";

export default function StreetTurnCandidatesCard() {
  const { t } = useTranslation();
  const { data, isPending, error } = useStreetTurnCandidatesData(10);

  const { mutate: create, isPending: isCreatePending } = useCreateStreetTurn({
    onSuccess: () =>
      toast.success(t("streetTurn.candidates.createdToast"), {
        position: "top-center",
      }),
    onError: (e) =>
      toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const items = data.candidates;

  if (items.length === 0) {
    return (
      <section className="rounded-md border bg-muted/20 p-4">
        <h2 className="text-sm font-semibold">
          {t("streetTurn.candidates.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("streetTurn.candidates.empty")}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-md border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">
            {t("streetTurn.candidates.title")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("streetTurn.candidates.hint", {
              total: data.total,
              saving: formatAmount(Number(data.savingPerTurn)),
            })}
          </p>
        </div>
        <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          {t("streetTurn.candidates.estimatedTotal", {
            amount: formatAmount(Number(data.savingPerTurn) * data.total),
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((c, idx) => (
          <div
            key={`${c.importOrderId}-${c.exportOrderId}-${c.containerId ?? idx}`}
            className="flex items-center justify-between rounded border bg-background p-3 text-xs"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                  IMPORT #{c.importOrderId}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                  EXPORT #{c.exportOrderId}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono">
                  {c.containerNumber ?? `#${c.containerId ?? "—"}`}
                </span>
                {c.containerSize && (
                  <span className="rounded bg-muted px-1 py-0.5 text-[10px]">
                    {c.containerSize}
                  </span>
                )}
                <span className="text-emerald-700">
                  +{formatAmount(Number(c.estimatedSaving))}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={isCreatePending}
              onClick={() =>
                create({
                  importOrderId: c.importOrderId,
                  exportOrderId: c.exportOrderId,
                  containerId: c.containerId,
                  containerNumber: c.containerNumber,
                  linkType: "MANUAL",
                })
              }
            >
              {t("streetTurn.candidates.requestButton")}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
