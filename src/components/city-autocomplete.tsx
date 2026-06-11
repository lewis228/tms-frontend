import { useEffect, useId, useState } from "react";

import { Input } from "@/components/ui/input";
import { useCitySuggestionsData } from "@/hooks/queries/use-city-suggestions-data";

// zip 마스터 도시 자동완성 입력 — 선택된 state 로 후보를 필터한다.
// scope=true 면 팀 영업권역 내 도시로 제한 (요율 컨텍스트 전용).
export default function CityAutocomplete({
  value,
  state,
  onChange,
  placeholder,
  className,
  scope = false,
  disabled,
}: {
  value: string;
  state: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
  scope?: boolean;
  disabled?: boolean;
}) {
  const listId = useId();
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), 250);
    return () => clearTimeout(id);
  }, [value]);

  const { data } = useCitySuggestionsData(debounced, state, scope);
  // 같은 state 내 도시명 중복 제거.
  const cities = Array.from(new Set((data ?? []).map((c) => c.city)));

  return (
    <>
      <Input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      <datalist id={listId}>
        {cities.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}
