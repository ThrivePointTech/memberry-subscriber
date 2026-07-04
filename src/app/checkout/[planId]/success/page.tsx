import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscribed! — Memberry",
};

const API_URL = process.env.API_BASE_URL ?? "https://api.getmemberry.com";

interface PlanService {
  id: string;
  service_name: string;
  allowance_count: number | null;
}

interface Plan {
  id: string;
  name: string;
  price_centavos: number;
  billing_cycle: "weekly" | "monthly" | "yearly";
  allowance_type: string;
  allowance_amount: string | null;
  description: string | null;
  merchant_name: string;
  merchant_id: string;
  plan_services?: PlanService[];
}

function formatServiceAllowance(services: PlanService[]): string {
  return services
    .map((s) => (s.allowance_count == null ? `${s.service_name} (unlimited)` : `${s.service_name} ×${s.allowance_count}`))
    .join(" · ");
}

async function fetchPlan(planId: string): Promise<Plan | null> {
  try {
    const res = await fetch(`${API_URL}/plans/${planId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Plan;
  } catch {
    return null;
  }
}

function formatPrice(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatCycle(cycle: Plan["billing_cycle"]): string {
  return { weekly: "week", monthly: "month", yearly: "year" }[cycle];
}

function formatAllowance(type: string, amount: string | null): string | null {
  if (type === "unlimited") return "Unlimited visits";
  if (type === "count" && amount) return `${amount}x per cycle`;
  if (type === "weight_kg" && amount) return `${amount} kg per cycle`;
  return null;
}

function getNextBillingDate(cycle: Plan["billing_cycle"]): string {
  const date = new Date();
  if (cycle === "monthly") date.setMonth(date.getMonth() + 1);
  else if (cycle === "weekly") date.setDate(date.getDate() + 7);
  else date.setFullYear(date.getFullYear() + 1);
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = await fetchPlan(planId);
  const nextBillingDate = plan ? getNextBillingDate(plan.billing_cycle) : null;
  const allowance = plan
    ? plan.plan_services && plan.plan_services.length > 0
      ? formatServiceAllowance(plan.plan_services)
      : formatAllowance(plan.allowance_type, plan.allowance_amount)
    : null;

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-16 pb-24 px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8">
          <span
            className="text-[#001a18] text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            memberry
          </span>
        </div>

        {/* Success card */}
        <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-8 mb-4">
          {/* Check icon */}
          <div className="w-16 h-16 bg-[#e8f4f0] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a5c48"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1
            className="text-[#001a18] text-2xl font-extrabold mb-2"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            You&apos;re subscribed!
          </h1>

          {plan ? (
            <>
              <p className="text-[#5c706a] text-sm mb-6">
                {plan.merchant_name}
              </p>

              <div className="bg-[#f7faf9] rounded-xl border border-[#e4ede9] p-4 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#5c706a] text-sm">Plan</span>
                  <span className="text-[#001a18] text-sm font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5c706a] text-sm">Price</span>
                  <span className="text-[#001a18] text-sm font-semibold">
                    {formatPrice(plan.price_centavos)} / {formatCycle(plan.billing_cycle)}
                  </span>
                </div>
                {allowance && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#5c706a] text-sm">Included</span>
                    <span className="text-[#001a18] text-sm font-semibold">{allowance}</span>
                  </div>
                )}
                {nextBillingDate && (
                  <div className="flex justify-between items-center pt-1 border-t border-[#e4ede9]">
                    <span className="text-[#5c706a] text-sm">Next billing</span>
                    <span className="text-[#001a18] text-sm font-semibold">{nextBillingDate}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-[#414847] text-sm leading-relaxed">
              Your subscription is now active.
            </p>
          )}
        </div>

        {/* Redeem prompt */}
        {plan && (
          <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6 mb-4 text-center">
            <p
              className="text-[#001a18] text-base font-bold mb-1"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Ready to use your membership?
            </p>
            <p className="text-[#5c706a] text-sm mb-4">
              Redeem your first visit right now.
            </p>
            <Link
              href={`/redeem/${plan.merchant_id}`}
              className="inline-block w-full bg-[#142F2D] text-white font-bold text-sm py-3.5 rounded-xl hover:bg-[#1e4a47] transition"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Redeem now
            </Link>
          </div>
        )}

        <p className="text-[#5c706a] text-xs mt-4">
          <Link href="/" className="underline hover:text-[#001a18]">
            Back to Memberry
          </Link>
        </p>
      </div>
    </main>
  );
}
