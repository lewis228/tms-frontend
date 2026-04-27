import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PenSquare, Search, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatListItem from "@/components/messages/chat-list-item";
import {
  useChatRooms,
  useSelectRoom,
  useSelectedRoomId,
} from "@/store/messages";

export default function ChatList() {
  const { t } = useTranslation();
  const rooms = useChatRooms();
  const selectedRoomId = useSelectedRoomId();
  const selectRoom = useSelectRoom();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered =
    q === ""
      ? rooms
      : rooms.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.lastMessagePreview.toLowerCase().includes(q),
        );

  return (
    <div className="flex w-[280px] shrink-0 flex-col border-r border-black/10">
      <div className="flex items-center gap-2 px-3 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-black/70 hover:bg-black/[0.04] hover:text-black"
          aria-label={t("chat.newChat")}
        >
          <PenSquare className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-black/70 hover:bg-black/[0.04] hover:text-black"
          aria-label={t("chat.settings")}
        >
          <SettingsIcon className="h-4 w-4" />
        </Button>
        <div className="relative ml-1 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/45" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("chat.searchPlaceholder")}
            className="h-8 w-full rounded-full bg-black/[0.04] pl-8 pr-3 text-xs text-black placeholder:text-black/45 focus:outline-none focus:ring-1 focus:ring-black/15"
            aria-label={t("chat.searchPlaceholder")}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-3">
        {filtered.map((room) => (
          <ChatListItem
            key={room.id}
            room={room}
            isSelected={room.id === selectedRoomId}
            onSelect={() => selectRoom(room.id)}
          />
        ))}
      </div>
    </div>
  );
}
