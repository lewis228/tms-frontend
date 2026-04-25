// Mobile-web detection. The tracking dashboard is desktop-first (dense
// tables, wide side panels), so mobile visitors are bounced to a
// "coming soon" page until a native app ships.
//
// Detection strategy mirrors the Flutter companion: UA keywords for the
// hard cases (iPhone, Android mobile), plus matchMedia signals for the
// fringe (iPad reporting desktop UA, Android tablets). A coarse pointer
// AND a small viewport together are sufficient even without a keyword
// match.
//
// All functions are SSR-safe; they return `false` when `window` is absent.

const isBrowser = typeof window !== "undefined";

function ua(): string {
  if (!isBrowser) return "";
  return window.navigator.userAgent.toLowerCase();
}

function hasCoarsePointer(): boolean {
  if (!isBrowser) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function isSmallViewport(): boolean {
  if (!isBrowser) return false;
  return window.matchMedia("(max-width: 599px)").matches;
}

function isLargeViewport(): boolean {
  if (!isBrowser) return false;
  return window.matchMedia("(min-width: 600px)").matches;
}

// iPadOS 13+ reports a desktop UA. Distinguish via touch points.
function isIPadLike(): boolean {
  if (!isBrowser) return false;
  const s = ua();
  if (s.includes("ipad")) return true;
  const maxTouchPoints = window.navigator.maxTouchPoints ?? 0;
  return (s.includes("macintosh") || s.includes("mac os")) && maxTouchPoints > 1;
}

// Android tablets include "android" but *not* "mobile".
function isAndroidTabletUA(): boolean {
  const s = ua();
  return s.includes("android") && !s.includes("mobile");
}

export function isTabletWeb(): boolean {
  return (ua().includes("tablet") || isIPadLike() || isAndroidTabletUA()) && isLargeViewport();
}

export function isMobileWeb(): boolean {
  if (isTabletWeb()) return false;
  const s = ua();
  const keywordMatch = ["iphone", "ipod", "android", "windows phone", "blackberry", "mobile"].some((k) =>
    s.includes(k),
  );
  return keywordMatch || (hasCoarsePointer() && isSmallViewport());
}
