import { cn } from "@/lib/utils";
import type { ChatRoomSummary } from "@/components/messages/mock-data";

export default function ChatListItem({
  room,
  isSelected,
  onSelect,
}: {
  room: ChatRoomSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition-colors",
        isSelected ? "bg-black/[0.04]" : "hover:bg-black/[0.03]",
      )}
    >
      <img
        src={room.avatar}
        alt=""
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-black">
            {room.name}
          </span>
          <span className="ml-auto shrink-0 text-[11px] text-black/55">
            {room.lastMessageAt}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="truncate text-xs text-black/55">
            {room.lastMessagePreview}
          </span>
          {room.unreadCount > 0 && (
            <span className="ml-auto inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[10px] font-semibold text-white">
              {room.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
