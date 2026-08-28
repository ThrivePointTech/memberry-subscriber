"use client";

import { useEffect, useState } from "react";
import { isFeatureEnabled, onFeatureFlags } from "@/lib/analytics";

// PostHog flag key — create/rename this flag in PostHog to match.
const SAVINGS_LABEL_FLAG = "savings-label-badge";

export default function SavingsBadge({ label }: { label: string | null }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // onFeatureFlags fires immediately if flags are already loaded, and again on any later reload —
    // covers both the initial read and subsequent changes via one subscription.
    onFeatureFlags(() => setEnabled(isFeatureEnabled(SAVINGS_LABEL_FLAG)));
  }, []);

  if (!enabled || !label) return null;

  return (
    <span className="inline-block bg-[#e6f7ec] text-[#1a7a3e] text-xs font-bold px-3 py-1 rounded-full">
      {label}
    </span>
  );
}
