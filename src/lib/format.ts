// 표시 포맷 중앙화. 모든 컴포넌트는 toLocaleDateString/Intl.DateTimeFormat 직접
// 호출 대신 여기 함수 사용 (CLAUDE.md §6.8).
//
// 입력: UTC ISO 문자열 (백엔드가 주는 그대로). 백엔드 ResponseSchema 가
// datetime 을 UTC + Z 로 직렬화하므로 그대로 받으면 됨.
// 출력: 사용자 timezone 으로 shift 된 한국어 표시.
//
// 날짜/시간은 현재 Asia/Seoul + ko-KR 고정. 추후 getTeamPreferences() 로
// timezone/locale 동적 결정. 통화(formatAmount)는 팀 프리퍼런스를 이미 읽는다.
import { getTeamPreferences } from "@/store/team-preferences";

const DEFAULT_TIMEZONE = "Asia/Seoul";
const DEFAULT_LOCALE = "ko-KR";

type DateInput = string | Date | null | undefined;

function _toDate(input: DateInput): Date | null {
  if (input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** UTC ISO → 사용자 timezone 의 날짜 (예: "2026-04-26"). */
export function formatDate(input: DateInput, fallback: string = "—"): string {
  const d = _toDate(input);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** UTC ISO → 사용자 timezone 의 시간 (예: "오후 3:42"). */
export function formatTime(input: DateInput, fallback: string = "—"): string {
  const d = _toDate(input);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** UTC ISO → 날짜+시간 (예: "26. 4. 26. 오후 3:42"). */
export function formatDateTime(
  input: DateInput,
  fallback: string = "—"
): string {
  const d = _toDate(input);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

/** 짧은 날짜 (월/일) — 캘린더 / Gantt 등. */
export function formatShortDate(
  input: DateInput,
  fallback: string = "—"
): string {
  const d = _toDate(input);
  if (!d) return fallback;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** 금액 표시 — 통화는 팀 프리퍼런스(currency)에서 일원 결정 (CLAUDE.md §6.8).
 *  호출부 통화 하드코딩 금지 — rate/payroll/invoice 전 화면이 같은 통화로 표시돼야 한다. */
export function formatAmount(
  value: number | string | null | undefined
): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  const { currency } = getTeamPreferences();
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" ? 0 : 2,
  }).format(n);
}
