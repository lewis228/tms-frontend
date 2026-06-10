// Typed Point picker — 1차 타입(Terminal/Yard/Customer) → 2차 그 타입 마스터 목록.
// Point(=container_stop) / Stop add-on 위치 입력에 공통 사용.
import { useTranslation } from "react-i18next";

import SearchableSelect from "@/components/searchable-select";
import { fetchTerminal, fetchTerminals } from "@/api/terminal";
import { fetchCustomer, fetchCustomers } from "@/api/customer";
import { fetchLocation, fetchLocations } from "@/api/location";
import { EMPTY_POINT, type PointValue } from "@/lib/point";
import type {
  CustomerEntity,
  LocationEntity,
  PointType,
  TerminalEntity,
} from "@/types";

const TYPES: PointType[] = ["TERMINAL", "YARD", "CUSTOMER"];
const SEARCH_SIZE = 50;

export default function PointPicker({
  value,
  onChange,
  disabled,
}: {
  value: PointValue;
  onChange: (v: PointValue) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  const setType = (pointType: PointType | "") => {
    // 타입 변경 시 마스터 FK 전부 초기화
    onChange({
      pointType: pointType === "" ? null : pointType,
      terminalId: null,
      locationId: null,
      customerId: null,
    });
  };

  return (
    <div className="flex gap-2">
      <select
        value={value.pointType ?? ""}
        onChange={(e) => setType(e.target.value as PointType | "")}
        disabled={disabled}
        className="h-10 w-32 rounded-md border bg-background px-2 text-sm"
      >
        <option value="">{t("point.type.placeholder")}</option>
        {TYPES.map((pt) => (
          <option key={pt} value={pt}>
            {t(`point.type.${pt}`)}
          </option>
        ))}
      </select>

      <div className="flex-1">
        {value.pointType === "TERMINAL" && (
          <SearchableSelect<TerminalEntity>
            value={value.terminalId}
            onSelect={(id) =>
              onChange({ ...EMPTY_POINT, pointType: "TERMINAL", terminalId: id })
            }
            fetchList={(q) =>
              fetchTerminals({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchTerminal(id)}
            queryKeyBase={["terminal", "search"]}
            getLabel={(x) => x.name}
            placeholder={t("point.pickPlaceholder")}
            emptyLabel={t("point.pickPlaceholder")}
            disabled={disabled}
          />
        )}
        {value.pointType === "YARD" && (
          <SearchableSelect<LocationEntity>
            value={value.locationId}
            onSelect={(id) =>
              onChange({ ...EMPTY_POINT, pointType: "YARD", locationId: id })
            }
            fetchList={(q) =>
              // YARD 캐스케이드: location 중 kind=YARD 만 (types.ts 의 YARD→location(kind=YARD))
              fetchLocations({ q, size: SEARCH_SIZE, kind: "YARD" }).then(
                (r) => r.items,
              )
            }
            fetchById={(id) => fetchLocation(id)}
            queryKeyBase={["location", "search", "yard"]}
            getLabel={(x) => x.name}
            placeholder={t("point.pickPlaceholder")}
            emptyLabel={t("point.pickPlaceholder")}
            disabled={disabled}
          />
        )}
        {value.pointType === "CUSTOMER" && (
          <SearchableSelect<CustomerEntity>
            value={value.customerId}
            onSelect={(id) =>
              onChange({ ...EMPTY_POINT, pointType: "CUSTOMER", customerId: id })
            }
            fetchList={(q) =>
              fetchCustomers({ q, size: SEARCH_SIZE }).then((r) => r.items)
            }
            fetchById={(id) => fetchCustomer(id)}
            queryKeyBase={["customer", "search"]}
            getLabel={(x) => x.name}
            placeholder={t("point.pickPlaceholder")}
            emptyLabel={t("point.pickPlaceholder")}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
