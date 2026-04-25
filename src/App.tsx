// 진입 합성 — AuthBootstrap → ModalProvider → WebSocketProvider → 라우트.
import AuthBootstrap from "@/components/layout/auth-bootstrap";
import ModalProvider from "@/provider/modal-provider";
import WebSocketProvider from "@/provider/websocket-provider";
import RootRoute from "@/root-route";

export default function App() {
  return (
    <AuthBootstrap>
      <WebSocketProvider>
        <ModalProvider>
          <RootRoute />
        </ModalProvider>
      </WebSocketProvider>
    </AuthBootstrap>
  );
}
