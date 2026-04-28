// 컨테이너 이벤트 타임라인 + 새 이벤트 추가.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import Fallback from "@/components/fallback";
import { useContainerEventsData } from "@/hooks/queries/use-container-events-data";
import { useAddContainerEvent } from "@/hooks/mutations/container/use-add-container-event";
import { useLocationsData } from "@/hooks/queries/use-locations-data";
import { generateErrorMessage } from "@/lib/error";
import { formatDateTime } from "@/lib/format";
import type { ContainerEventKind } from "@/types";

const EVENT_KINDS: ContainerEventKind[] = [
  "GATE_OUT", "DELIVERED", "EMPTIED", "STREET_TURNED",
  "REUSED", "GATE_IN", "RETURNED",
];

export default function ContainerEventTimeline({
  containerId,
}: {
  containerId: number;
}) {
  const { t } = useTranslation();
  const { data: events, isPending, error } = useContainerEventsData(containerId);
  const { data: locationsData } = useLocationsData(1);

  const [eventKind, setEventKind] = useState<ContainerEventKind>("GATE_OUT");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [occurredAt, setOccurredAt] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [note, setNote] = useState("");

  const { mutate: addEvent, isPending: isAddEventPending } = useAddContainerEvent({
    onSuccess: () => {
      setNote("");
      toast.success(t("container.events.addedToast"), { position: "top-center" });
    },
    onError: (e) =>
      toast.error(generateErrorMessage(e), { position: "top-center" }),
  });

  if (error) return <Fallback />;
  if (isPending) return <Loader />;

  const handleAdd = () => {
    addEvent({
      containerId,
      payload: {
        eventKind,
        locationId,
        occurredAt: new Date(occurredAt).toISOString(),
        note: note.trim() || null,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("container.events.addTitle")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={eventKind}
            onChange={(e) => setEventKind(e.target.value as ContainerEventKind)}
            disabled={isAddEventPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            {EVENT_KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select
            value={locationId ?? ""}
            onChange={(e) =>
              setLocationId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isAddEventPending}
            className="h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">— {t("container.events.locationOptional")} —</option>
            {(locationsData?.items ?? []).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <Input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            disabled={isAddEventPending}
          />
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("container.events.notePlaceholder")}
            disabled={isAddEventPending}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={handleAdd} disabled={isAddEventPending}>
            + {t("container.events.add")}
          </Button>
        </div>
      </div>

      {events && events.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("container.events.empty")}</p>
      )}

      <div className="flex flex-col gap-2">
        {(events ?? []).map((ev) => {
          const locName = ev.locationId
            ? (locationsData?.items.find((l) => l.id === ev.locationId)?.name ?? "—")
            : "—";
          return (
            <div key={ev.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium">
                    {ev.eventKind}
                  </span>
                  <span className="text-muted-foreground">{locName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(ev.occurredAt, ev.occurredAt)}
                </span>
              </div>
              {ev.note && (
                <p className="mt-1 text-xs text-foreground/70">{ev.note}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
