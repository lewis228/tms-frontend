import { useRef } from "react";
import {
  useRightPanelWidth,
  useSetRightPanelWidth,
} from "@/store/right-panel";

// Rendered as a flex sibling between the main column and the right aside —
// NOT absolute-positioned inside the aside. This avoids clipping from the
// aside's `overflow-hidden` and makes the hit target a first-class layout
// cell rather than a child hovering over other content.
export default function RightPanelResizeHandle({
  onResizingChange,
}: {
  onResizingChange: (resizing: boolean) => void;
}) {
  const width = useRightPanelWidth();
  const setWidth = useSetRightPanelWidth();
  const startRef = useRef<{ x: number; width: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, width };
    onResizingChange(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMove = (ev: PointerEvent) => {
      if (!startRef.current) return;
      // Handle sits to the LEFT of the right-anchored panel, so dragging
      // left (smaller clientX) should widen it.
      const delta = startRef.current.x - ev.clientX;
      setWidth(startRef.current.width + delta);
    };

    const handleUp = () => {
      startRef.current = null;
      onResizingChange(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={handlePointerDown}
      style={{ touchAction: "none" }}
      className="relative h-full w-1 shrink-0 cursor-col-resize bg-black/[0.08] transition-colors hover:bg-black/25 active:bg-black/45"
    />
  );
}
