// ExtraCharge 인라인 편집 — calculate/adjust 모달 안에서 사용.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExtraChargeInput } from "@/api/settlement";

export default function ExtrasEditor({
  rows,
  setRows,
  disabled,
}: {
  rows: ExtraChargeInput[];
  setRows: (next: ExtraChargeInput[]) => void;
  disabled?: boolean;
}) {
  const update = (i: number, patch: Partial<ExtraChargeInput>) => {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const remove = (i: number) =>
    setRows(rows.filter((_, idx) => idx !== i));
  const add = () =>
    setRows([...rows, { type: "", amount: "0", description: "" }]);

  const total = rows.reduce((acc, r) => {
    const n = Number(r.amount);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Extra Charges ({rows.length}) · 합계 {total.toFixed(2)}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={add}
          disabled={disabled}
        >
          + 추가
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          추가 비용이 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_120px_2fr_auto] items-center gap-2"
            >
              <Input
                placeholder="유형 (chassis 등)"
                value={r.type}
                onChange={(e) => update(i, { type: e.target.value })}
                disabled={disabled}
                maxLength={32}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="금액"
                value={r.amount}
                onChange={(e) => update(i, { amount: e.target.value })}
                disabled={disabled}
                className="text-right"
              />
              <Input
                placeholder="설명"
                value={r.description ?? ""}
                onChange={(e) =>
                  update(i, { description: e.target.value || null })
                }
                disabled={disabled}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => remove(i)}
                disabled={disabled}
                className="text-destructive"
              >
                삭제
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
