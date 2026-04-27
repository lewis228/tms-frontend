import ChatList from "@/components/messages/chat-list";
import ChatRoom from "@/components/messages/chat-room";

// Right panel is a two-pane chat (list + active room) backed by mock data
// (see `@/components/messages/mock-data`). Width is driven by the parent
// aside (team-scoped-layout) via drag-resize; we just fill. No backend
// wiring yet — `@/store/messages` keeps a session-scoped in-memory log so
// the composer is interactive against the canonical sample conversations.
export default function RightPanel() {
  return (
    <div className="flex h-full w-full bg-white">
      <ChatList />
      <ChatRoom />
    </div>
  );
}
