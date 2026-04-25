import { MoreHorizontal, Reply, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/components/messages/mock-data";

export default function MessageBubble({
  message,
}: {
  message: Extract<ChatMessage, { kind: "text" | "emoji" | "image-card" }>;
}) {
  const { t } = useTranslation();
  const isMe = message.from === "me";

  // Emoji-only message: render large standalone emoji in a subtle box
  if (message.kind === "emoji") {
    return (
      <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
        <div className="rounded-2xl bg-violet-50 px-4 py-2 text-2xl">
          {message.emoji}
        </div>
      </div>
    );
  }

  if (message.kind === "image-card") {
    return (
      <div className="group flex justify-start">
        <div className="flex max-w-[70%] flex-col overflow-hidden rounded-2xl bg-black/[0.04]">
          <img
            src={message.imageUrl}
            alt=""
            className="h-[220px] w-full object-cover"
          />
          <div className="flex flex-col px-4 py-2.5">
            <span className="text-xs text-violet-600">{message.linkUrl}</span>
            <span className="text-sm text-black">{message.linkTitle}</span>
          </div>
        </div>
        <MessageActions />
      </div>
    );
  }

  // text
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {isMe && <MessageActions side="left" />}
      <div
        className={cn(
          "relative max-w-[70%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line text-black",
          isMe ? "bg-violet-50" : "bg-black/[0.04]",
        )}
      >
        {message.text}
        {message.reactions && message.reactions.length > 0 && (
          <div
            className={cn(
              "absolute -bottom-3 flex gap-0.5 rounded-full bg-white px-1 py-0.5 text-sm shadow-[0_1px_4px_rgba(0,0,0,0.08)]",
              isMe ? "right-3" : "left-3",
            )}
            aria-label={t("chat.reaction")}
          >
            {message.reactions.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </div>
        )}
      </div>
      {!isMe && <MessageActions side="right" />}
    </div>
  );
}

function MessageActions({ side = "right" }: { side?: "left" | "right" }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
        side === "left" && "order-first",
      )}
    >
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full text-black/55 hover:bg-black/[0.06] hover:text-black"
        aria-label={t("chat.reaction")}
      >
        <Smile className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full text-black/55 hover:bg-black/[0.06] hover:text-black"
        aria-label={t("chat.reply")}
      >
        <Reply className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-full text-black/55 hover:bg-black/[0.06] hover:text-black"
        aria-label={t("chat.more")}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
