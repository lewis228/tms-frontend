// Customers 목록 — 조회 DISPATCHER+, 수정 ADMIN+ (UI 게이트 포함).
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
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeleteCustomer } from "@/hooks/mutations/customer/use-delete-customer";
import { hasAccess } from "@/lib/nav-config";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useCurrentRole } from "@/store/auth";
import {
  useOpenCreateCustomerModal,
  useOpenEditCustomerModal,
} from "@/store/customer-editor-modal";
import type { CustomerEntity } from "@/types";

type KindFilter = "ALL" | "CUSTOMER" | "CARRIER" | "BROKER" | "VENDOR";

export default function CustomerList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("ALL");

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setSearch(searchInput.trim().toLowerCase()),
      300,
    );
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const role = useCurrentRole();
  const canEdit = hasAccess(role, "ADMIN");

  const { data, isPending, error } = useCustomersData(page);
  const openCreate = useOpenCreateCustomerModal();
  const openEdit = useOpenEditCustomerModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteCustomer } = useDeleteCustomer({
    onSuccess: () =>
      toast.success(t("toast.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<CustomerEntity[]>(() => {
    if (!data) return [];
    let items = data.items;
    if (kindFilter !== "ALL") items = items.filter((c) => c.kind === kindFilter);
    if (!search) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.code ?? "").toLowerCase().includes(search) ||
        (c.contactName ?? "").toLowerCase().includes(search) ||
        (c.contactEmail ?? "").toLowerCase().includes(search),
    );
  }, [data, search, kindFilter]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (c: CustomerEntity) => {
    openAlert({
      title: t("customer.deletePromptTitle", { name: c.name }),
      description: t("customer.deletePromptDesc"),
      onPositive: () => deleteCustomer(c.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("customer.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="ALL">{t("customer.kindFilter.all")}</option>
            <option value="CUSTOMER">{t("customer.kind.CUSTOMER")}</option>
            <option value="CARRIER">{t("customer.kind.CARRIER")}</option>
            <option value="BROKER">{t("customer.kind.BROKER")}</option>
            <option value="VENDOR">{t("customer.kind.VENDOR")}</option>
          </select>
        </div>
        {canEdit && (
          <Button onClick={() => openCreate()}>{t("customer.newButton")}</Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("field.name")}</TableHead>
              <TableHead>{t("field.code")}</TableHead>
              <TableHead>{t("customer.field.kind")}</TableHead>
              <TableHead>{t("customer.field.contactName")}</TableHead>
              <TableHead>{t("field.email")}</TableHead>
              <TableHead>{t("common.active")}</TableHead>
              {canEdit && (
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 7 : 6}
                  className="text-center text-muted-foreground"
                >
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.code ?? "—"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        "rounded px-1.5 py-0.5 text-xs " +
                        (c.kind === "CUSTOMER"
                          ? "bg-blue-100 text-blue-700"
                          : c.kind === "CARRIER"
                            ? "bg-amber-100 text-amber-700"
                            : c.kind === "BROKER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-muted text-muted-foreground")
                      }
                    >
                      {c.kind}
                    </span>
                  </TableCell>
                  <TableCell>{c.contactName ?? "—"}</TableCell>
                  <TableCell>{c.contactEmail ?? "—"}</TableCell>
                  <TableCell>{c.isActive ? "✓" : "—"}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(c)}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-destructive"
                        onClick={() => handleDelete(c)}
                      >
                        {t("common.delete")}
                      </Button>
                    </TableCell>
                  )}
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
