import ModalProvider from "@/provider/modal-provider";
import SessionProvider from "@/provider/session-provider";
import WebSocketProvider from "@/provider/websocket-provider";
import RootRoute from "@/root-route";

export default function App() {
  return (
    <SessionProvider>
      <WebSocketProvider>
        <ModalProvider>
          <RootRoute />
        </ModalProvider>
      </WebSocketProvider>
    </SessionProvider>
  );
}
