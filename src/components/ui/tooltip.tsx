import * as React from "react";
import { cn } from "@/lib/utils";

type TooltipProviderProps = {
  delayDuration?: number;
  skipDelayDuration?: number;
  children: React.ReactNode;
};

const TooltipContext = React.createContext<{ delay: number }>({ delay: 0 });

function TooltipProvider({
  delayDuration = 0,
  children,
}: TooltipProviderProps) {
  const value = React.useMemo(() => ({ delay: delayDuration }), [delayDuration]);
  return (
    <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>
  );
}

type TooltipProps = {
  delayDuration?: number;
  children: React.ReactNode;
};

type TooltipInternalContext = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  delay: number;
};

const TooltipInternalContext = React.createContext<TooltipInternalContext>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
  delay: 0,
});

function Tooltip({ delayDuration, children }: TooltipProps) {
  const { delay: providerDelay } = React.useContext(TooltipContext);
  const delay = delayDuration ?? providerDelay;
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const value = React.useMemo(
    () => ({ open, setOpen, triggerRef, delay }),
    [open, delay],
  );
  return (
    <TooltipInternalContext.Provider value={value}>
      {children}
    </TooltipInternalContext.Provider>
  );
}

type TooltipTriggerProps = {
  asChild?: boolean;
  children: React.ReactElement;
};

function TooltipTrigger({ asChild, children }: TooltipTriggerProps) {
  const { setOpen, triggerRef, delay } =
    React.useContext(TooltipInternalContext);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (delay > 0) {
      timerRef.current = setTimeout(() => setOpen(true), delay);
    } else {
      setOpen(true);
    }
  };

  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ref: triggerRef,
      onMouseEnter: handleEnter,
      onMouseLeave: handleLeave,
      onFocus: handleEnter,
      onBlur: handleLeave,
    });
  }

  return (
    <span
      ref={triggerRef as React.RefObject<HTMLSpanElement>}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {children}
    </span>
  );
}

type TooltipContentProps = {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
};

function TooltipContent({
  side = "top",
  sideOffset = 4,
  className,
  children,
}: TooltipContentProps) {
  const { open, triggerRef } = React.useContext(TooltipInternalContext);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    const cr = contentRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (side) {
      case "top":
        top = tr.top - cr.height - sideOffset;
        left = tr.left + tr.width / 2 - cr.width / 2;
        break;
      case "bottom":
        top = tr.bottom + sideOffset;
        left = tr.left + tr.width / 2 - cr.width / 2;
        break;
      case "left":
        top = tr.top + tr.height / 2 - cr.height / 2;
        left = tr.left - cr.width - sideOffset;
        break;
      case "right":
        top = tr.top + tr.height / 2 - cr.height / 2;
        left = tr.right + sideOffset;
        break;
    }

    setPos({ top, left });
  }, [open, side, sideOffset, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="tooltip"
      className={cn(
        "animate-in fade-in-0 zoom-in-95 fixed z-50 rounded-md bg-stone-900 px-3 py-1.5 text-xs text-stone-50 shadow-md",
        className,
      )}
      style={{ top: pos.top, left: pos.left }}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
