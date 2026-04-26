import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { useDeleteRateSetting } from "@/hooks/mutations/rate-setting/use-delete-rate-setting";
import { useUpdateRateSetting } from "@/hooks/mutations/rate-setting/use-update-rate-setting";
import { useRateSettingsData } from "@/hooks/queries/use-rate-settings-data";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateRateSettingModal,
  useOpenEditRateSettingModal,
} from "@/store/rate-setting-editor-modal";
import type { RateSettingEntity } from "@/types";

export default function RateSettingList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const tm = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(tm);
  }, [searchInput]);

  const { data, isPending, error } = useRateSettingsData(page);
  const openCreate = useOpenCreateRateSettingModal();
  const openEdit = useOpenEditRateSettingModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteRate } = useDeleteRateSetting({
    onSuccess: () =>
      toast.success(t("toast.deleted"), {
        position: "top-center",
      }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateRate } = useUpdateRateSetting({
    onSuccess: () =>
      toast.success(t("rateSetting.activeToggled"), {
        position: "top-center",
      }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<RateSettingEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        (r.description ?? "").toLowerCase().includes(search) ||
        r.rateType.toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (r: RateSettingEntity) => {
    openAlert({
      title: t("rateSetting.deletePromptTitle"),
      description: t("rateSetting.deletePromptDesc", { name: r.name }),
      onPositive: () => deleteRate(r.id),
    });
  };

  const formatAmount = (r: RateSettingEntity): string => {
    if (r.rateType === "FLAT_RATE") return r.flatAmount ?? "—";
    if (r.rateType === "PERCENTAGE") return `${r.ratePercent ?? "—"}%`;
    if (r.rateType === "PER_MILE") return `${r.ratePerMile ?? "—"}/mi`;
    return "—";
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={t("rateSetting.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>{t("rateSetting.newButton")}</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rateSetting.field.name")}</TableHead>
              <TableHead>{t("rateSetting.field.type")}</TableHead>
              <TableHead className="text-right">
                {t("rateSetting.field.amount")}
              </TableHead>
              <TableHead>{t("rateSetting.field.effective")}</TableHead>
              <TableHead>{t("rateSetting.field.active")}</TableHead>
              <TableHead>{t("rateSetting.field.description")}</TableHead>
              <TableHead className="text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.rateType}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatAmount(r)}
                  </TableCell>
                  <TableCell>{r.effectiveDate}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        updateRate({
                          id: r.id,
                          payload: { isActive: !r.isActive },
                        })
                      }
                      className={
                        "rounded px-2 py-0.5 text-xs " +
                        (r.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600")
                      }
                    >
                      {r.isActive
                        ? t("rateSetting.field.activeOn")
                        : t("rateSetting.field.inactive")}
                    </button>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {r.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(r)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(r)}
                    >
                      {t("common.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {t("common.totalCount", { count: data.total })} · {data.page}/
          {Math.max(1, data.pages)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
