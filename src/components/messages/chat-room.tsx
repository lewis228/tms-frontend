import { useTranslation } from "react-i18next";
import { MoreHorizontal, Phone, Video } from "lucide-react";
import MessageBubble from "@/components/messages/message-bubble";
import MessageComposer from "@/components/messages/message-composer";
import { useRoomMessages, useSelectedRoom } from "@/store/messages";

export default function ChatRoom() {
  const { t } = useTranslation();
  const room = useSelectedRoom();
  const messages = useRoomMessages(room?.id ?? "");

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-black/45">
        {t("chat.emptyState")}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-black/10 px-5 py-3">
        <img
          src={room.avatar}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-black">
            {room.name}
          </span>
          {room.email && (
            <span className="truncate text-[11px] text-black/55">
              {room.email}
            </span>
          )}
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-black/55 hover:bg-black/[0.04] hover:text-black"
          aria-label={t("chat.call")}
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-black/55 hover:bg-black/[0.04] hover:text-black"
          aria-label={t("chat.videoCall")}
        >
          <Video className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full text-black/55 hover:bg-black/[0.04] hover:text-black"
          aria-label={t("chat.more")}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        {messages.map((m) => {
          if (m.kind === "divider") {
            return (
              <div
                key={m.id}
                className="my-2 flex items-center justify-center text-xs text-black/45"
              >
                {m.label}
              </div>
            );
          }
          return <MessageBubble key={m.id} message={m} />;
        })}
      </div>

      <MessageComposer roomId={room.id} />
    </div>
  );
}
