"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.getmemberry.com";

const PHONE_PREFIX = "+63";

const POLL_INTERVAL_MS = 2500;

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#c8d9d3] bg-white text-[#001a18] text-base placeholder:text-[#9ab0a8] focus:outline-none focus:ring-2 focus:ring-[#142F2D] disabled:opacity-50 transition";

const labelClass = "block text-sm font-semibold text-[#001a18] mb-2";

type Step =
  | "phone"
  | "pin"
  | "pick"
  | "subscription"
  | "amount"
  | "awaiting-scan"
  | "success";

interface SubscriptionService {
  plan_service_id: string;
  service_name: string;
  allowance_count: number | null;
  usage_count: number;
}

interface SubscriptionService {
  plan_service_id: string;
  service_name: string;
  allowance_count: number | null;
  usage_count: number;
}

interface Subscription {
  id: string;
  plan_name: string | null;
  allowance_type: string | null;
  allowance_amount: string | null;
  max_per_visit: string | null;
  max_per_visit_unit: string | null;
  usage_this_period: string;
  period_end: string;
  services: SubscriptionService[];
}

interface LookupResult {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    has_pin: boolean;
  };
  subscriptions: Subscription[];
}

interface RedemptionResult {
  id: string;
  amount_redeemed: string;
}

interface RedemptionToken {
  token: string;
  nonce: string;
  expires_at: string;
}

type TokenStatus =
  | { status: "pending" }
  | { status: "expired" }
  | {
      status: "confirmed";
      redemption_id: string;
      amount_redeemed: string;
      redeemed_at: string;
    };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function allowanceLabel(
  type: string | null,
  amount: string | null,
  usage: string,
): string {
  if (!type || type === "unlimited") return "Unlimited";
  const total = parseFloat(amount ?? "0");
  const used = parseFloat(usage);
  const remaining = Math.max(0, total - used);
  if (type === "count")
    return `${remaining} of ${total} visit${total !== 1 ? "s" : ""} remaining`;
  if (type === "loads")
    return `${remaining} of ${total} load${total !== 1 ? "s" : ""} remaining`;
  if (type === "weight_kg")
    return `${remaining.toFixed(2)} of ${total} kg remaining`;
  return "";
}

function serviceRemainingLabel(service: SubscriptionService): string {
  if (service.allowance_count == null) return "Unlimited";
  const remaining = Math.max(0, service.allowance_count - service.usage_count);
  return `${remaining} of ${service.allowance_count} remaining`;
}

