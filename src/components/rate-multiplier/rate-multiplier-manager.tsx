import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { fetchRateGroup, fetchRateGroups } from "@/api/rate-group";
import SearchableSelect from "@/components/searchable-select";
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
import { useRateMultipliersData } from "@/hooks/queries/use-rate-multipliers-data";
import { useUpsertRateMultiplier } from "@/hooks/mutations/rate-multiplier/use-upsert-rate-multiplier";
import { useDeleteRateMultiplier } from "@/hooks/mutations/rate-multiplier/use-delete-rate-multiplier";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import type {
  RateContainerSize,
  RateGroupEntity,
  RateMultiplierEntity,
} from "@/types";

const SEARCH_SIZE = 50;
const CONTAINER_SIZES: RateContainerSize[] = ["SIZE_20", "SIZE_40", "SIZE_45"];

export default function RateMultiplierManager() {
  const { t } = useTranslation();
  const [rateGroupId, setRateGroupId] = useState<number | null>(null);

  const { data, isPending, error } = useRateMultipliersData(rateGroupId);
  const openAlert = useOpenAlertModal();

  const { mutate: upsertMultiplier, isPending: isUpsertPending } =
    useUpsertRateMultiplier({
      onSuccess: () =>
        toast.success(t("toast.saved"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  const { mutate: deleteMultiplier } = useDeleteRateMultiplier({
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const handleDelete = (m: RateMultiplierEntity) => {
    openAlert({
      title: t("rateMultiplier.deletePromptTitle"),
      description: t("rateMultiplier.deletePromptDesc"),
      onPositive: () => deleteMultiplier(m.id),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-sm flex-col gap-1">
        <label className="text-xs text-muted-foreground">
          {t("rateMultiplier.scopeLabel")}
        </label>
        <SearchableSelect<RateGroupEntity>
          value={rateGroupId}
          onSelect={(id) => setRateGroupId(id)}
          fetchList={(q) =>
            fetchRateGroups({ q, size: SEARCH_SIZE }).then((r) => r.items)
          }
          fetchById={(id) => fetchRateGroup(id)}
          queryKeyBase={["rate-group", "search"]}
          getLabel={(g) => g.name}
          placeholder={t("rateMultiplier.globalScope")}
          emptyLabel={t("rateMultiplier.globalScope")}
        />
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : (
        <SizeTable
          rows={data}
          rateGroupId={rateGroupId}
          isPending={isUpsertPending}
          onUpsert={(containerSize, factor, note) =>
            upsertMultiplier({ containerSize, rateGroupId, factor, note })
          }
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function SizeTable({
  rows,
  rateGroupId,
  isPending,
  onUpsert,
  onDelete,
}: {
  rows: RateMultiplierEntity[];
  rateGroupId: number | null;
  isPending: boolean;
  onUpsert: (
    containerSize: RateContainerSize,
    factor: number,
    note: string | null,
  ) => void;
  onDelete: (m: RateMultiplierEntity) => void;
}) {
  const { t } = useTranslation();
  // scope 에 정확히 일치하는 row 만 편집 대상. 나머지(전역 fallback)는 표시만.
  const byScope = new Map<RateContainerSize, RateMultiplierEntity>();
  rows.forEach((m) => {
    if (m.rateGroupId === rateGroupId) byScope.set(m.containerSize, m);
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("rateMultiplier.field.containerSize")}</TableHead>
            <TableHead>{t("rateMultiplier.field.factor")}</TableHead>
            <TableHead>{t("field.note")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {CONTAINER_SIZES.map((size) => (
            <SizeRow
              key={size}
              size={size}
              existing={byScope.get(size)}
              isPending={isPending}
              onUpsert={onUpsert}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SizeRow({
  size,
  existing,
  isPending,
  onUpsert,
  onDelete,
}: {
  size: RateContainerSize;
  existing: RateMultiplierEntity | undefined;
  isPending: boolean;
  onUpsert: (
    containerSize: RateContainerSize,
    factor: number,
    note: string | null,
  ) => void;
  onDelete: (m: RateMultiplierEntity) => void;
}) {
  const { t } = useTranslation();
  const [factor, setFactor] = useState(existing?.factor ?? "");
  const [note, setNote] = useState(existing?.note ?? "");

  const handleSave = () => {
    const n = Number(factor);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error(t("rateMultiplier.invalidFactor"), {
        position: "top-center",
      });
      return;
    }
    onUpsert(size, n, note.trim() || null);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {t(`rateMultiplier.sizeOption.${size}`)}
      </TableCell>
      <TableCell>
        <Input
          value={factor}
          onChange={(e) => setFactor(e.target.value)}
          disabled={isPending}
          inputMode="decimal"
          placeholder="1.0"
          className="max-w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
          maxLength={300}
          className="max-w-xs"
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isPending || factor.trim() === ""}
        >
          {t("common.save")}
        </Button>
        {existing && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-destructive"
            onClick={() => onDelete(existing)}
          >
            {t("common.delete")}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
