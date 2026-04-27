import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { useSendMessage } from "@/store/messages";

export default function MessageComposer({ roomId }: { roomId: string }) {
  const { t } = useTranslation();
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (trimmed === "") return;
    sendMessage(roomId, trimmed);
    setText("");
  };

  const canSend = text.trim().length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-black/10 px-4 py-3"
    >
      <div className="flex flex-1 items-center gap-2 rounded-full bg-black/[0.04] px-4 py-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.typeMessage")}
          className="flex-1 bg-transparent text-sm text-black placeholder:text-black/45 focus:outline-none"
          aria-label={t("chat.typeMessage")}
        />
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/55 transition-colors hover:text-black disabled:opacity-40 disabled:hover:text-black/55"
          aria-label={t("chat.send")}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
