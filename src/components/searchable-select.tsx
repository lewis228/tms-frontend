// 검색 가능한 select. Popover + 내부 검색 input + 디바운스된 query.
//
// 설계 결정:
// - popover 열렸을 때만 fetch (lazy). 닫혀있는 동안 cache 유지.
// - 디바운스 200ms (사용자 타이핑 직후 막바지 query 만 발사).
// - 선택된 id 의 label resolution: fetched items 에 없으면 initialItem 사용 (EDIT 초기값).
//
// 호출처:
//   <SearchableSelect<CustomerEntity>
//     value={customerId}
//     onSelect={(id, item) => { setCustomerId(id); if (item) setSelectedCustomer(item); }}
//     initialItem={initialCustomer}
//     fetchList={(q) => fetchCustomers({ q, size: 50 }).then((r) => r.items)}
//     queryKeyBase={["customer", "search"]}
//     getLabel={(c) => c.name}
//     placeholder="고객사 선택"
//     emptyLabel="— 선택 안함 —"
//   />
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Loader from "@/components/loader";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Item = { id: number };

type Props<T extends Item> = {
  value: number | null;
  onSelect: (id: number | null, item: T | null) => void;
  fetchList: (q: string | undefined) => Promise<T[]>;
  /** EDIT 시 미리 선택된 id 의 entity 를 lazy hydrate. 없으면 button 라벨이
   *  fetchList 첫 결과에서 찾아질 때까지 placeholder 로 보임. */
  fetchById?: (id: number) => Promise<T>;
  queryKeyBase: readonly unknown[];
  getLabel: (item: T) => string;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
};

export default function SearchableSelect<T extends Item>({
  value,
  onSelect,
  fetchList,
  fetchById,
  queryKeyBase,
  getLabel,
  placeholder = "선택하세요",
  emptyLabel,
  disabled,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), 200);
    return () => clearTimeout(t);
  }, [input]);

  const { data: items = [], isPending } = useQuery({
    queryKey: [...queryKeyBase, debounced],
    queryFn: () => fetchList(debounced || undefined),
    enabled: open,
  });

  // EDIT hydration — value 있으면 byId 로 미리 채워둠
  const { data: hydrated } = useQuery({
    queryKey: [...queryKeyBase, "byId", value],
    queryFn: () => fetchById!(value!),
    enabled: value != null && !!fetchById,
  });

  // 선택 id 가 fetched 에 있으면 그걸, 없으면 hydrated, 없으면 null
  const selectedItem =
    items.find((it) => it.id === value) ?? hydrated ?? null;
  const display = selectedItem ? getLabel(selectedItem) : "";

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={
            "flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 " +
            (className ?? "")
          }
        >
          <span className={display ? "" : "text-muted-foreground"}>
            {display || placeholder}
          </span>
          <span className="ml-2 text-xs text-muted-foreground" aria-hidden>
            ▾
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <div className="border-b p-2">
          <Input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="검색..."
            className="h-8"
          />
        </div>
        <div className="max-h-60 overflow-y-auto py-1">
          {isPending ? (
            <div className="flex justify-center py-4">
              <Loader />
            </div>
          ) : (
            <ul>
              {emptyLabel && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(null, null);
                      setOpen(false);
                    }}
                    className={
                      "block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 " +
                      (value === null ? "bg-accent/30 font-medium" : "")
                    }
                  >
                    {emptyLabel}
                  </button>
                </li>
              )}
              {items.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                  결과가 없습니다.
                </li>
              ) : (
                items.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(it.id, it);
                        setOpen(false);
                      }}
                      className={
                        "block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 " +
                        (it.id === value ? "bg-accent/30 font-medium" : "")
                      }
                    >
                      {getLabel(it)}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
