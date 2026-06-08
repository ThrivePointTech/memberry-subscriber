"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.getmemberry.com";

const PHONE_PREFIX = "+63";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#c8d9d3] bg-white text-[#001a18] text-base placeholder:text-[#9ab0a8] focus:outline-none focus:ring-2 focus:ring-[#142F2D] disabled:opacity-50 transition";

const labelClass = "block text-sm font-semibold text-[#001a18] mb-2";

type Step = "phone" | "pin" | "pick" | "subscription" | "amount" | "success";

interface Subscription {
  id: string;
  plan_name: string | null;
  allowance_type: string | null;
  allowance_amount: string | null;
  max_per_visit: string | null;
  max_per_visit_unit: string | null;
  usage_this_period: string;
  period_end: string;
}

interface LookupResult {
  customer: { id: string; name: string; phone: string | null; has_pin: boolean };
  subscriptions: Subscription[];
}

interface RedemptionResult {
  id: string;
  amount_redeemed: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function allowanceLabel(type: string | null, amount: string | null, usage: string): string {
  if (!type || type === "unlimited") return "Unlimited";
  const total = parseFloat(amount ?? "0");
  const used = parseFloat(usage);
  const remaining = Math.max(0, total - used);
  if (type === "count") return `${remaining} of ${total} visit${total !== 1 ? "s" : ""} remaining`;
  if (type === "loads") return `${remaining} of ${total} load${total !== 1 ? "s" : ""} remaining`;
  if (type === "weight_kg") return `${remaining.toFixed(2)} of ${total} kg remaining`;
  return "";
}

// count and unlimited both auto-deduct 1; weight_kg and loads need user input
function isAutoRedeem(type: string | null): boolean {
  return !type || type === "unlimited" || type === "count";
}

export default function RedeemForm({ merchantId }: { merchantId: string }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [redeemedAt, setRedeemedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fullPhone = `${PHONE_PREFIX}${phone.trim()}`;

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) { setError("Please enter your phone number."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/public/redeem/lookup?phone=${encodeURIComponent(fullPhone)}&merchant_id=${encodeURIComponent(merchantId)}`
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      const data = json.data as LookupResult;
      setLookup(data);

      if (data.subscriptions.length === 0) {
        setError("No active subscription found at this store for that number.");
        return;
      }

      setError(null);
      if (data.customer.has_pin) {
        setStep("pin");
      } else if (data.subscriptions.length === 1) {
        setSelectedSub(data.subscriptions[0]);
        setStep("subscription");
      } else {
        setStep("pick");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePinContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) { setError("Please enter your 6-digit PIN."); return; }
    setError(null);
    const data = lookup!;
    if (data.subscriptions.length === 1) {
      setSelectedSub(data.subscriptions[0]);
      setStep("subscription");
    } else {
      setStep("pick");
    }
  }

  function handlePickSub(sub: Subscription) {
    setSelectedSub(sub);
    setError(null);
    setStep("subscription");
  }

  async function submitRedemption(amountRedeemed: string) {
    if (!selectedSub) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/public/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: selectedSub.id,
          merchant_id: merchantId,
          amount_redeemed: amountRedeemed,
          pin: pin || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not record redemption. Please try again.");
        return;
      }
      setResult(json.data as RedemptionResult);
      setRedeemedAt(new Date());
      setStep("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAmountSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }
    if (selectedSub?.allowance_type === "loads" && !Number.isInteger(parsed)) {
      setError("Please enter a whole number of loads.");
      return;
    }
    setError(null);
    void submitRedemption(String(parsed));
  }

  function reset() {
    setStep("phone");
    setPhone("");
    setPin("");
    setLookup(null);
    setSelectedSub(null);
    setAmount("1");
    setResult(null);
    setRedeemedAt(null);
    setError(null);
    setLoading(false);
  }

  // ── Phone step ────────────────────────────────────────────────────────────────

  if (step === "phone") {
    return (
      <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="phone" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Your phone number
          </label>
          <div className="flex rounded-xl border border-[#c8d9d3] bg-white focus-within:ring-2 focus-within:ring-[#142F2D] overflow-hidden transition">
            <span className="flex items-center px-4 text-[#001a18] text-base font-medium bg-[#f0f5f4] border-r border-[#c8d9d3] select-none shrink-0">
              +63
            </span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9XX XXX XXXX"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").replace(/^0+/, "");
                setPhone(digits);
              }}
              maxLength={10}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white text-[#001a18] text-base placeholder:text-[#9ab0a8] focus:outline-none disabled:opacity-50"
            />
          </div>
          <p className="text-[#5c706a] text-xs mt-2">
            Enter the number linked to your membership.
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {loading && <Spinner />}
          {loading ? "Looking up…" : "Find my subscription"}
        </button>
      </form>
    );
  }

  // ── PIN step ──────────────────────────────────────────────────────────────────

  if (step === "pin" && lookup) {
    return (
      <form onSubmit={handlePinContinue} className="flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4">
          <p className="text-xs text-[#5c706a] font-medium mb-1">Member</p>
          <p className="text-base font-bold text-[#001a18]" style={{ fontFamily: "var(--font-manrope)" }}>
            {lookup.customer.name}
          </p>
          <p className="text-sm text-[#5c706a]">{lookup.customer.phone}</p>
        </div>

        <div>
          <label htmlFor="pin" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Enter your 6-digit PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="• • • • • •"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            autoComplete="current-password"
            autoFocus
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Continue
        </button>

        <button
          type="button"
          onClick={() => { setStep("phone"); setError(null); setPin(""); }}
          className="text-xs text-[#5c706a] underline underline-offset-2 text-center"
        >
          ← Back
        </button>
      </form>
    );
  }

  // ── Pick step (multiple subscriptions) ────────────────────────────────────────

  if (step === "pick" && lookup) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-[#001a18]" style={{ fontFamily: "var(--font-manrope)" }}>
            Select a plan to redeem
          </p>
          <p className="text-xs text-[#5c706a] mt-1">
            You have multiple active memberships. Which one would you like to use?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {lookup.subscriptions.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handlePickSub(sub)}
              className="w-full text-left bg-white border border-[#e4ede9] rounded-2xl px-5 py-4 hover:bg-[#e8f4f0] hover:border-[#b8ddd1] transition group flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <p className="text-[#001a18] text-sm font-bold leading-tight" style={{ fontFamily: "var(--font-manrope)" }}>
                  {sub.plan_name ?? "Membership Plan"}
                </p>
                <p className="text-[#5c706a] text-xs">
                  {allowanceLabel(sub.allowance_type, sub.allowance_amount, sub.usage_this_period)}
                </p>
                <p className="text-[#9ab0a8] text-xs">Valid until {formatDate(sub.period_end)}</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#9ab0a8] group-hover:text-[#1a5c48] flex-shrink-0 transition-colors"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => { setStep("phone"); setError(null); }}
          className="text-xs text-[#5c706a] underline underline-offset-2 text-center"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Subscription detail step ──────────────────────────────────────────────────

  if (step === "subscription" && lookup && selectedSub) {
    const sub = selectedSub;
    const autoRedeem = isAutoRedeem(sub.allowance_type);

    return (
      <div className="flex flex-col gap-4">
        {/* Customer card */}
        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4">
          <p className="text-xs text-[#5c706a] font-medium mb-1">Member</p>
          <p className="text-base font-bold text-[#001a18]" style={{ fontFamily: "var(--font-manrope)" }}>
            {lookup.customer.name}
          </p>
          <p className="text-sm text-[#5c706a]">{lookup.customer.phone}</p>
        </div>

        {/* Subscription card */}
        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-[#5c706a] font-medium mb-0.5">Plan</p>
            <p className="text-base font-bold text-[#001a18]" style={{ fontFamily: "var(--font-manrope)" }}>
              {sub.plan_name ?? "Membership Plan"}
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Allowance</span>
            <span className="font-semibold text-[#001a18]">
              {allowanceLabel(sub.allowance_type, sub.allowance_amount, sub.usage_this_period)}
            </span>
          </div>

          {sub.max_per_visit && (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Max per visit</span>
              <span className="font-semibold text-[#001a18]">
                {Math.floor(parseFloat(sub.max_per_visit))}{sub.max_per_visit_unit ? ` ${sub.max_per_visit_unit}` : ""}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Valid until</span>
            <span className="font-semibold text-[#001a18]">{formatDate(sub.period_end)}</span>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
        )}

        {autoRedeem ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void submitRedemption("1")}
            className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {loading && <Spinner />}
            {loading ? "Recording…" : "Redeem 1 visit"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setError(null); setStep("amount"); }}
            className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Enter amount
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep(lookup.subscriptions.length > 1 ? "pick" : "phone");
          }}
          className="text-xs text-[#5c706a] underline underline-offset-2 text-center"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── Amount step (weight_kg and loads) ────────────────────────────────────────

  if (step === "amount" && selectedSub) {
    const sub = selectedSub;
    const isLoads = sub.allowance_type === "loads";
    const maxPVLabel = sub.max_per_visit
      ? `${Math.floor(parseFloat(sub.max_per_visit))}${sub.max_per_visit_unit ? ` ${sub.max_per_visit_unit}` : ""} per ${isLoads ? "load" : "visit"}`
      : null;

    return (
      <form onSubmit={handleAmountSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="amount" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            {isLoads ? "How many loads?" : "Amount to redeem (kg)"}
          </label>
          <input
            id="amount"
            type="number"
            inputMode={isLoads ? "numeric" : "decimal"}
            min={isLoads ? "1" : "0.01"}
            step={isLoads ? "1" : "any"}
            placeholder={isLoads ? "e.g. 2" : "e.g. 0.5"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
          <p className="text-[#5c706a] text-xs mt-2">
            Remaining: {allowanceLabel(sub.allowance_type, sub.allowance_amount, sub.usage_this_period)}
            {maxPVLabel && (
              <span className="ml-2 text-[#9ab0a8]">· {maxPVLabel}</span>
            )}
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {loading && <Spinner />}
          {loading ? "Recording…" : "Confirm Redemption"}
        </button>

        <button
          type="button"
          onClick={() => { setStep("subscription"); setError(null); }}
          className="text-xs text-[#5c706a] underline underline-offset-2 text-center"
        >
          ← Back
        </button>
      </form>
    );
  }

  // ── Success step ──────────────────────────────────────────────────────────────

  if (step === "success" && selectedSub) {
    const sub = selectedSub;
    const redeemedAmount = result?.amount_redeemed ?? "1";
    const updatedUsage = String(parseFloat(sub.usage_this_period) + parseFloat(redeemedAmount));

    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e8f4f0] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a5c48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div>
          <h2
            className="text-xl font-extrabold text-[#001a18] mb-1"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Redeemed successfully!
          </h2>
          <p className="text-sm text-[#5c706a] leading-relaxed">
            Your visit has been logged.{" "}
            {lookup?.customer?.phone && "A confirmation SMS has been sent to your phone."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4 w-full text-left flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Plan</span>
            <span className="font-semibold text-[#001a18]">{sub.plan_name ?? "Membership Plan"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Redeemed</span>
            <span className="font-semibold text-[#001a18]">
              {redeemedAmount} {sub.allowance_type === "weight_kg" ? "kg" : sub.allowance_type === "loads" ? (parseInt(redeemedAmount) === 1 ? "load" : "loads") : "visit"}
            </span>
          </div>
          {sub.allowance_type && sub.allowance_type !== "unlimited" ? (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Remaining</span>
              <span className="font-semibold text-[#001a18]">
                {allowanceLabel(sub.allowance_type, sub.allowance_amount, updatedUsage)}
              </span>
            </div>
          ) : null}
          {redeemedAt && (
            <div className="flex justify-between text-sm pt-1 border-t border-[#e4ede9]">
              <span className="text-[#5c706a]">Date & time</span>
              <span className="font-semibold text-[#001a18] text-right">
                {redeemedAt.toLocaleString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
            </div>
          )}
          {result?.id && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-[#5c706a] shrink-0">Redemption ID</span>
              <span className="font-mono text-xs text-[#001a18] text-right ml-3 break-all">{result.id}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={reset}
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Done
        </button>
      </div>
    );
  }

  return null;
}

function Spinner() {
  return (
    <span
      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"
      aria-hidden
    />
  );
}
