// D/O Add-on 섹션 — D/O 단위 추가요금(고객 청구) 리스트 + 추가/수정/삭제.
// amount 공란이면 백엔드가 accessorial 마스터 단가로 자동 채움.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useDeliveryOrderAddonsData } from "@/hooks/queries/use-delivery-order-addons-data";
import { useCreateDeliveryOrderAddon } from "@/hooks/mutations/delivery-order-addon/use-create-delivery-order-addon";
import { useUpdateDeliveryOrderAddon } from "@/hooks/mutations/delivery-order-addon/use-update-delivery-order-addon";
import { useDeleteDeliveryOrderAddon } from "@/hooks/mutations/delivery-order-addon/use-delete-delivery-order-addon";
import { useAddonsData } from "@/hooks/queries/use-addons-data";
import { formatAmount } from "@/lib/format";
import { generateErrorMessage } from "@/lib/error";
import type { DeliveryOrderAddonEntity } from "@/types";

export default function DeliveryOrderAddonsSection({
  deliveryOrderId,
  editable,
}: {
  deliveryOrderId: number;
  editable: boolean;
}) {
  const { t } = useTranslation();
  const {
    data: addons,
    isPending,
    error,
  } = useDeliveryOrderAddonsData(deliveryOrderId);
  const { data: addonTypes } = useAddonsData(1, 200);

  const onError = (err: Error) =>
    toast.error(generateErrorMessage(err), { position: "top-center" });

  const { mutate: createAddon, isPending: isCreatePending } =
    useCreateDeliveryOrderAddon({
      onSuccess: () => {
        toast.success(t("toast.created"), { position: "top-center" });
        setNewAddonId(null);
        setNewQuantity("1");
        setNewUnitAmount("");
        setNewAmount("");
      },
      onError,
    });
  const { mutate: updateAddon, isPending: isUpdatePending } =
    useUpdateDeliveryOrderAddon({
      onSuccess: () => {
        toast.success(t("toast.updated"), { position: "top-center" });
        setEditingId(null);
      },
      onError,
    });
  const { mutate: deleteAddon, isPending: isDeletePending } =
    useDeleteDeliveryOrderAddon({
      onSuccess: () =>
        toast.success(t("toast.deleted"), { position: "top-center" }),
      onError,
    });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnitAmount, setEditUnitAmount] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const [newAddonId, setNewAddonId] = useState<number | null>(null);
  const [newQuantity, setNewQuantity] = useState("1");
  const [newUnitAmount, setNewUnitAmount] = useState("");
  const [newAmount, setNewAmount] = useState("");

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const mutating = isCreatePending || isUpdatePending || isDeletePending;

  const startEdit = (addon: DeliveryOrderAddonEntity) => {
    setEditingId(addon.id);
    setEditQuantity(addon.quantity);
    setEditUnitAmount(addon.unitAmount ?? "");
    setEditAmount(addon.amount);
  };

  const handleSaveEdit = (addonId: number) => {
    updateAddon({
      deliveryOrderId,
      addonId,
      payload: {
        quantity: editQuantity.trim() || "1",
        unitAmount: editUnitAmount.trim() === "" ? null : editUnitAmount.trim(),
        amount: editAmount.trim() === "" ? null : editAmount.trim(),
      },
    });
  };

  const handleAdd = () => {
    if (newAddonId == null) return;
    createAddon({
      deliveryOrderId,
      payload: {
        addonId: newAddonId,
        quantity: newQuantity.trim() || "1",
        unitAmount: newUnitAmount.trim() === "" ? null : newUnitAmount.trim(),
        amount: newAmount.trim() === "" ? null : newAmount.trim(),
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("deliveryOrderAddon.code")}</TableHead>
              <TableHead className="text-right">
                {t("deliveryOrderAddon.quantity")}
              </TableHead>
              <TableHead className="text-right">
                {t("deliveryOrderAddon.unitAmount")}
              </TableHead>
              <TableHead className="text-right">
                {t("deliveryOrderAddon.amount")}
              </TableHead>
              {editable && (
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {addons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={editable ? 5 : 4}
                  className="text-center text-muted-foreground"
                >
                  {t("deliveryOrderAddon.empty")}
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => {
                const isEditing = editingId === addon.id;
                return (
                  <TableRow key={addon.id}>
                    <TableCell className="font-mono text-xs">
                      {addon.code}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          disabled={mutating}
                          className="h-8 w-20 text-right"
                        />
                      ) : (
                        addon.quantity
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editUnitAmount}
                          onChange={(e) => setEditUnitAmount(e.target.value)}
                          disabled={mutating}
                          className="h-8 w-24 text-right"
                        />
                      ) : addon.unitAmount != null ? (
                        formatAmount(addon.unitAmount)
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          disabled={mutating}
                          className="h-8 w-24 text-right"
                        />
                      ) : (
                        formatAmount(addon.amount)
                      )}
                    </TableCell>
                    {editable && (
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              disabled={mutating}
                              onClick={() => handleSaveEdit(addon.id)}
                            >
                              {t("common.save")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={mutating}
                              onClick={() => setEditingId(null)}
                            >
                              {t("common.cancel")}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={mutating}
                              onClick={() => startEdit(addon)}
                            >
                              {t("common.edit")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              disabled={mutating}
                              onClick={() =>
                                deleteAddon({
                                  deliveryOrderId,
                                  addonId: addon.id,
                                })
                              }
                            >
                              {t("common.delete")}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editable && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-muted-foreground">
              {t("deliveryOrderAddon.code")}
            </label>
            <select
              value={newAddonId ?? ""}
              onChange={(e) =>
                setNewAddonId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={mutating}
              className="h-9 w-44 rounded-md border bg-background px-2 text-sm"
            >
              <option value="">—</option>
              {(addonTypes?.items ?? []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} · {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-muted-foreground">
              {t("deliveryOrderAddon.quantity")}
            </label>
            <Input
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              disabled={mutating}
              className="h-9 w-20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-muted-foreground">
              {t("deliveryOrderAddon.unitAmount")}
            </label>
            <Input
              type="number"
              value={newUnitAmount}
              onChange={(e) => setNewUnitAmount(e.target.value)}
              disabled={mutating}
              placeholder={t("deliveryOrderAddon.autoHint")}
              className="h-9 w-28"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase text-muted-foreground">
              {t("deliveryOrderAddon.amount")}
            </label>
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              disabled={mutating}
              placeholder={t("deliveryOrderAddon.autoHint")}
              className="h-9 w-28"
            />
          </div>
          <Button onClick={handleAdd} disabled={mutating || newAddonId == null}>
            {t("common.add")}
          </Button>
        </div>
      )}
    </div>
  );
}
