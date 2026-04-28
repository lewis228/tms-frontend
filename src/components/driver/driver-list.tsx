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
import { useDriversData } from "@/hooks/queries/use-drivers-data";
import { useDeleteDriver } from "@/hooks/mutations/driver/use-delete-driver";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateDriverModal,
  useOpenEditDriverModal,
} from "@/store/driver-editor-modal";
import type { DriverEntity } from "@/types";

export default function DriverList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim().toLowerCase()),
      300,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isPending, error } = useDriversData(page);
  const openCreate = useOpenCreateDriverModal();
  const openEdit = useOpenEditDriverModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteDriver } = useDeleteDriver({
    onSuccess: () =>
      toast.success(t("driver.toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<DriverEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (d) =>
        d.name.toLowerCase().includes(search) ||
        d.email.toLowerCase().includes(search) ||
        (d.licenseNumber ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (d: DriverEntity) => {
    openAlert({
      title: t("driver.deletePromptTitle", { name: d.name }),
      description: t("driver.deleteUserDeactivateDesc", { name: d.name }),
      onPositive: () => deleteDriver(d.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={t("driver.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>{t("driver.newButton")}</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("field.name")}</TableHead>
              <TableHead>{t("field.email")}</TableHead>
              <TableHead>{t("field.phone")}</TableHead>
              <TableHead>{t("driver.field.licenseNumber")}</TableHead>
              <TableHead>{t("common.active")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.phone ?? t("common.none")}</TableCell>
                  <TableCell>
                    {d.licenseNumber
                      ? `${d.licenseNumber}${d.licenseState ? ` (${d.licenseState})` : ""}`
                      : t("common.none")}
                  </TableCell>
                  <TableCell>{d.isActive ? "✓" : t("common.none")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(d)}
                    >
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(d)}
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
          {t("common.pageOf", { page: data.page, pages: Math.max(1, data.pages) })}
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
