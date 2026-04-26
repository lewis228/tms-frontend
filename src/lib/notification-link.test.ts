import { describe, expect, it } from "vitest";

import { notificationLinkFor } from "@/lib/notification-link";
import type { NotificationEntity } from "@/types";

function n(partial: Partial<NotificationEntity>): NotificationEntity {
  return {
    id: 1,
    tenantId: 1,
    userId: 1,
    channel: "PUSH",
    status: "PENDING",
    eventType: "do.created",
    title: "title",
    body: null,
    payload: null,
    isRead: false,
    readAt: null,
    sentAt: null,
    createdAt: "2026-04-26T00:00:00Z",
    updatedAt: "2026-04-26T00:00:00Z",
    ...partial,
  };
}

describe("notificationLinkFor", () => {
  it("returns null for unknown event types", () => {
    expect(notificationLinkFor(n({ eventType: "unknown.thing" }))).toBeNull();
  });

  it("links do.* with deliveryOrderId from payload", () => {
    expect(
      notificationLinkFor(
        n({
          eventType: "do.created",
          payload: { deliveryOrderId: "DO123" },
        }),
      ),
    ).toBe("/app/delivery-orders?do=DO123");
  });

  it("links leg.status_changed via deliveryOrderId", () => {
    expect(
      notificationLinkFor(
        n({
          eventType: "leg.status_changed",
          payload: { deliveryOrderId: "DO99", status: "IN_TRANSIT" },
        }),
      ),
    ).toBe("/app/delivery-orders?do=DO99");
  });

  it("returns null for do/leg events without deliveryOrderId", () => {
    expect(
      notificationLinkFor(n({ eventType: "do.created", payload: {} })),
    ).toBeNull();
  });

  it("links settlement.* with settlementId", () => {
    expect(
      notificationLinkFor(
        n({
          eventType: "settlement.approved",
          payload: { settlementId: "S1" },
        }),
      ),
    ).toBe("/app/accounting?settlement=S1");
  });

  it("falls back to /app/accounting for settlement without id", () => {
    expect(
      notificationLinkFor(
        n({ eventType: "settlement.calculated", payload: {} }),
      ),
    ).toBe("/app/accounting");
  });

  it("accepts number payload values for ids", () => {
    expect(
      notificationLinkFor(
        n({
          eventType: "do.created",
          payload: { deliveryOrderId: 123 },
        }),
      ),
    ).toBe("/app/delivery-orders?do=123");
  });
});
