"use client";

import { useState, useTransition, useEffect, type FormEvent } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.getmemberry.com";

const ASSETS_URL = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/$/, "");

function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${ASSETS_URL}/${path}`;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-[#c8d9d3] bg-white text-[#001a18] text-base placeholder:text-[#9ab0a8] focus:outline-none focus:ring-2 focus:ring-[#142F2D] disabled:opacity-50 transition";

const PHONE_PREFIX = "+63";

const labelClass = "block text-sm font-semibold text-[#001a18] mb-2";

const STORAGE_VERSION = 1;
const STALE_MS = 30 * 60 * 1000;

type Step = "info" | "method-picker" | "paying" | "setup-pin" | "qr-success" | "redeem-prompt" | "download";

const METHOD_LABELS: Record<string, string> = {
  gcash: "GCash",
  paymaya: "Maya",
  card: "Credit / Debit Card",
};

interface Staff {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

interface Subscription {
  id: string;
  allowance_type: "unlimited" | "count" | "weight_kg" | "loads" | null;
}

interface StoredCheckout {
  version: number;
  planId: string;
  merchantId: string;
  name: string;
  phone: string;
  step: Exclude<Step, "info" | "method-picker" | "paying">;
  enrollmentSessionId: string | null;
  subscription: Subscription | null;
  staffs: Staff[] | null;
  subscribedAtISO: string | null;
  savedAt: number;
}

export default function CheckoutForm({
  planId,
  merchantId,
  hasServices = false,
}: {
  planId: string;
  merchantId: string;
  hasServices?: boolean;
}) {
  const storageKey = `memberry_checkout__${planId}`;

  const [recovering, setRecovering] = useState(true);
  const [step, setStep] = useState<Step>("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [enrollmentSessionId, setEnrollmentSessionId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingSub, setHasExistingSub] = useState(false);
  const [existingSubId, setExistingSubId] = useState<string | null>(null);
  const [subscribedAt, setSubscribedAt] = useState<Date | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpMonth, setCardExpMonth] = useState("");
  const [cardExpYear, setCardExpYear] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardPaying, setCardPaying] = useState(false);
  const [, startTransition] = useTransition();

  const fullPhone = `${PHONE_PREFIX}${phone.trim()}`;

  // ── sessionStorage helpers ───────────────────────────────────────────────────

  function persistCheckout(patch: Partial<StoredCheckout>) {
    try {
      const raw = sessionStorage.getItem(storageKey);
      const existing: Partial<StoredCheckout> = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(storageKey, JSON.stringify({ ...existing, ...patch, savedAt: Date.now() }));
    } catch { /* storage unavailable */ }
  }

  function clearCheckout() {
    try { sessionStorage.removeItem(storageKey); } catch { /* ignore */ }
  }

  // ── Recovery on mount ────────────────────────────────────────────────────────

  useEffect(() => {
    async function recover() {
      let stored: StoredCheckout | null = null;
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (!raw) { setRecovering(false); return; }
        const parsed = JSON.parse(raw) as StoredCheckout;
        if (
          parsed.version !== STORAGE_VERSION ||
          parsed.planId !== planId ||
          Date.now() - parsed.savedAt > STALE_MS
        ) {
          clearCheckout();
          setRecovering(false);
          return;
        }
        stored = parsed;
      } catch {
        clearCheckout();
        setRecovering(false);
        return;
      }

      setName(stored.name);
      setPhone(stored.phone);
      const storedFullPhone = `${PHONE_PREFIX}${stored.phone}`;

      function restoreSubscribedAt(iso: string | null) {
        const d = iso ? new Date(iso) : null;
        setSubscribedAt(d && !isNaN(d.getTime()) ? d : new Date());
      }

      try {
        switch (stored.step) {
          case "setup-pin": {
            try {
              const lr = await fetch(
                `${API_URL}/public/redeem/lookup?phone=${encodeURIComponent(storedFullPhone)}&merchant_id=${encodeURIComponent(merchantId)}`
              );
              if (lr.ok) {
                const lj = await lr.json();
                if (lj.data?.customer?.has_pin === true) {
                  setEnrollmentSessionId(stored.enrollmentSessionId);
                  setSubscription(stored.subscription);
                  setStaffs(stored.staffs ?? []);
                  restoreSubscribedAt(stored.subscribedAtISO);
                  persistCheckout({ step: "qr-success" });
                  setStep("qr-success");
                  break;
                }
              }
            } catch { /* fall through */ }
            setEnrollmentSessionId(stored.enrollmentSessionId);
            setSubscription(stored.subscription);
            setStaffs(stored.staffs ?? []);
            restoreSubscribedAt(stored.subscribedAtISO);
            setStep("setup-pin");
            break;
          }
          case "qr-success":
            setEnrollmentSessionId(stored.enrollmentSessionId);
            setSubscription(stored.subscription);
            setStaffs(stored.staffs ?? []);
            restoreSubscribedAt(stored.subscribedAtISO);
            setStep("qr-success");
            break;
          case "redeem-prompt":
            if (!stored.subscription) {
              setEnrollmentSessionId(stored.enrollmentSessionId);
              restoreSubscribedAt(stored.subscribedAtISO);
              persistCheckout({ step: "download" });
              setStep("download");
            } else {
              setEnrollmentSessionId(stored.enrollmentSessionId);
              setSubscription(stored.subscription);
              restoreSubscribedAt(stored.subscribedAtISO);
              setStep("redeem-prompt");
            }
            break;
          case "download":
            setEnrollmentSessionId(stored.enrollmentSessionId);
            setSubscription(stored.subscription);
            restoreSubscribedAt(stored.subscribedAtISO);
            setStep("download");
            break;
          default:
            clearCheckout();
        }
      } catch {
        clearCheckout();
      }
      setRecovering(false);
    }
    void recover();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step === "download") clearCheckout();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Step 1: collect name + phone → createSession → method-picker ─────────────

  function handleInfoSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setHasExistingSub(false);
    setExistingSubId(null);

    const trimmedName = name.trim();
    if (!trimmedName) { setError("Please enter your name."); return; }
    if (!phone.trim()) { setError("Please enter your phone number."); return; }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address, or leave it blank.");
      return;
    }

    startTransition(async () => {
      let eligibilityRes: Response;
      try {
        eligibilityRes = await fetch(
          `${API_URL}/public/plans/${planId}/eligibility?phone=${encodeURIComponent(fullPhone)}`
        );
      } catch {
        setError("Something went wrong. Please try again.");
        return;
      }

      if (!eligibilityRes.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const eligibilityJson = await eligibilityRes.json();
      if (!eligibilityJson.data?.eligible) {
        setExistingSubId(eligibilityJson.data?.subscriptionId ?? null);
        setHasExistingSub(true);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/public/checkout/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_id: planId,
            phone: fullPhone,
            customer_name: trimmedName,
            ...(trimmedEmail ? { email: trimmedEmail } : {}),
          }),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError((json as { error?: string }).error ?? "Failed to start checkout. Please try again.");
          return;
        }
        const json = await res.json();
        const sessionId: string = json.data?.enrollment_session_id;
        const methods: string[] = json.data?.payment_methods ?? ["gcash"];
        if (!sessionId) {
          setError("Failed to create checkout session. Please try again.");
          return;
        }
        setEnrollmentSessionId(sessionId);
        setPaymentMethods(methods);
        setStep("method-picker");
      } catch {
        setError("Network error. Please try again.");
      }
    });
  }

  // ── Step 2: method selection → initiate payment ───────────────────────────────

  function handleMethodSelect(method: string) {
    setSelectedMethod(method);
    setError(null);

    if (method === "card") {
      setStep("paying");
      return;
    }

    startTransition(async () => {
      setStep("paying");
      try {
        if (method === "gcash") {
          const res = await fetch(`${API_URL}/public/checkout/pay/gcash`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enrollment_session_id: enrollmentSessionId }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            setError((json as { error?: string }).error ?? "Payment failed. Please try again.");
            setStep("method-picker");
            return;
          }
          const json = await res.json();
          const redirectUrl: string = json.data?.redirect_url;
          if (!redirectUrl) { setError("No redirect URL returned."); setStep("method-picker"); return; }
          window.location.href = redirectUrl;
        } else {
          const res = await fetch(`${API_URL}/public/checkout/pay/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enrollment_session_id: enrollmentSessionId, payment_method_type: method }),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            setError((json as { error?: string }).error ?? "Payment failed. Please try again.");
            setStep("method-picker");
            return;
          }
          const json = await res.json();
          const redirectUrl: string = json.data?.redirect_url;
          if (!redirectUrl) { setError("No redirect URL returned."); setStep("method-picker"); return; }
          window.location.href = redirectUrl;
        }
      } catch {
        setError("Network error. Please try again.");
        setStep("method-picker");
      }
    });
  }

  // ── Card: tokenize client-side via PayMongo public key, then pay ──────────────

  async function handleCardPay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const pmPublicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY ?? "";
    if (!pmPublicKey) { setError("Card payments are not configured."); return; }
    setCardPaying(true);
    try {
      const pmRes = await fetch("https://api.paymongo.com/v1/payment_methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${btoa(`${pmPublicKey}:`)}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: "card",
              details: {
                card_number: cardNumber.replace(/\s/g, ""),
                exp_month: parseInt(cardExpMonth, 10),
                exp_year: parseInt(cardExpYear, 10),
                cvc: cardCvc,
              },
              billing: { name: name.trim() },
            },
          },
        }),
      });
      const pmJson = await pmRes.json();
      if (!pmRes.ok) {
        setError((pmJson.errors?.[0]?.detail as string | undefined) ?? "Card tokenization failed. Check your card details.");
        return;
      }
      const pmId: string = pmJson.data?.id;
      if (!pmId) { setError("Card tokenization failed."); return; }

      const res = await fetch(`${API_URL}/public/checkout/pay/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment_session_id: enrollmentSessionId,
          payment_method_type: "card",
          payment_method_id: pmId,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? "Payment failed. Please try again.");
        return;
      }
      const json = await res.json();
      const redirectUrl: string = json.data?.redirect_url;
      if (redirectUrl) window.location.href = redirectUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCardPaying(false);
    }
  }

  // ── Step 2b: PIN setup ────────────────────────────────────────────────────────

  async function handlePinSetup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(pin)) { setError("PIN must be exactly 6 digits."); return; }
    if (pin !== pinConfirm) { setError("PINs do not match. Please try again."); return; }
    setPinLoading(true);
    try {
      const res = await fetch(`${API_URL}/public/customer/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, name: name.trim(), pin }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError((json as { error?: string }).error ?? "Failed to save PIN. Please try again.");
        return;
      }
      persistCheckout({ step: "qr-success" });
      setStep("qr-success");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPinLoading(false);
    }
  }

  // ── Step 3: staff attribution ─────────────────────────────────────────────────

  function handleStaffAttributionSubmit() {
    if (selectedStaffId && enrollmentSessionId) {
      fetch(`${API_URL}/public/checkout/staff-attribution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment_session_id: enrollmentSessionId,
          staff_id: selectedStaffId,
        }),
      }).catch(() => {});
    }
    persistCheckout({ step: "redeem-prompt" });
    setStep("redeem-prompt");
  }

  // ── Step 4: instant redemption ───────────────────────────────────────────────

  async function handleRedeemNow() {
    if (!subscription) return;
    setRedeeming(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/public/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscription.id,
          merchant_id: merchantId,
          amount_redeemed: "1",
          pin: pin || undefined,
        }),
      });
      if (res.ok) {
        persistCheckout({ step: "download" });
        setStep("download");
      } else {
        setError("Redemption failed. Please try again at the counter.");
      }
    } catch {
      setError("Redemption failed. Please try again at the counter.");
    } finally {
      setRedeeming(false);
    }
  }

  // ── Renders ───────────────────────────────────────────────────────────────────

  if (recovering) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (step === "info") {
    return (
      <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Your name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Phone number
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
              className="flex-1 px-4 py-3 bg-white text-[#001a18] text-base placeholder:text-[#9ab0a8] focus:outline-none disabled:opacity-50"
            />
          </div>
          <p className="text-[#5c706a] text-xs mt-2">
            We&apos;ll use this to connect your payment to your Memberry profile.
          </p>
        </div>

        <div>
          <label htmlFor="email" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Email for receipts <span className="font-normal text-[#9ab0a8]">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {hasExistingSub && (
          <div className="rounded-xl border border-[#b8ddd1] bg-[#e8f4f0] px-4 py-3" role="alert">
            <p className="text-sm font-semibold text-[#1a5c48]" style={{ fontFamily: "var(--font-manrope)" }}>
              You already have an active subscription to this plan.
            </p>
            <p className="text-xs text-[#2d7a5f] mt-0.5">
              Want to use it?{" "}
              <a
                href={existingSubId ? `/redeem/${merchantId}?sub=${existingSubId}` : `/redeem/${merchantId}`}
                className="underline font-semibold hover:text-[#1a5c48]"
              >
                Redeem your subscription instead
              </a>
            </p>
          </div>
        )}

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

        <p className="text-center text-[#5c706a] text-xs">
          Secured with 256-bit encryption
        </p>
      </form>
    );
  }

  if (step === "method-picker") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#001a18] mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
            Choose payment method
          </h2>
          <p className="text-sm text-[#5c706a]">Select how you&apos;d like to pay for your subscription.</p>
        </div>

        {error && <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>}

        <div className="flex flex-col gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => handleMethodSelect(method)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-[#c8d9d3] bg-white text-[#001a18] font-semibold text-base hover:bg-[#f0f5f4] hover:border-[#142F2D] transition text-left"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {METHOD_LABELS[method] ?? method}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "paying") {
    if (selectedMethod === "card") {
      return (
        <form onSubmit={handleCardPay} className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#001a18] mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
              Card details
            </h2>
            <p className="text-sm text-[#5c706a]">Your card details are sent directly to PayMongo — never stored on our servers.</p>
          </div>

          <div>
            <label htmlFor="card-number" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>Card number</label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
              maxLength={16}
              className={inputClass}
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="card-exp-month" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>Exp. month</label>
              <input
                id="card-exp-month"
                type="text"
                inputMode="numeric"
                placeholder="MM"
                value={cardExpMonth}
                onChange={(e) => setCardExpMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                maxLength={2}
                className={inputClass}
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="card-exp-year" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>Exp. year</label>
              <input
                id="card-exp-year"
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                value={cardExpYear}
                onChange={(e) => setCardExpYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className={inputClass}
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="card-cvc" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>CVC</label>
              <input
                id="card-cvc"
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                maxLength={4}
                className={inputClass}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={cardPaying}
            className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {cardPaying && <Spinner />}
            {cardPaying ? "Processing…" : "Pay now"}
          </button>

          <button
            type="button"
            onClick={() => { setStep("method-picker"); setError(null); }}
            className="w-full text-[#5c706a] text-sm font-medium py-2 hover:text-[#001a18] transition"
          >
            ← Back to payment methods
          </button>
        </form>
      );
    }

    return (
      <div className="flex flex-col items-center gap-5 py-8">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-[#001a18]" style={{ fontFamily: "var(--font-manrope)" }}>
          Preparing your payment…
        </p>
        <p className="text-xs text-[#5c706a]">You&apos;ll be redirected to complete payment.</p>
      </div>
    );
  }

  if (step === "setup-pin") {
    return (
      <form onSubmit={handlePinSetup} className="flex flex-col gap-4">
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-full bg-[#e8f4f0] flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a5c48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-lg font-extrabold text-[#001a18]" style={{ fontFamily: "var(--font-manrope)" }}>
            Secure your account
          </h2>
          <p className="text-sm text-[#5c706a] mt-1">
            Create a 6-digit PIN to protect your membership. You&apos;ll use it every time you redeem.
          </p>
        </div>

        <div>
          <label htmlFor="pin" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Create PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="• • • • • •"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="pin-confirm" className={labelClass} style={{ fontFamily: "var(--font-manrope)" }}>
            Confirm PIN
          </label>
          <input
            id="pin-confirm"
            type="password"
            inputMode="numeric"
            placeholder="• • • • • •"
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
        )}

        <button
          type="submit"
          disabled={pinLoading}
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {pinLoading && <Spinner />}
          {pinLoading ? "Saving…" : "Set PIN"}
        </button>
      </form>
    );
  }

  if (step === "qr-success") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 bg-[#e8f4f0] border border-[#b8ddd1] rounded-2xl px-4 py-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a5c48] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1a5c48]" style={{ fontFamily: "var(--font-manrope)" }}>
              Payment received!
            </p>
            <p className="text-xs text-[#2d7a5f]">Your subscription is now active.</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#001a18] mb-1" style={{ fontFamily: "var(--font-manrope)" }}>
            Who helped you today?
          </p>
          <p className="text-xs text-[#5c706a]">
            Select a staff member if someone assisted you, or choose None.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {staffs.map((staff) => {
            const isSelected = selectedStaffId === staff.id;
            const initials = staff.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? "")
              .join("");
            return (
              <button
                key={staff.id}
                type="button"
                onClick={() => setSelectedStaffId(isSelected ? null : staff.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition ${
                  isSelected ? "bg-[#e8f4f0]" : "hover:bg-[#f7faf9]"
                }`}
              >
                <div
                  className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-base font-bold transition ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-[#1a5c48]"
                      : "ring-1 ring-[#e4ede9]"
                  } ${staff.profile_picture_url ? "" : "bg-[#142F2D] text-white"}`}
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {assetUrl(staff.profile_picture_url) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={assetUrl(staff.profile_picture_url)!}
                      alt={staff.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span
                  className={`text-xs font-medium w-full text-center leading-tight line-clamp-2 ${
                    isSelected ? "text-[#1a5c48]" : "text-[#001a18]"
                  }`}
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {staff.name}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedStaffId(null)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition ${
              selectedStaffId === null ? "bg-[#e8f4f0]" : "hover:bg-[#f7faf9]"
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition bg-[#f0f5f4] ${
                selectedStaffId === null
                  ? "ring-2 ring-offset-2 ring-[#1a5c48]"
                  : "ring-1 ring-[#e4ede9]"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ab0a8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <span
              className={`text-xs font-medium w-full text-center leading-tight ${
                selectedStaffId === null ? "text-[#1a5c48]" : "text-[#5c706a]"
              }`}
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              None
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleStaffAttributionSubmit}
          className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "redeem-prompt") {
    return (
      <div className="flex flex-col items-center gap-6 py-2 text-center">
        <div className="w-16 h-16 rounded-full bg-[#e8f4f0] flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a5c48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <div>
          <h2
            className="text-xl font-extrabold text-[#001a18] mb-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Subscription active!
          </h2>
          <p className="text-sm text-[#5c706a] leading-relaxed">
            Would you like to redeem your first visit right now?
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {subscription &&
          !hasServices &&
          subscription.allowance_type !== "weight_kg" &&
          subscription.allowance_type !== "loads" ? (
            <button
              type="button"
              onClick={handleRedeemNow}
              disabled={redeeming}
              className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {redeeming ? <><Spinner />Redeeming…</> : "Yes, redeem now"}
            </button>
          ) : (
            <a
              href={`/redeem/${merchantId}`}
              className="w-full bg-[#142F2D] text-white font-bold text-base py-3.5 rounded-xl hover:bg-[#1e4a47] transition text-center"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Yes, redeem now
            </a>
          )}
          {error && (
            <p className="text-red-600 text-sm font-medium" role="alert">{error}</p>
          )}
          <button
            type="button"
            onClick={() => {
              persistCheckout({ step: "download" });
              setStep("download");
            }}
            className="w-full bg-white border border-[#c8d9d3] text-[#5c706a] font-semibold text-base py-3.5 rounded-xl hover:bg-[#f0f5f4] transition"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // "download" step
  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
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
          You&apos;re all set!
        </h2>
        <p className="text-sm text-[#5c706a] leading-relaxed">
          Download the Memberry app to track your membership,<br />
          view visit history, and redeem your benefits.
        </p>
      </div>

      {(subscribedAt || subscription?.id || enrollmentSessionId) && (
        <div className="bg-white rounded-2xl border border-[#e4ede9] p-4 w-full text-left flex flex-col gap-2">
          {subscribedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-[#5c706a]">Date & time</span>
              <span className="font-semibold text-[#001a18] text-right">
                {subscribedAt.toLocaleString("en-PH", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
            </div>
          )}
          {subscription?.id && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-[#5c706a] shrink-0">Subscription ID</span>
              <span className="font-mono text-xs text-[#001a18] text-right ml-3 break-all">{subscription.id}</span>
            </div>
          )}
          {enrollmentSessionId && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-[#5c706a] shrink-0">Session ID</span>
              <span className="font-mono text-xs text-[#001a18] text-right ml-3 break-all">{enrollmentSessionId}</span>
            </div>
          )}
        </div>
      )}

      {/* App store badges — re-enable when apps are live */}
      <p className="text-center text-[#5c706a] text-sm">
        📱 Our app is <span className="font-semibold text-[#1a5c48]">coming soon </span> on iOS &amp; Android.
      </p>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Spinner({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls = size === "lg"
    ? "w-8 h-8 border-2 border-[#142F2D] border-t-transparent rounded-full animate-spin"
    : "w-4 h-4 border-2 border-[#9ab0a8] border-t-transparent rounded-full animate-spin shrink-0";
  return <span className={cls} aria-hidden />;
}
