// Rate Quote 마스터 — 정찰가 (origin/dest pair fixed amount).
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useRateQuotesData } from "@/hooks/queries/use-rate-quotes-data";
import { useCreateRateQuote } from "@/hooks/mutations/rate-quote/use-create-rate-quote";
import { useDeleteRateQuote } from "@/hooks/mutations/rate-quote/use-delete-rate-quote";
import { generateErrorMessage } from "@/lib/error";
import { useOpenAlertModal } from "@/store/alert-modal";
import { formatAmount } from "@/lib/format";
import type { MoveTypeV3, RateQuoteEntity } from "@/types";

const MOVE_TYPES: MoveTypeV3[] = [
  "TRUCK_ONLY",
  "CHASSIS_ONLY",
  "EMPTY_LOADED",
  "FULL_LOADED",
];

export default function RateQuoteList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isPending, error } = useRateQuotesData(page);
  const [open, setOpen] = useState(false);
  const openAlert = useOpenAlertModal();

  const { mutate: createQuote, isPending: isCreatePending } =
    useCreateRateQuote({
      onSuccess: () => {
        toast.success(t("common.saved"), { position: "top-center" });
        setOpen(false);
      },
      onError: (err) =>
        toast.error(generateErrorMessage(err), { position: "top-center" }),
    });
  const { mutate: deleteQuote } = useDeleteRateQuote({
    onSuccess: () =>
      toast.success(t("common.deleted"), { position: "top-center" }),
    onError: (err) =>
      toast.error(generateErrorMessage(err), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end">
        <Button onClick={() => setOpen(true)}>+ Quote</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Move</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Fixed</TableHead>
              <TableHead>Effective</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((q: RateQuoteEntity) => (
                <TableRow key={q.id}>
                  <TableCell>{q.name ?? "—"}</TableCell>
                  <TableCell>{q.originLocationId ?? "*"}</TableCell>
                  <TableCell>{q.destinationLocationId ?? "*"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {q.moveType ?? "*"}
                  </TableCell>
                  <TableCell>{q.customerId ?? "*"}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatAmount(Number(q.fixedAmount))}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {q.effectiveFrom} → {q.effectiveTo ?? "∞"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        openAlert({
                          title: q.name ?? `#${q.id}`,
                          description: t("common.deleteConfirm"),
                          onConfirm: () => deleteQuote(q.id),
                        })
                      }
                    >
                      Del
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">New Rate Quote</DialogTitle>
          </DialogHeader>
          <QuoteEditor
            disabled={isCreatePending}
            onSave={(payload) => createQuote(payload)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuoteEditor({
  disabled,
  onSave,
}: {
  disabled: boolean;
  onSave: (p: {
    name: string;
    originLocationId: number | null;
    destinationLocationId: number | null;
    moveType: MoveTypeV3 | null;
    customerId: number | null;
    fixedAmount: number;
    effectiveFrom: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState<string>("");
  const [dest, setDest] = useState<string>("");
  const [moveType, setMoveType] = useState<MoveTypeV3 | "">("");
  const [customer, setCustomer] = useState<string>("");
  const [amount, setAmount] = useState<string>("0");
  const [from, setFrom] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} disabled={disabled} />
      </Field>
      <Field label="Move Type">
        <select
          value={moveType}
          onChange={(e) => setMoveType(e.target.value as MoveTypeV3 | "")}
          disabled={disabled}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">* (any)</option>
          {MOVE_TYPES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>
      <Field label="Origin Location ID">
        <Input value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={disabled} />
      </Field>
      <Field label="Destination Location ID">
        <Input value={dest} onChange={(e) => setDest(e.target.value)} disabled={disabled} />
      </Field>
      <Field label="Customer ID">
        <Input value={customer} onChange={(e) => setCustomer(e.target.value)} disabled={disabled} />
      </Field>
      <Field label="Fixed Amount">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} disabled={disabled} inputMode="decimal" />
      </Field>
      <Field label="Effective From">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={disabled} />
      </Field>
      <div className="col-span-2 flex justify-end">
        <Button
          disabled={disabled || amount.trim() === ""}
          onClick={() =>
            onSave({
              name: name || `Quote ${Date.now()}`,
              originLocationId: origin ? Number(origin) : null,
              destinationLocationId: dest ? Number(dest) : null,
              moveType: moveType === "" ? null : (moveType as MoveTypeV3),
              customerId: customer ? Number(customer) : null,
              fixedAmount: Number(amount) || 0,
              effectiveFrom: from,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
