import ChatList from "@/components/messages/chat-list";
import ChatRoom from "@/components/messages/chat-room";

// Right panel is now a two-pane chat (list + active room). Width is driven
// by the parent aside (team-scoped-layout) via drag-resize; we just fill.
export default function RightPanel() {
  return (
    <div className="flex h-full w-full bg-white">
      <ChatList />
      <ChatRoom />
    </div>
  );
}
