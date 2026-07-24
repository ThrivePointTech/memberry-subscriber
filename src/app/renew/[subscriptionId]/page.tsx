import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RenewForm from "./RenewForm";

const API_URL = process.env.API_BASE_URL ?? "https://api.getmemberry.com";

interface SubscriptionInfo {
  id: string;
  plan_name: string | null;
  plan_price_centavos: number | null;
  billing_cycle: string | null;
  merchant_name: string | null;
  period_end: string;
  status: string;
}

async function fetchSubscription(subscriptionId: string): Promise<SubscriptionInfo | null> {
  try {
    const res = await fetch(`${API_URL}/public/subscriptions/${subscriptionId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as SubscriptionInfo;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subscriptionId: string }>;
}): Promise<Metadata> {
  const { subscriptionId } = await params;
  const sub = await fetchSubscription(subscriptionId);
  const planName = sub?.plan_name ?? "Subscription";
  return { title: `Renew ${planName} — Memberry` };
}

export default async function RenewPage({
  params,
}: {
  params: Promise<{ subscriptionId: string }>;
}) {
  const { subscriptionId } = await params;
  const sub = await fetchSubscription(subscriptionId);

  if (!sub) notFound();

  const eligibleStatuses = ["active", "past_due"];
  if (!eligibleStatuses.includes(sub.status)) notFound();

  const periodEnd = new Date(sub.period_end);
  const periodEndStr = periodEnd.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-16 pb-24 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-extrabold text-[#001a18] mb-1"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Renew your subscription
          </h1>
          {sub.merchant_name && (
            <p className="text-[#5c706a] text-sm">{sub.merchant_name}</p>
          )}
          {sub.status === "past_due" && (
            <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Your subscription expired on {periodEndStr}. Renew now to restore access.
            </p>
          )}
          {sub.status === "active" && (
            <p className="mt-2 text-sm text-[#5c706a]">
              Current period ends {periodEndStr}. Renewing now extends it immediately.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6">
          <RenewForm
            subscriptionId={subscriptionId}
            planName={sub.plan_name ?? "Your plan"}
            planPriceCentavos={sub.plan_price_centavos ?? 0}
            billingCycle={sub.billing_cycle}
          />
        </div>

        <p className="text-center text-[#5c706a] text-xs mt-6">
          Powered by PayMongo · Secured with 256-bit encryption
        </p>
      </div>
    </main>
  );
}
