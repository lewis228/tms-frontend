import { useCallback, useEffect, useRef, useState } from "react";

// True overlay scrollbar. Native scrollbar is hidden entirely (via the
// `scrollbar-hidden` utility) so the content claims the full column
// width — cards never shrink to make room for a gutter. Instead we draw
// a thin absolute-positioned indicator on the right edge of the wrapper
// and drive its position from the inner scroll state. The indicator
// fades in during active scroll + while the cursor is inside, fades out
// after an idle timeout, AND accepts pointer drags so users can grab it
// like a classic scrollbar thumb.
//
// Mirrors the Flutter product-list look from the reference: a subtle
// floating bar that says "there's more below" without stealing layout.
const IDLE_HIDE_MS = 700;
const THUMB_MIN_HEIGHT = 28;
const TRACK_INSET = 2;

export default function OverlayScroll({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  // Drag session state — captured on pointerdown, cleared on up.
  const dragStartRef = useRef<{
    pointerY: number;
    scrollTop: number;
  } | null>(null);

  // Recompute thumb size + position from the scroll element's metrics.
  // Cheap — runs per scroll frame, called again whenever the container
  // resizes (ResizeObserver) so switching viewport width re-scales the
  // indicator without a manual kick.
  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setThumbHeight(0);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight) {
      setThumbHeight(0);
      return;
    }
    const trackHeight = clientHeight - TRACK_INSET * 2;
    const rawHeight = (clientHeight / scrollHeight) * trackHeight;
    const height = Math.max(THUMB_MIN_HEIGHT, rawHeight);
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const top = TRACK_INSET + progress * (trackHeight - height);
    setThumbHeight(height);
    setThumbTop(top);
  }, []);

  const handleScroll = useCallback(() => {
    updateThumb();
    setVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, IDLE_HIDE_MS);
  }, [updateThumb]);

  useEffect(() => {
    updateThumb();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [updateThumb]);

  // Pointer-based drag: translate pointer delta to scrollTop delta via
  // the ratio of scrollable content to the track length. Using pointer
  // events + capture means we keep receiving moves even when the cursor
  // leaves the thin 4px thumb — essential for smooth dragging.
  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    dragStartRef.current = {
      pointerY: e.clientY,
      scrollTop: el.scrollTop,
    };
    setDragging(true);
    // Keep the indicator visible while we drag regardless of idle timer.
    setVisible(true);
  };

  const handleThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    const start = dragStartRef.current;
    if (!el || !start) return;
    const { scrollHeight, clientHeight } = el;
    const trackHeight = clientHeight - TRACK_INSET * 2;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0 || trackHeight <= thumbHeight) return;
    // Ratio: 1px of thumb travel == `scale` px of scrollTop movement.
    const scale = maxScroll / (trackHeight - thumbHeight);
    const deltaY = e.clientY - start.pointerY;
    el.scrollTop = start.scrollTop + deltaY * scale;
  };

  const handleThumbPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    dragStartRef.current = null;
    setDragging(false);
    // Restart the idle timer from "now" so the thumb stays visible
    // briefly after release, just like native scrollbars do.
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      setVisible(false);
    }, IDLE_HIDE_MS);
  };

  const showThumb =
    (visible || hovered || dragging) && thumbHeight > 0;

  return (
    <div
      className="relative h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`scrollbar-hidden h-full overflow-y-auto ${className}`}
      >
        {children}
      </div>
      <div
        role="scrollbar"
        aria-orientation="vertical"
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={handleThumbPointerUp}
        onPointerCancel={handleThumbPointerUp}
        className="absolute right-[2px] w-[4px] cursor-grab touch-none rounded-full bg-black/30 transition-opacity active:cursor-grabbing active:bg-black/50"
        style={{
          top: `${thumbTop}px`,
          height: `${thumbHeight}px`,
          opacity: showThumb ? 1 : 0,
          transitionDuration: showThumb ? "150ms" : "400ms",
        }}
      />
    </div>
  );
}
