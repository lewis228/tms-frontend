// zip 마스터 autocomplete — zip-picker 와 같은 검색 API 를 쓰지만 zipId 가 아니라
// zip 문자열 자체를 emit 한다. (양방향 요율 셀 좌표는 zip 코드 문자열)
// label = "90731 · San Pedro, CA".
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import Loader from "@/components/loader";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchZipCodes } from "@/api/zip-code";
import { QUERY_KEYS } from "@/lib/constants";
import type { ZipCodeEntity } from "@/types";

const getLabel = (z: ZipCodeEntity) => `${z.zip} · ${z.city}, ${z.state}`;

export default function ZipStringPicker({
  value,
  onSelect,
  placeholder,
  disabled,
}: {
  value: string | null;
  onSelect: (zip: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(input.trim()), 200);
    return () => clearTimeout(id);
  }, [input]);

  const { data: items = [], isPending } = useQuery({
    queryKey: QUERY_KEYS.zipCode.search(debounced),
    queryFn: () =>
      debounced ? searchZipCodes(debounced) : Promise.resolve([]),
    enabled: open,
  });

  // 선택된 zip 이 검색 결과에 있으면 풀 라벨, 없으면 zip 문자열 그대로.
  const selectedItem = items.find((it) => it.zip === value) ?? null;
  const display = selectedItem ? getLabel(selectedItem) : (value ?? "");
  const placeholderText = placeholder ?? t("common.selectPlaceholder");

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className={display ? "" : "text-muted-foreground"}>
            {display || placeholderText}
          </span>
          <span className="ml-2 text-xs text-muted-foreground" aria-hidden>
            ▾
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div className="border-b p-2">
          <Input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("common.search")}
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
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                  className={
                    "block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 " +
                    (value === null ? "bg-accent/30 font-medium" : "")
                  }
                >
                  {t("common.none")}
                </button>
              </li>
              {items.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                  {t("common.noData")}
                </li>
              ) : (
                items.map((it) => (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(it.zip);
                        setOpen(false);
                      }}
                      className={
                        "block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 " +
                        (it.zip === value ? "bg-accent/30 font-medium" : "")
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
