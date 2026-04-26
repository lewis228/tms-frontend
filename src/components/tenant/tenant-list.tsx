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
import { useDeleteTenant } from "@/hooks/mutations/tenant/use-delete-tenant";
import { useUpdateTenant } from "@/hooks/mutations/tenant/use-update-tenant";
import { useTenantsData } from "@/hooks/queries/use-tenants-data";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateTenantModal,
  useOpenEditTenantModal,
} from "@/store/tenant-editor-modal";
import type { TenantEntity } from "@/types";

export default function TenantList() {
  const { t: tt } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isPending, error } = useTenantsData();
  const openCreate = useOpenCreateTenantModal();
  const openEdit = useOpenEditTenantModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteT } = useDeleteTenant({
    onSuccess: () =>
      toast.success(tt("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateT } = useUpdateTenant({
    onSuccess: () =>
      toast.success(tt("toast.updated"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<TenantEntity[]>(() => {
    if (!data) return [];
    if (!search) return data;
    return data.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        (t.companyName ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (t: TenantEntity) => {
    openAlert({
      title: tt("tenant.deletePromptTitle", { name: t.name }),
      description: tt("tenant.deletePromptDesc"),
      onPositive: () => deleteT(t.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={tt("tenant.searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>{tt("tenant.newButton")}</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tt("tenant.field.name")}</TableHead>
              <TableHead>{tt("tenant.field.companyName")}</TableHead>
              <TableHead>{tt("tenant.field.timezone")}</TableHead>
              <TableHead>{tt("tenant.field.phone")}</TableHead>
              <TableHead>{tt("common.active")}</TableHead>
              <TableHead className="text-right">{tt("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {tt("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-xs">{t.companyName ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {t.timezone ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {t.phoneNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() =>
                        updateT({
                          id: t.id,
                          payload: { isActive: !t.isActive },
                        })
                      }
                      className={
                        "rounded px-2 py-0.5 text-xs " +
                        (t.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600")
                      }
                    >
                      {t.isActive ? `✓ ${tt("common.active")}` : tt("common.inactive")}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(t)}
                    >
                      {tt("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(t)}
                    >
                      {tt("common.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        {tt("common.totalCount", { count: data.length })}
      </div>
    </div>
  );
}
