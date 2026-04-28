// 챠시 단순 select. owner_kind 별 그룹.
import { useTranslation } from "react-i18next";
import { useChassisData } from "@/hooks/queries/use-chassis-data";

export default function ChassisSelect({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const { data } = useChassisData(1, 200);
  const items = data?.items ?? [];

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
      className="h-9 rounded-md border bg-background px-3 text-sm"
    >
      <option value="">— {t("common.none")} —</option>
      {items.map((c) => (
        <option key={c.id} value={c.id}>
          {c.chassisNumber} ({c.ownerKind}
          {c.size ? ` / ${c.size}'` : ""})
        </option>
      ))}
    </select>
  );
}
