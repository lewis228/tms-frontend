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
import { useTerminalsData } from "@/hooks/queries/use-terminals-data";
import { useDeleteTerminal } from "@/hooks/mutations/terminal/use-delete-terminal";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import {
  useOpenCreateTerminalModal,
  useOpenEditTerminalModal,
} from "@/store/terminal-editor-modal";
import type { TerminalEntity } from "@/types";

export default function TerminalList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isPending, error } = useTerminalsData(page);
  const openCreate = useOpenCreateTerminalModal();
  const openEdit = useOpenEditTerminalModal();
  const openAlert = useOpenAlertModal();

  const { mutate: deleteTerminal } = useDeleteTerminal({
    onSuccess: () =>
      toast.success("터미널이 삭제되었습니다.", { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  const filtered = useMemo<TerminalEntity[]>(() => {
    if (!data) return [];
    if (!search) return data.items;
    return data.items.filter(
      (v) =>
        v.name.toLowerCase().includes(search) ||
        (v.code ?? "").toLowerCase().includes(search) ||
        (v.address ?? "").toLowerCase().includes(search),
    );
  }, [data, search]);

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleDelete = (v: TerminalEntity) => {
    openAlert({
      title: "터미널을 삭제하시겠습니까?",
      description: `'${v.name}' 을(를) 삭제합니다. 복구할 수 없습니다.`,
      onPositive: () => deleteTerminal(v.id),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이름 / 코드 / 주소 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => openCreate()}>새 터미널</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>코드</TableHead>
              <TableHead>주소</TableHead>
              <TableHead>위/경도</TableHead>
              <TableHead>활성</TableHead>
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
                  <TableCell>{v.code ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {v.address ?? "—"}
                  </TableCell>
                  <TableCell>
                    {v.latitude && v.longitude
                      ? `${v.latitude}, ${v.longitude}`
                      : "—"}
                  </TableCell>
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
