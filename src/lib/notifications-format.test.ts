import { describe, expect, it } from "vitest";

import { realtimeToNotification } from "@/lib/notifications-format";
import type { RealtimeEvent } from "@/types";

function evt(partial: Partial<RealtimeEvent>): RealtimeEvent {
  return {
    type: "do.created",
    tenantId: "t1",
    actorId: "u1",
    payload: null,
    occurredAt: "2026-04-26T00:00:00Z",
    ...partial,
  };
}

describe("realtimeToNotification", () => {
  it("returns null for unknown event type", () => {
    expect(realtimeToNotification(evt({ type: "unknown.thing" }))).toBeNull();
  });

  it("returns null for file.uploaded (cache invalidation only)", () => {
    expect(realtimeToNotification(evt({ type: "file.uploaded" }))).toBeNull();
  });

  it("maps do.created with deliveryOrderId link", () => {
    const n = realtimeToNotification(
      evt({
        type: "do.created",
        payload: { deliveryOrderId: "DO123" },
      }),
    );
    expect(n).not.toBeNull();
    expect(n!.title).toContain("D/O");
    expect(n!.link).toBe("/app/delivery-orders?do=DO123");
    expect(n!.read).toBe(false);
  });

  it("falls back to /app/delivery-orders when deliveryOrderId missing", () => {
    const n = realtimeToNotification(evt({ type: "do.created", payload: {} }));
    expect(n!.link).toBe("/app/delivery-orders");
  });

  it("maps settlement.approved with settlementId link", () => {
    const n = realtimeToNotification(
      evt({
        type: "settlement.approved",
        payload: { settlementId: "S99" },
      }),
    );
    expect(n!.link).toBe("/app/accounting?settlement=S99");
  });

  it("includes status in description for status_changed events", () => {
    const n = realtimeToNotification(
      evt({
        type: "leg.status_changed",
        payload: { status: "IN_TRANSIT" },
      }),
    );
    expect(n!.description).toContain("IN_TRANSIT");
  });

  it("each notification gets a unique id", () => {
    const a = realtimeToNotification(evt({ type: "do.created" }));
    const b = realtimeToNotification(evt({ type: "do.created" }));
    expect(a!.id).not.toBe(b!.id);
  });
});
