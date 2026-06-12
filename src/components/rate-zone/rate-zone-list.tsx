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
import { useRateGroupsData } from "@/hooks/queries/use-rate-groups-data";
import { useRateZonesData } from "@/hooks/queries/use-rate-zones-data";
import { useDeleteRateZone } from "@/hooks/mutations/rate-zone/use-delete-rate-zone";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateRateZoneModal,
  useOpenEditRateZoneModal,
} from "@/store/rate-zone-editor-modal";
import type { RateZoneEntity } from "@/types";

export default function RateZoneList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setSearch(searchInput.trim().toLowerCase()),
      300
    );
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const { data, isPending, error } = useRateZonesData(page);
  const { data: groupsData } = useRateGroupsData();
  const openCreate = useOpenCreateRateZoneModal();
  const openEdit = useOpenEditRateZoneModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteRateZone } = useDeleteRateZone({
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const groupName = useMemo(() => {
    const m = new Map<number, string>();
    groupsData?.items.forEach((g) => m.set(g.id, g.name));
    return m;
  }, [groupsData]);

  const filtered = useMemo<RateZoneEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        (v.code ?? "").toLowerCase().includes(search) ||
        (v.description ?? "").toLowerCase().includes(search)
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (v: RateZoneEntity) => {
    openAlert({
      title: t("rateZone.deletePromptTitle", { name: v.name }),
      description: t("rateZone.deletePromptDesc"),
      onPositive: () => deleteRateZone(v.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={t("rateZone.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>{t("rateZone.newButton")}</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("rateZone.field.color")}</TableHead>
              <TableHead>{t("field.name")}</TableHead>
              <TableHead>{t("rateZone.field.kind")}</TableHead>
              <TableHead>{t("rateZone.field.scope")}</TableHead>
              <TableHead>{t("field.code")}</TableHead>
              <TableHead>{t("field.note")}</TableHead>
              <TableHead>{t("common.active")}</TableHead>
              <TableHead className="text-right">
                {t("common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <span
                      className="inline-block size-4 rounded-full border"
                      style={{ backgroundColor: v.color ?? "transparent" }}
                      aria-hidden
                    />
                  </TableCell>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                        v.kind === "ZIP"
                          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {t(`rateZone.kind.${v.kind}`)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                        v.rateGroupId == null
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10"
                      }`}
                    >
                      {v.rateGroupId == null
                        ? t("rateZone.scope.global")
                        : (groupName.get(v.rateGroupId) ?? `#${v.rateGroupId}`)}
                    </span>
                  </TableCell>
                  <TableCell>{v.code ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {v.description ?? "—"}
                  </TableCell>
                  <TableCell>{v.isActive ? "✓" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(v)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(v)}
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
          {t("common.totalCount", { count: data.total })} ·{" "}
          {t("common.pageOf", {
            page: data.page,
            pages: Math.max(1, data.pages),
          })}
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
