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
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { useCustomersData } from "@/hooks/queries/use-customers-data";
import { useDeleteLocation } from "@/hooks/mutations/location/use-delete-location";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateLocationModal,
  useOpenEditLocationModal,
} from "@/store/location-editor-modal";
import type { LocationEntity } from "@/types";

export default function LocationList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useLocationsData(page);
  const { data: customersData } = useCustomersData(1);
  const openCreate = useOpenCreateLocationModal();
  const openEdit = useOpenEditLocationModal();
  const openAlert = useOpenAlertModal();

  const customerNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of customersData?.items ?? []) m.set(c.id, c.name);
    return m;
  }, [customersData]);

  const { mutate: deleteLocation } = useDeleteLocation({
    onSuccess: () =>
      toast.success("장소가 삭제되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<LocationEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        v.kind.toLowerCase().includes(search) ||
        (v.address ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (v: LocationEntity) => {
    openAlert({
      title: "장소를 삭제하시겠습니까?",
      description: `'${v.name}' 을(를) 삭제합니다. 복구할 수 없습니다.`,
      onPositive: () => deleteLocation(v.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이름 / 종류 / 주소 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>새 장소</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>종류</TableHead>
              <TableHead>고객사</TableHead>
              <TableHead>주소</TableHead>
              <TableHead>위/경도</TableHead>
              <TableHead className="text-right">동작</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.kind}</TableCell>
                  <TableCell>
                    {v.customerId
                      ? (customerNameById.get(v.customerId) ?? "—")
                      : "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {v.address ?? "—"}
                  </TableCell>
                  <TableCell>
                    {v.latitude && v.longitude
                      ? `${v.latitude}, ${v.longitude}`
                      : "—"}
                  </TableCell>
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
