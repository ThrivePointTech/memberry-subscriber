"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.getmemberry.com";

const ASSETS_URL = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/$/, "");

function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${ASSETS_URL}/${path}`;
}

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

type PollStatus = "waiting" | "paid" | "failed" | "timeout";

interface MerchantInfo {
  name: string;
  profile_picture_url: string | null;
}

const FAILED_STATUSES = new Set(["failed", "cancelled", "expired"]);

export default function PaymentStatusPage() {
  const params = useParams<{ planId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const planId = params.planId;
  const paymentIntentId = searchParams.get("payment_intent_id");
  const qrImageUrl = searchParams.get("qr");

  const [pollStatus, setPollStatus] = useState<PollStatus>("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);
  const startedAt = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadMerchant() {
      try {
        const planRes = await fetch(`${API_URL}/plans/${planId}`);
        if (!planRes.ok) return;
        const planJson = await planRes.json();
        const merchantId: string = planJson.data?.merchant_id;
        if (!merchantId) return;
        const mRes = await fetch(`${API_URL}/public/merchant/${merchantId}`);
        if (!mRes.ok) return;
        const mJson = await mRes.json();
        setMerchant({ name: mJson.data.name, profile_picture_url: mJson.data.profile_picture_url ?? null });
      } catch { /* non-critical */ }
    }
    loadMerchant();
  }, [planId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!paymentIntentId) {
      setPollStatus("failed");
      setErrorMessage("Missing payment reference. Please go back and try again.");
      return;
    }

    async function checkStatus() {
      if (Date.now() - startedAt.current > TIMEOUT_MS) {
        setPollStatus("timeout");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/public/checkout/payment-status/${paymentIntentId}`
        );
        if (!res.ok) return; // transient — keep polling
        const json = await res.json();
        const status: string = json.data?.status ?? "";

        if (status === "paid") {
          if (timerRef.current) clearInterval(timerRef.current);
          setPollStatus("paid");
          router.replace(`/checkout/${planId}/success`);
        } else if (FAILED_STATUSES.has(status)) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPollStatus("failed");
          setErrorMessage("Payment was not completed. Please go back and try again.");
        }
        // Otherwise keep polling
      } catch {
        // Network hiccup — keep polling
      }
    }

    // Check immediately, then on interval
    checkStatus();
    timerRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paymentIntentId, planId, router]);

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-16 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Merchant header */}
        {merchant && (
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            {assetUrl(merchant.profile_picture_url) ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={assetUrl(merchant.profile_picture_url)!}
                alt={merchant.name}
                className="w-16 h-16 rounded-full object-cover ring-1 ring-[#e4ede9]"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full bg-[#142F2D] text-white flex items-center justify-center text-xl font-bold"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                {merchant.name.trim()[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <span
              className="text-[#001a18] text-base font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {merchant.name}
            </span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-8 text-center">
          {pollStatus === "waiting" && (
            <>
              {qrImageUrl ? (
                /* GCash QR fallback — show scannable QR */
                <>
                  <p
                    className="text-[#001a18] text-lg font-extrabold mb-2"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    Scan to pay with GCash
                  </p>
                  <p className="text-[#5c706a] text-sm mb-6">
                    Open your GCash app and scan this QR code to complete payment.
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageUrl}
                    alt="GCash QR code"
                    className="mx-auto w-52 h-52 rounded-xl border border-[#e4ede9]"
                  />
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Spinner />
                    <p className="text-[#5c706a] text-sm">Waiting for payment…</p>
                  </div>
                </>
              ) : (
                /* Standard waiting state after redirect */
                <>
                  <div className="flex justify-center mb-4">
                    <Spinner size="lg" />
                  </div>
                  <p
                    className="text-[#001a18] text-lg font-extrabold mb-2"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    Waiting for payment…
                  </p>
                  <p className="text-[#5c706a] text-sm">
                    Complete the payment in your app or browser tab. This page will update automatically.
                  </p>
                </>
              )}
            </>
          )}

          {pollStatus === "timeout" && (
            <>
              <div className="w-16 h-16 bg-[#fff7ed] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c27a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p
                className="text-[#001a18] text-lg font-extrabold mb-2"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Taking longer than expected
              </p>
              <p className="text-[#5c706a] text-sm mb-6">
                Check your GCash or Maya app to confirm the payment. If it went through, your subscription will activate shortly.
              </p>
              <a
                href={`/checkout/${planId}/success`}
                className="inline-block text-sm text-[#142F2D] font-semibold underline underline-offset-2"
              >
                I already paid — check status
              </a>
            </>
          )}

          {pollStatus === "failed" && (
            <>
              <div className="w-16 h-16 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p
                className="text-[#001a18] text-lg font-extrabold mb-2"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Payment not completed
              </p>
              <p className="text-[#5c706a] text-sm mb-6">
                {errorMessage ?? "Something went wrong. Please try again."}
              </p>
              <a
                href={`/checkout/${planId}`}
                className="inline-block w-full bg-[#142F2D] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#1e4a47] transition text-center"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Try again
              </a>
            </>
          )}
        </div>

        <p className="text-center text-[#5c706a] text-xs mt-6">
          Powered by PayMongo · Secured with 256-bit encryption
        </p>
      </div>
    </main>
  );
}

function Spinner({ size = "sm" }: { size?: "sm" | "lg" }) {
  const cls =
    size === "lg"
      ? "w-10 h-10 border-2 border-[#142F2D] border-t-transparent rounded-full animate-spin"
      : "w-4 h-4 border-2 border-[#5c706a] border-t-transparent rounded-full animate-spin shrink-0";
  return <span className={cls} aria-hidden />;
}
