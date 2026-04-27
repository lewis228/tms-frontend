import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";
import {
  CHAT_MESSAGES,
  CHAT_ROOMS,
  type ChatMessage,
  type ChatRoomSummary,
} from "@/components/messages/mock-data";

// Session-scoped: selected room id and in-memory message log. Persistence is
// intentionally off — messages are mock, and a fresh load should show the
// same canonical sample conversation. Wire to TanStack Query + WebSocket
// when real backend lands; the shape here (rooms + messagesByRoom) already
// matches a typical REST/WS contract.

type State = {
  selectedRoomId: string;
  rooms: ChatRoomSummary[];
  messagesByRoom: Record<string, ChatMessage[]>;
};

const initialState: State = {
  selectedRoomId: "bywind",
  rooms: CHAT_ROOMS,
  messagesByRoom: CHAT_MESSAGES,
};

const useMessagesStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        selectRoom: (roomId: string) =>
          set((s) => ({
            selectedRoomId: roomId,
            rooms: s.rooms.map((r) =>
              r.id === roomId ? { ...r, unreadCount: 0 } : r,
            ),
          })),
        sendMessage: (roomId: string, text: string) =>
          set((s) => {
            const trimmed = text.trim();
            if (trimmed === "") return s;
            const next: ChatMessage = {
              id: `local-${Date.now()}`,
              roomId,
              kind: "text",
              from: "me",
              text: trimmed,
            };
            const existing = s.messagesByRoom[roomId] ?? [];
            return {
              messagesByRoom: {
                ...s.messagesByRoom,
                [roomId]: [...existing, next],
              },
            };
          }),
      },
    })),
    { name: "MessagesStore" },
  ),
);

export const useSelectedRoomId = () =>
  useMessagesStore((s) => s.selectedRoomId);

export const useChatRooms = () => useMessagesStore((s) => s.rooms);

export const useSelectedRoom = () =>
  useMessagesStore(
    (s) => s.rooms.find((r) => r.id === s.selectedRoomId) ?? null,
  );

export const useRoomMessages = (roomId: string) =>
  useMessagesStore((s) => s.messagesByRoom[roomId] ?? []);

export const useSelectRoom = () =>
  useMessagesStore((s) => s.actions.selectRoom);

export const useSendMessage = () =>
  useMessagesStore((s) => s.actions.sendMessage);
