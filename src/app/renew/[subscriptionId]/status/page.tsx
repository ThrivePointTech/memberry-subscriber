"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.getmemberry.com";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 10 * 60 * 1000;

type PollStatus = "waiting" | "renewed" | "failed" | "timeout";

const FAILED_STATUSES = new Set(["failed", "cancelled", "expired"]);

export default function RenewalStatusPage() {
  const params = useParams<{ subscriptionId: string }>();
  const searchParams = useSearchParams();

  const subscriptionId = params.subscriptionId;
  const paymentIntentId = searchParams.get("payment_intent_id");

  const [pollStatus, setPollStatus] = useState<PollStatus>("waiting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        if (!res.ok) return;
        const json = await res.json();
        const status: string = json.data?.status ?? "";

        if (status === "paid") {
          if (timerRef.current) clearInterval(timerRef.current);
          setPollStatus("renewed");
        } else if (FAILED_STATUSES.has(status)) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPollStatus("failed");
          setErrorMessage("Payment was not completed. Please try again.");
        }
      } catch {
        // Keep polling on network hiccup
      }
    }

    checkStatus();
    timerRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paymentIntentId]);

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-16 pb-24 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-8 text-center">
          {pollStatus === "waiting" && (
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
                Complete the GCash payment in your app or browser. This page will update automatically.
              </p>
            </>
          )}

          {pollStatus === "renewed" && (
            <>
              <div className="w-16 h-16 bg-[#e8f4f0] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a5c48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p
                className="text-[#001a18] text-xl font-extrabold mb-2"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Renewed successfully!
              </p>
              <p className="text-[#5c706a] text-sm mb-6">
                Your subscription has been renewed. You can now continue using your benefits.
              </p>
              <a
                href={`/renew/${subscriptionId}`}
                className="text-sm text-[#142F2D] font-semibold underline underline-offset-2"
              >
                Back to subscription
              </a>
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
                Check your GCash app to confirm the payment. If it went through, your subscription will renew shortly.
              </p>
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
                href={`/renew/${subscriptionId}`}
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
