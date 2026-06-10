// zip 마스터 picker — 검색해서 zip 선택 → zipId 저장. label = "90745 · Carson, CA".
// location/customer/terminal 폼에서 공통 사용. (정산 dest 자동채움의 원천)
import { useTranslation } from "react-i18next";

import SearchableSelect from "@/components/searchable-select";
import { searchZipCodes, fetchZipCode } from "@/api/zip-code";
import type { ZipCodeEntity } from "@/types";

export default function ZipPicker({
  value,
  onSelect,
  disabled,
}: {
  value: number | null;
  onSelect: (id: number | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <SearchableSelect<ZipCodeEntity>
      value={value}
      onSelect={(id) => onSelect(id)}
      fetchList={(q) => (q ? searchZipCodes(q) : Promise.resolve([]))}
      fetchById={(id) => fetchZipCode(id)}
      queryKeyBase={["zip-code", "search"]}
      getLabel={(z) => `${z.zip} · ${z.city}, ${z.state}`}
      placeholder={t("field.zipPlaceholder")}
      emptyLabel={t("common.none")}
      disabled={disabled}
    />
  );
}
