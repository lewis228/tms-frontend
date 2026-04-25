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
import { useDeleteUser } from "@/hooks/mutations/user/use-delete-user";
import { useUsersData } from "@/hooks/queries/use-users-data";
import { useTenantsData } from "@/hooks/queries/use-tenants-data";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateSystemUserModal,
  useOpenEditSystemUserModal,
} from "@/store/system-user-editor-modal";
import type { UserEntity } from "@/types";

export default function SystemUserList() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: tenants, isPending: tenantsPending, error: tenantsError } =
    useTenantsData();

  // 사용자가 select 로 명시 변경하기 전까지는 첫 tenant 를 default 로 사용 (derived).
  const tenantId = selectedTenantId ?? tenants?.[0]?.id ?? null;

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useUsersData(tenantId, page);
  const openCreate = useOpenCreateSystemUserModal();
  const openEdit = useOpenEditSystemUserModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteU } = useDeleteUser({
    onSuccess: () =>
      toast.success("사용자가 삭제되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<UserEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (u) =>
        u.email.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search) ||
        u.role.toLowerCase().includes(search),
    );
  }, [data, search]);

  if (tenantsError) return <Fallback />;
  if (tenantsPending) return <Loader />;

  if (!tenants || tenants.length === 0) {
    return (
      <p className="rounded-md border bg-background p-6 text-center text-sm text-muted-foreground">
        Tenant 가 없습니다. /app/system/tenants 에서 먼저 생성하세요.
      </p>
    );
  }

  const handleDelete = (u: UserEntity) => {
    if (!tenantId) return;
    openAlert({
      title: `'${u.name}' 사용자를 삭제하시겠습니까?`,
      description: "복구할 수 없습니다.",
      onPositive: () => deleteU({ id: u.id, tenantId }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={tenantId ?? ""}
          onChange={(e) => {
            setSelectedTenantId(e.target.value || null);
            setPage(1);
          }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.slug})
            </option>
          ))}
        </select>
        <Input
          placeholder="이메일 / 이름 / role 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-72"
        />
        <Button
          onClick={() => tenantId && openCreate(tenantId)}
          disabled={!tenantId}
        >
          새 사용자
        </Button>
      </div>

      {error ? (
        <Fallback />
      ) : isPending ? (
        <Loader />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이메일</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>전화</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead className="text-right">동작</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {u.role}
                      </TableCell>
                      <TableCell>{u.phone ?? "—"}</TableCell>
                      <TableCell>
                        {u.isActive ? (
                          <span className="text-green-700">✓</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString("ko-KR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => tenantId && openEdit(tenantId, u)}
                          disabled={u.role === "SUPER_ADMIN"}
                        >
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-destructive"
                          onClick={() => handleDelete(u)}
                          disabled={u.role === "SUPER_ADMIN"}
                        >
                          삭제
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
        </>
      )}
    </div>
  );
}
