// Vessel 목록 — 테이블 + 검색(클라 필터, 300ms debounce) + 페이지 네비.
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
import { useVesselsData } from "@/hooks/queries/use-vessels-data";
import { useDeleteVessel } from "@/hooks/mutations/vessel/use-delete-vessel";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateVesselModal,
  useOpenEditVesselModal,
} from "@/store/vessel-editor-modal";
import type { VesselEntity } from "@/types";

export default function VesselList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useVesselsData(page);
  const openCreate = useOpenCreateVesselModal();
  const openEdit = useOpenEditVesselModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteVessel } = useDeleteVessel({
    onSuccess: () =>
      toast.success("선박이 삭제되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<VesselEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        (v.imoNumber ?? "").toLowerCase().includes(search) ||
        (v.line ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (v: VesselEntity) => {
    openAlert({
      title: "선박을 삭제하시겠습니까?",
      description: `'${v.name}' 을(를) 삭제합니다. 복구할 수 없습니다.`,
      onPositive: () => deleteVessel(v.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이름 / IMO / 선사 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>새 선박</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>IMO</TableHead>
              <TableHead>선사</TableHead>
              <TableHead>활성</TableHead>
              <TableHead className="text-right">동작</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.imoNumber ?? "—"}</TableCell>
                  <TableCell>{v.line ?? "—"}</TableCell>
                  <TableCell>{v.isActive ? "✓" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(v)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(v)}
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
    </div>
  );
}
