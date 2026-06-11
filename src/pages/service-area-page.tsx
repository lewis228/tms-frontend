// 영업 권역 (Service Area) — STATE/COUNTY/CITY/ZIP3 선언 관리.
// 선언이 있으면 요율 화면의 zip/도시 검색(scope=true)이 이 범위로 제한된다.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import CityAutocomplete from "@/components/city-autocomplete";
import { useServiceAreasData } from "@/hooks/queries/use-service-areas-data";
import { useCreateServiceArea } from "@/hooks/mutations/service-area/use-create-service-area";
import { useDeleteServiceArea } from "@/hooks/mutations/service-area/use-delete-service-area";
import { generateErrorMessage } from "@/lib/error";
import type { ServiceAreaKind } from "@/types";

const KINDS: ServiceAreaKind[] = ["STATE", "COUNTY", "CITY", "ZIP3"];
const SELECT_CLASS = "h-9 rounded-md border bg-background px-2 text-sm";

export default function ServiceAreaPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("serviceArea.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("serviceArea.description")}
        </p>
      </div>
      <AddForm />
      <AreaList />
    </div>
  );
}

function AddForm() {
  const { t } = useTranslation();

  const { mutate: createServiceArea, isPending: isCreateServiceAreaPending } =
    useCreateServiceArea({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        setValue("");
      },
      onError: (error) =>
        toast.error(generateErrorMessage(error), { position: "top-center" }),
    });

  const [kind, setKind] = useState<ServiceAreaKind>("STATE");
  const [state, setState] = useState("CA");
  const [value, setValue] = useState("");

  const canAdd =
    state.trim().length === 2 &&
    (kind === "STATE" ||
      (kind === "ZIP3"
        ? /^\d{3}$/.test(value.trim())
        : value.trim().length > 0));

  const handleAdd = () => {
    if (!canAdd) return;
    createServiceArea({
      kind,
      state: state.trim().toUpperCase(),
      value: kind === "STATE" ? null : value.trim(),
    });
  };

  const valueLabel =
    kind === "COUNTY"
      ? t("serviceArea.field.valueCounty")
      : kind === "CITY"
        ? t("serviceArea.field.valueCity")
        : t("serviceArea.field.valueZip3");

  return (
    <section className="flex flex-col gap-2 rounded-md border bg-muted/20 p-4">
      <div className="flex flex-wrap items-end gap-2">
        <FieldCol label={t("serviceArea.field.kind")}>
          <select
            className={`${SELECT_CLASS} w-40`}
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as ServiceAreaKind);
              setValue("");
            }}
            disabled={isCreateServiceAreaPending}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {t(`serviceArea.kind.${k}`)}
              </option>
            ))}
          </select>
        </FieldCol>
        <FieldCol label={t("serviceArea.field.state")}>
          <Input
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            disabled={isCreateServiceAreaPending}
            className="h-9 w-20 uppercase"
          />
        </FieldCol>
        {kind !== "STATE" && (
          <FieldCol label={valueLabel}>
            {kind === "CITY" ? (
              <CityAutocomplete
                value={value}
                state={state}
                onChange={setValue}
                placeholder={t("serviceArea.field.valueCity")}
                className="h-9 w-56"
                disabled={isCreateServiceAreaPending}
              />
            ) : kind === "ZIP3" ? (
              <Input
                value={value}
                onChange={(e) =>
                  setValue(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                inputMode="numeric"
                maxLength={3}
                placeholder={t("serviceArea.zip3Placeholder")}
                disabled={isCreateServiceAreaPending}
                className="h-9 w-28"
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={120}
                placeholder={t("serviceArea.field.valueCounty")}
                disabled={isCreateServiceAreaPending}
                className="h-9 w-56"
              />
            )}
          </FieldCol>
        )}
        <Button
          onClick={handleAdd}
          disabled={isCreateServiceAreaPending || !canAdd}
        >
          {t("serviceArea.addButton")}
        </Button>
      </div>
    </section>
  );
}

function AreaList() {
  const { t } = useTranslation();
  const { data, isPending, error } = useServiceAreasData();

  const { mutate: deleteServiceArea, isPending: isDeleteServiceAreaPending } =
    useDeleteServiceArea({
      onSuccess: () =>
        toast.success(t("toast.deleted"), { position: "top-center" }),
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const items = data.items;

  if (items.length === 0) {
    return (
      <section className="rounded-md border bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">
          {t("serviceArea.empty")}
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2 rounded-md border p-4">
      {items.map((area) => (
        <div
          key={area.id}
          className="flex items-center justify-between rounded border bg-background p-2 text-sm"
        >
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
              {t(`serviceArea.kind.${area.kind}`)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {area.state}
            </span>
            <span>{area.value}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => deleteServiceArea(area.id)}
            disabled={isDeleteServiceAreaPending}
          >
            {t("common.delete")}
          </Button>
        </div>
      ))}
    </section>
  );
}

function FieldCol({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
