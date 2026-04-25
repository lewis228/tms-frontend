import { toast } from "sonner";

// Dedup window: if the same message fires within this interval, we skip it
// rather than stacking duplicate toasts (common on burst 401/5xx cascades).
const DEDUP_WINDOW_MS = 3000;

const lastShownAt = new Map<string, number>();

function shouldShow(message: string): boolean {
  const now = Date.now();
  const last = lastShownAt.get(message);
  if (last !== undefined && now - last < DEDUP_WINDOW_MS) return false;
  lastShownAt.set(message, now);
  return true;
}

// All callers should prefer these over `toast.*` directly — they share the
// dedup map and enforce the project's `top-center` position convention.
// Existing call sites using `toast.error` still work; migrate opportunistically.

export function toastError(message: string) {
  if (!shouldShow(message)) return;
  toast.error(message, { position: "top-center" });
}

export function toastInfo(message: string) {
  if (!shouldShow(message)) return;
  toast.info(message, { position: "top-center" });
}

export function toastSuccess(message: string) {
  if (!shouldShow(message)) return;
  toast.success(message, { position: "top-center" });
}
