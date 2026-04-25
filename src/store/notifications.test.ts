import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
  useClearNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  usePushNotification,
  useUnreadNotificationCount,
} from "@/store/notifications";
import type { InAppNotification } from "@/types";

function n(id: string, read = false): InAppNotification {
  return {
    id,
    type: "do.created",
    title: `t-${id}`,
    description: null,
    link: null,
    read,
    occurredAt: "2026-04-26T00:00:00Z",
  };
}

describe("notifications store", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useClearNotifications());
    act(() => result.current());
  });

  it("push prepends new notifications (newest first)", () => {
    const push = renderHook(() => usePushNotification()).result.current;
    act(() => {
      push(n("a"));
      push(n("b"));
    });
    const items = renderHook(() => useNotifications()).result.current;
    expect(items.map((it) => it.id)).toEqual(["b", "a"]);
  });

  it("unread count reflects unread items only", () => {
    const push = renderHook(() => usePushNotification()).result.current;
    act(() => {
      push(n("a"));
      push(n("b", true));
    });
    expect(
      renderHook(() => useUnreadNotificationCount()).result.current,
    ).toBe(1);
  });

  it("markRead flips a single item", () => {
    const push = renderHook(() => usePushNotification()).result.current;
    const markRead = renderHook(() => useMarkNotificationRead()).result.current;
    act(() => {
      push(n("a"));
      push(n("b"));
    });
    act(() => markRead("a"));
    const items = renderHook(() => useNotifications()).result.current;
    expect(items.find((it) => it.id === "a")!.read).toBe(true);
    expect(items.find((it) => it.id === "b")!.read).toBe(false);
  });

  it("markAllRead flips every unread item", () => {
    const push = renderHook(() => usePushNotification()).result.current;
    const markAll = renderHook(() => useMarkAllNotificationsRead()).result
      .current;
    act(() => {
      push(n("a"));
      push(n("b"));
    });
    act(() => markAll());
    expect(
      renderHook(() => useUnreadNotificationCount()).result.current,
    ).toBe(0);
  });

  it("clear empties the store", () => {
    const push = renderHook(() => usePushNotification()).result.current;
    const clear = renderHook(() => useClearNotifications()).result.current;
    act(() => push(n("a")));
    act(() => clear());
    expect(renderHook(() => useNotifications()).result.current).toEqual([]);
  });

  it("caps the buffer at 200 items (oldest dropped)", () => {
    const push = renderHook(() => usePushNotification()).result.current;
    act(() => {
      for (let i = 0; i < 205; i++) push(n(`x${i}`));
    });
    const items = renderHook(() => useNotifications()).result.current;
    expect(items.length).toBe(200);
    expect(items[0].id).toBe("x204");
    expect(items[199].id).toBe("x5");
  });
});
