export const STORAGE_VERSION = 1;

export function checkoutStorageKey(planId: string): string {
  return `memberry_checkout__${planId}`;
}

// Always stamps version + planId so the recovery gate in CheckoutForm.tsx can
// tell a fresh/matching entry from a stale or unrelated one.
export function patchCheckoutStorage(planId: string, patch: Record<string, unknown>): void {
  try {
    const key = checkoutStorageKey(planId);
    const raw = sessionStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : {};
    sessionStorage.setItem(
      key,
      JSON.stringify({ ...existing, ...patch, version: STORAGE_VERSION, planId, savedAt: Date.now() })
    );
  } catch { /* storage unavailable */ }
}
