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
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useDriversData(page);
  const openCreate = useOpenCreateDriverModal();
  const openEdit = useOpenEditDriverModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteDriver } = useDeleteDriver({
    onSuccess: () =>
      toast.success("기사가 삭제되었습니다.", { position: "top-center" }),
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
        (d.licenseNumber ?? "").toLowerCase().includes(search) ||
        (d.truckNumber ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (d: DriverEntity) => {
    openAlert({
      title: "기사를 삭제하시겠습니까?",
      description: `'${d.name}' 을(를) 삭제합니다. User 계정도 함께 비활성화됩니다.`,
      onPositive: () => deleteDriver(d.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이름 / 이메일 / 면허 / 차량 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>새 기사</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>전화</TableHead>
              <TableHead>면허</TableHead>
              <TableHead>차량</TableHead>
              <TableHead>활성</TableHead>
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
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.phone ?? "—"}</TableCell>
                  <TableCell>
                    {d.licenseNumber
                      ? `${d.licenseNumber}${d.licenseState ? ` (${d.licenseState})` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell>{d.truckNumber ?? "—"}</TableCell>
                  <TableCell>{d.isActive ? "✓" : "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(d)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 text-destructive"
                      onClick={() => handleDelete(d)}
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
