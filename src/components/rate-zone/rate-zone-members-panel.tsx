import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useRateZoneMembersData } from "@/hooks/queries/use-rate-zone-members-data";
import { useReplaceRateZoneMembers } from "@/hooks/mutations/rate-zone/use-replace-rate-zone-members";
import { generateErrorMessage } from "@/lib/error";
import type { RateZoneMemberEntity } from "@/types";

type Row = { zipCode: string };

export default function RateZoneMembersPanel({ zoneId }: { zoneId: number }) {
  const { t } = useTranslation();
  const { data, isPending, error } = useRateZoneMembersData(zoneId);

  return (
    <div className="mt-2 flex flex-col gap-2 border-t pt-3">
      <span className="text-xs font-medium uppercase text-muted-foreground">
        {t("rateZone.members.title")}
      </span>
      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : (
        <Editor zoneId={zoneId} initial={data} />
      )}
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