function servicesSummary(services: SubscriptionService[]): string {
  if (services.length === 0) return "";
  return services
    .map((s) => `${s.service_name}: ${serviceRemainingLabel(s)}`)
    .join(" · ");
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
  const [selectedService, setSelectedService] =
    useState<SubscriptionService | null>(null);
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [redeemedAt, setRedeemedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redemptionToken, setRedemptionToken] =
    useState<RedemptionToken | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  // Remembered so "Generate a new QR" can re-request the same redemption.
  const [lastRedeem, setLastRedeem] = useState<{
    amount: string;
    planServiceId?: string;
  } | null>(null);

  const fullPhone = `${PHONE_PREFIX}${phone.trim()}`;

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/public/redeem/lookup?phone=${encodeURIComponent(fullPhone)}&merchant_id=${encodeURIComponent(merchantId)}`,
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
    if (!/^\d{6}$/.test(pin)) {
      setError("Please enter your 6-digit PIN.");
      return;
    }
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

  // Requests a redemption QR token — nothing is deducted until merchant staff
  // scan the QR and confirm it.
  async function submitRedemption(
    amountRedeemed: string,
    planServiceId?: string,
  ) {
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
          plan_service_id: planServiceId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not start redemption. Please try again.");
        return;
      }
      setLastRedeem({ amount: amountRedeemed, planServiceId });
      setRedemptionToken(json.data as RedemptionToken);
      setTokenExpired(false);
      setStep("awaiting-scan");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // Poll for staff confirmation while the QR is displayed.
  useEffect(() => {
    if (step !== "awaiting-scan" || !redemptionToken || tokenExpired) return;
    const nonce = redemptionToken.nonce;
    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${API_URL}/redemptions/token-status/${encodeURIComponent(nonce)}`,
        );
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const status = json.data as TokenStatus;
        if (cancelled) return;
        if (status.status === "confirmed") {
          setResult({
            id: status.redemption_id,
            amount_redeemed: status.amount_redeemed,
          });
          setRedeemedAt(new Date(status.redeemed_at));
          setStep("success");
        } else if (status.status === "expired") {
          setTokenExpired(true);
        }
      } catch {
        // Transient polling failure — keep trying until expiry.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step, redemptionToken, tokenExpired]);

  // Countdown to token expiry.
  useEffect(() => {
    if (step !== "awaiting-scan" || !redemptionToken) return;
    const expiresAt = new Date(redemptionToken.expires_at).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setTokenExpired(true);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [step, redemptionToken]);

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
    setSelectedService(null);
    setAmount("1");
    setResult(null);
    setRedeemedAt(null);
    setError(null);
    setLoading(false);
    setRedemptionToken(null);
    setTokenExpired(false);
    setSecondsLeft(0);
    setLastRedeem(null);
  }

  // ── Phone step ────────────────────────────────────────────────────────────────

  if (step === "phone") {
    return (
      <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="phone"
            className={labelClass}
            style={{ fontFamily: "var(--font-manrope)" }}
          >
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
                const digits = e.target.value
                  .replace(/\D/g, "")
                  .replace(/^0+/, "");
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
          <p className="text-red-600 text-sm font-medium" role="alert">
            {error}
          </p>
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
          <p
            className="text-base font-bold text-[#001a18]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {lookup.customer.name}
          </p>
          <p className="text-sm text-[#5c706a]">{lookup.customer.phone}</p>
        </div>

        <div>
          <label
            htmlFor="pin"
            className={labelClass}
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Enter your 6-digit PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="• • • • • •"
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            autoComplete="current-password"
            autoFocus
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">
            {error}
          </p>
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
          onClick={() => {
            setStep("phone");
            setError(null);
            setPin("");
          }}
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
          <p
            className="text-sm font-semibold text-[#001a18]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Select a plan to redeem
          </p>
          <p className="text-xs text-[#5c706a] mt-1">
            You have multiple active memberships. Which one would you like to
            use?
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
                <p
                  className="text-[#001a18] text-sm font-bold leading-tight"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {sub.plan_name ?? "Membership Plan"}
                </p>
                <p className="text-[#5c706a] text-xs">
                  {sub.services.length > 0
                    ? servicesSummary(sub.services)
                    : allowanceLabel(
                        sub.allowance_type,
                        sub.allowance_amount,
                        sub.usage_this_period,
                      )}
                </p>
                <p className="text-[#9ab0a8] text-xs">
                  Valid until {formatDate(sub.period_end)}
                </p>
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
          onClick={() => {
            setStep("phone");
            setError(null);
          }}
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
          <p
            className="text-base font-bold text-[#001a18]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {lookup.customer.name}
          </p>
          <p className="text-sm text-[#5c706a]">{lookup.customer.phone}</p>
        </div>

        {/* Subscription card */}
        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-[#5c706a] font-medium mb-0.5">Plan</p>
            <p
              className="text-base font-bold text-[#001a18]"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {sub.plan_name ?? "Membership Plan"}
            </p>
          </div>

          {sub.services.length === 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Allowance</span>
              <span className="font-semibold text-[#001a18]">
                {allowanceLabel(
                  sub.allowance_type,
                  sub.allowance_amount,
                  sub.usage_this_period,
                )}
              </span>
            </div>
          )}

          {sub.max_per_visit && (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Max per visit</span>
              <span className="font-semibold text-[#001a18]">
                {Math.floor(parseFloat(sub.max_per_visit))}
                {sub.max_per_visit_unit ? ` ${sub.max_per_visit_unit}` : ""}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Valid until</span>
            <span className="font-semibold text-[#001a18]">
              {formatDate(sub.period_end)}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">
            {error}
          </p>
        )}

        {sub.services.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#5c706a] font-medium">
              Select a service to redeem
            </p>
            {sub.services.map((svc) => {
              const exhausted =
                svc.allowance_count != null &&
                svc.usage_count >= svc.allowance_count;
              return (
                <button
                  key={svc.plan_service_id}
                  type="button"
                  disabled={loading || exhausted}
                  onClick={() => {
                    setSelectedService(svc);
                    void submitRedemption("1", svc.plan_service_id);
                  }}
                  className="w-full text-left bg-white border border-[#e4ede9] rounded-xl px-4 py-3 hover:bg-[#e8f4f0] hover:border-[#b8ddd1] transition disabled:opacity-50 disabled:hover:bg-white flex items-center justify-between"
                >
                  <span className="text-sm font-semibold text-[#001a18]">
                    {svc.service_name}
                  </span>
                  <span className="text-xs text-[#5c706a]">
                    {exhausted ? "Exhausted" : serviceRemainingLabel(svc)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : autoRedeem ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void submitRedemption("1")}
            className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {loading && <Spinner />}
            {loading ? "Generating QR…" : "Redeem 1 visit"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep("amount");
            }}
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
          <label
            htmlFor="amount"
            className={labelClass}
            style={{ fontFamily: "var(--font-manrope)" }}
          >
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
            Remaining:{" "}
            {allowanceLabel(
              sub.allowance_type,
              sub.allowance_amount,
              sub.usage_this_period,
            )}
            {maxPVLabel && (
              <span className="ml-2 text-[#9ab0a8]">· {maxPVLabel}</span>
            )}
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {loading && <Spinner />}
          {loading ? "Generating QR…" : "Confirm Redemption"}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("subscription");
            setError(null);
          }}
          className="text-xs text-[#5c706a] underline underline-offset-2 text-center"
        >
          ← Back
        </button>
      </form>
    );
  }

  // ── Awaiting-scan step (QR + polling) ────────────────────────────────────────

  if (step === "awaiting-scan" && selectedSub && redemptionToken) {
    const sub = selectedSub;
    const qrValue = JSON.stringify({ t: "rd", token: redemptionToken.token });
    const mm = Math.floor(secondsLeft / 60);
    const ss = String(secondsLeft % 60).padStart(2, "0");

    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div>
          <h2
            className="text-xl font-extrabold text-[#001a18] mb-1"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {tokenExpired ? "QR code expired" : "Show this QR to the staff"}
          </h2>
          <p className="text-sm text-[#5c706a] leading-relaxed">
            {tokenExpired
              ? "No worries — generate a new one and show it to the staff."
              : "Your redemption is confirmed once the staff scans this code."}
          </p>
        </div>

        <div
          className={`bg-white rounded-2xl border border-[#e4ede9] p-5 ${tokenExpired ? "opacity-30" : ""}`}
          data-testid="redemption-qr"
        >
          <QRCode value={qrValue} size={208} aria-label="Redemption QR code" />
        </div>

        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4 w-full text-left flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Plan</span>
            <span className="font-semibold text-[#001a18]">
              {sub.plan_name ?? "Membership Plan"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Redeeming</span>
            <span className="font-semibold text-[#001a18]">
              {selectedService
                ? selectedService.service_name
                : `${lastRedeem?.amount ?? "1"} ${sub.allowance_type === "weight_kg" ? "kg" : sub.allowance_type === "loads" ? (parseInt(lastRedeem?.amount ?? "1") === 1 ? "load" : "loads") : "visit"}`}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">
            {error}
          </p>
        )}

        {tokenExpired ? (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void submitRedemption(
                lastRedeem?.amount ?? "1",
                lastRedeem?.planServiceId,
              )
            }
            className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {loading && <Spinner />}
            {loading ? "Generating…" : "Generate a new QR"}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-[#5c706a]">
            <span
              className="w-4 h-4 border-2 border-[#142F2D] border-t-transparent rounded-full animate-spin shrink-0"
              aria-hidden
            />
            Waiting for staff to scan · expires in {mm}:{ss}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setRedemptionToken(null);
            setTokenExpired(false);
            setError(null);
            setStep("subscription");
          }}
          className="text-xs text-[#5c706a] underline underline-offset-2 text-center"
        >
          ← Cancel
        </button>
      </div>
    );
  }

  // ── Success step ──────────────────────────────────────────────────────────────

  if (step === "success" && selectedSub) {
    const sub = selectedSub;
    const redeemedAmount = result?.amount_redeemed ?? "1";
    const updatedUsage = String(
      parseFloat(sub.usage_this_period) + parseFloat(redeemedAmount),
    );

    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e8f4f0] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a5c48"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
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
            {lookup?.customer?.phone &&
              "A confirmation SMS has been sent to your phone."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4 w-full text-left flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Plan</span>
            <span className="font-semibold text-[#001a18]">
              {sub.plan_name ?? "Membership Plan"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#5c706a]">Redeemed</span>
            <span className="font-semibold text-[#001a18]">
              {selectedService
                ? selectedService.service_name
                : `${redeemedAmount} ${sub.allowance_type === "weight_kg" ? "kg" : sub.allowance_type === "loads" ? (parseInt(redeemedAmount) === 1 ? "load" : "loads") : "visit"}`}
            </span>
          </div>
          {selectedService ? (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Remaining</span>
              <span className="font-semibold text-[#001a18]">
                {selectedService.allowance_count == null
                  ? "Unlimited"
                  : serviceRemainingLabel({
                      ...selectedService,
                      usage_count: selectedService.usage_count + 1,
                    })}
              </span>
            </div>
          ) : sub.allowance_type && sub.allowance_type !== "unlimited" ? (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Remaining</span>
              <span className="font-semibold text-[#001a18]">
                {allowanceLabel(
                  sub.allowance_type,
                  sub.allowance_amount,
                  updatedUsage,
                )}
              </span>
            </div>
          ) : null}
          {redeemedAt && (
            <div className="flex justify-between text-sm pt-1 border-t border-[#e4ede9]">
              <span className="text-[#5c706a]">Date & time</span>
              <span className="font-semibold text-[#001a18] text-right">
                {redeemedAt.toLocaleString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          )}
          {result?.id && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-[#5c706a] shrink-0">Redemption ID</span>
              <span className="font-mono text-xs text-[#001a18] text-right ml-3 break-all">
                {result.id}
              </span>
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
