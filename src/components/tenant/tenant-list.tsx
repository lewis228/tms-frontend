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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useTenantsData();
  const openCreate = useOpenCreateTenantModal();
  const openEdit = useOpenEditTenantModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteT } = useDeleteTenant({
    onSuccess: () =>
      toast.success("Tenant 가 삭제되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const { mutate: updateT } = useUpdateTenant({
    onSuccess: () =>
      toast.success("활성 상태가 변경되었습니다.", {
        position: "top-center",
      }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<TenantEntity[]>(() => {
    if (!data) return [];
    if (!search) return data;
    return data.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.slug.toLowerCase().includes(search) ||
        (t.contactEmail ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (t: TenantEntity) => {
    openAlert({
      title: `Tenant '${t.name}' 을(를) 삭제하시겠습니까?`,
      description:
        "⚠ Tenant 삭제는 CASCADE 로 모든 사용자/D-O/Leg/Settlement/파일 등 모든 연관 데이터가 영구 삭제됩니다. 복구할 수 없습니다.",
      onPositive: () => deleteT(t.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이름 / slug / 이메일 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>새 Tenant</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Active</TableHead>
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
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                  <TableCell>{t.planTier}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {t.timezone}
                  </TableCell>
                  <TableCell className="text-xs">
                    {t.contactEmail ?? "—"}
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
                      {t.isActive ? "✓ Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(t)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(t)}
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

      <div className="text-xs text-muted-foreground">전체 {data.length}개</div>
    </div>
  );
}
