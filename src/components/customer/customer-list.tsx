// Customers 목록 — 조회 DISPATCHER+, 수정 ADMIN+ (UI 게이트 포함).
import { useEffect, useMemo, useState } from "react";
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

export default function CustomerList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const role = useCurrentRole();
  const canEdit = hasAccess(role, "ADMIN");

  const { data, isPending, error } = useCustomersData(page);
  const openCreate = useOpenCreateCustomerModal();
  const openEdit = useOpenEditCustomerModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteCustomer } = useDeleteCustomer({
    onSuccess: () =>
      toast.success("고객사가 삭제되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<CustomerEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        (c.code ?? "").toLowerCase().includes(search) ||
        (c.contactName ?? "").toLowerCase().includes(search) ||
        (c.contactEmail ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (c: CustomerEntity) => {
    openAlert({
      title: "고객사를 삭제하시겠습니까?",
      description: `'${c.name}' 을(를) 삭제합니다. 복구할 수 없습니다.`,
      onPositive: () => deleteCustomer(c.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이름 / 코드 / 담당자 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        {canEdit && <Button onClick={() => openCreate()}>새 고객사</Button>}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>코드</TableHead>
              <TableHead>담당자</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>활성</TableHead>
              {canEdit && <TableHead className="text-right">동작</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 6 : 5}
                  className="text-center text-muted-foreground"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.code ?? "—"}</TableCell>
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
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-destructive"
                        onClick={() => handleDelete(c)}
                      >
                        삭제
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
          전체 {data.total}건 · {data.page}/{Math.max(1, data.pages)} 페이지
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
