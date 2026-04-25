// In-app notification 누적 store.
//
// WebSocketProvider 가 도착하는 RealtimeEvent 를 push.
// persist 안 함 — 새로고침 시 초기화 (백엔드 inbox 도메인 추후 도입 시 fetch).
// 최대 200건 까지만 보관 (오래된 것부터 drop).
import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

import type { InAppNotification } from "@/types";

const MAX_ITEMS = 200;

type State = {
  items: InAppNotification[];
};

const initialState: State = { items: [] };

const useNotificationsStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        push: (n: InAppNotification) =>
          set((s) => ({
            items: [n, ...s.items].slice(0, MAX_ITEMS),
          })),
        markRead: (id: string) =>
          set((s) => ({
            items: s.items.map((it) =>
              it.id === id ? { ...it, read: true } : it,
            ),
          })),
        markAllRead: () =>
          set((s) => ({
            items: s.items.map((it) => ({ ...it, read: true })),
          })),
        clear: () => set({ items: [] }),
      },
    })),
    { name: "NotificationsStore" },
  ),
);

export const useNotifications = () =>
  useNotificationsStore((s) => s.items);
export const useUnreadNotificationCount = () =>
  useNotificationsStore((s) => s.items.filter((it) => !it.read).length);
export const usePushNotification = () =>
  useNotificationsStore((s) => s.actions.push);
export const useMarkNotificationRead = () =>
  useNotificationsStore((s) => s.actions.markRead);
export const useMarkAllNotificationsRead = () =>
  useNotificationsStore((s) => s.actions.markAllRead);
export const useClearNotifications = () =>
  useNotificationsStore((s) => s.actions.clear);
