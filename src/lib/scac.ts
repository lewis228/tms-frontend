// SCAC (Standard Carrier Alpha Code) detection helpers.
//
// The authoritative carrier catalogue now lives in the backend `carriers`
// table. Components should fetch it via `useCarriersData()` and pass the
// resulting list to the detection helpers below.
//
// This file used to contain a hardcoded SHIPPING_LINES array; the migration
// moved the data to the DB so that new/renamed carriers can be added without
// a frontend deploy. The helpers remain because MBL-prefix detection is a
// pure string operation that belongs client-side (no network round-trip per
// keystroke while the user types an MBL).

import type { CarrierEntity } from "@/types";

/**
 * Given an MBL / booking number and a carrier list (from the API), return
 * the carrier whose SCAC or `mbl_prefixes` entry is the longest matching
 * leading prefix of the input. Returns null when no carrier matches — too
 * short, non-letters, or truly unknown SCAC.
 *
 * Rules:
 * - Input is trimmed and uppercased before comparing.
 * - Minimum 4 letters required; shorter = ambiguous = null.
 * - Longest matching prefix wins (so `MAEU` beats `MA` when both exist).
 * - Container numbers happen to share the same SCAC convention so this
 *   function works for them too; the caller decides which kind of number
 *   was pasted.
 */
export function detectCarrierFromMbl(
  input: string,
  carriers: readonly CarrierEntity[],
): CarrierEntity | null {
  const normalized = input.trim().toUpperCase();
  if (normalized.length < 4) return null;
  if (!/^[A-Z]{4}/.test(normalized)) return null;

  let best: CarrierEntity | null = null;
  let bestLen = 0;

  for (const carrier of carriers) {
    const prefixes = [
      carrier.scac,
      ...(carrier.mbl_prefixes ?? []),
    ];
    for (const prefix of prefixes) {
      if (!prefix) continue;
      const p = prefix.toUpperCase();
      if (normalized.startsWith(p) && p.length > bestLen) {
        best = carrier;
        bestLen = p.length;
      }
    }
  }
  return best;
}

/**
 * Look up a carrier by id from a carrier list. Used by the picker to render
 * the currently-selected entry when only the id is held in form state.
 */
export function findCarrierById(
  carrierId: number | null | undefined,
  carriers: readonly CarrierEntity[],
): CarrierEntity | null {
  if (carrierId === null || carrierId === undefined) return null;
  return carriers.find((c) => c.id === carrierId) ?? null;
}

/**
 * Look up a carrier by SCAC (exact match, case-insensitive). Left in for
 * cases where an external system (e.g. a legacy import) only carries the
 * SCAC string.
 */
export function findCarrierByScac(
  scac: string | null | undefined,
  carriers: readonly CarrierEntity[],
): CarrierEntity | null {
  if (!scac) return null;
  const upper = scac.toUpperCase();
  return carriers.find((c) => c.scac.toUpperCase() === upper) ?? null;
}
