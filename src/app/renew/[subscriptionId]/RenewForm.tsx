"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.getmemberry.com";

interface RenewFormProps {
  subscriptionId: string;
  planName: string;
  planPriceCentavos: number;
  billingCycle: string | null;
}

export default function RenewForm({
  subscriptionId,
  planName,
  planPriceCentavos,
  billingCycle,
}: RenewFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceDisplay = (planPriceCentavos / 100).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  async function handleRenew() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/public/checkout/renew/gcash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(
          (json as { error?: string }).error ??
            "Failed to initiate renewal. Please try again."
        );
        return;
      }
      const json = await res.json();
      const redirectUrl: string = json.data?.redirect_url;
      if (!redirectUrl) {
        setError("No redirect URL returned. Please try again.");
        return;
      }
      window.location.href = redirectUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-[#e4ede9] p-5 flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span className="text-[#5c706a]">Plan</span>
          <span className="font-semibold text-[#001a18]">{planName}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#5c706a]">Amount</span>
          <span className="font-semibold text-[#001a18]">{priceDisplay}</span>
        </div>
        {billingCycle && (
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Billing</span>
            <span className="font-semibold text-[#001a18] capitalize">{billingCycle}</span>
          </div>
        )}
      </div>

      <div className="bg-[#e8f4f0] border border-[#b8ddd1] rounded-xl px-4 py-3">
        <p className="text-sm text-[#1a5c48]">
          You&apos;ll be redirected to GCash to complete your payment. After paying, your subscription will be renewed immediately.
        </p>
      </div>

      {error && (
        <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
      )}

      <button
        type="button"
        onClick={handleRenew}
        disabled={loading}
        className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ fontFamily: "var(--font-manrope)" }}
      >
        {loading && <Spinner />}
        {loading ? "Redirecting to GCash…" : "Renew with GCash"}
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-[#9ab0a8] border-t-transparent rounded-full animate-spin shrink-0" aria-hidden />
  );
}
