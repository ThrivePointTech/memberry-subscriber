"use client";

import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

let initialized = false;

export function initAnalytics(): void {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
  });
  initialized = true;
  // Lets flags target staging vs. production independently, since API keys
  // aren't split per env.
  posthog.setPersonPropertiesForFlags({ environment: APP_ENV }, false);
}

export function captureEvent(event: string, properties?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}

// The browser-held anonymous distinct_id, threaded to the API on checkout/payment
// calls so server-emitted events resolve to the same PostHog person.
export function getDistinctId(): string | null {
  if (!initialized) return null;
  return posthog.get_distinct_id() ?? null;
}

export function isFeatureEnabled(flagKey: string): boolean {
  if (!initialized) return false;
  return posthog.isFeatureEnabled(flagKey) ?? false;
}

// Feature flags load asynchronously after init; callback fires once they're ready
// and again on any later reload (e.g. after identify()).
export function onFeatureFlags(callback: () => void): void {
  if (!initialized) return;
  posthog.onFeatureFlags(callback);
}
