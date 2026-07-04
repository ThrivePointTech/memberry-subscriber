import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CheckoutForm from "./CheckoutForm";

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
  max_per_visit: string | null;
  max_per_visit_unit: string | null;
  description: string | null;
  tags: string[] | null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planId: string }>;
}): Promise<Metadata> {
  const { planId } = await params;
  const plan = await fetchPlan(planId);
  if (!plan) return { title: "Plan not found — Memberry" };
  return {
    title: `${plan.name} at ${plan.merchant_name} — Memberry`,
    description: plan.description ?? `Subscribe to ${plan.name} at ${plan.merchant_name}.`,
  };
}

function formatPrice(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatCycle(cycle: Plan["billing_cycle"]): string {
  return { weekly: "week", monthly: "month", yearly: "year" }[cycle];
}

function formatAllowance(type: string, amount: string | null, maxPerVisit: string | null, maxPerVisitUnit: string | null): string | null {
  const maxSuffix = maxPerVisit
    ? ` · max ${Math.floor(parseFloat(maxPerVisit))}${maxPerVisitUnit ? ` ${maxPerVisitUnit}` : ""}/visit`
    : "";
  if (type === "unlimited") return "Unlimited visits";
  if (type === "count" && amount) return `${Math.floor(parseFloat(amount))} sessions per cycle${maxSuffix}`;
  if (type === "loads" && amount) return `${Math.floor(parseFloat(amount))} loads per cycle${maxSuffix}`;
  if (type === "weight_kg" && amount) return `${amount} kg per cycle${maxSuffix}`;
  return null;
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = await fetchPlan(planId);
  if (!plan) notFound();

  const allowance =
    plan.plan_services && plan.plan_services.length > 0
      ? formatServiceAllowance(plan.plan_services)
      : formatAllowance(plan.allowance_type, plan.allowance_amount, plan.max_per_visit, plan.max_per_visit_unit);

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-8 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.jpeg" alt="Memberry" className="h-16 w-auto rounded-2xl" />
        </div>

        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href={`/shop/${plan.merchant_id}`}
            className="inline-flex items-center gap-1 text-[#5c706a] text-sm hover:text-[#1a5c48] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            All plans from {plan.merchant_name}
          </Link>
        </div>

        {/* Plan card */}
        <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6 mb-6">
          <span className="text-[#5c706a] text-sm font-medium mb-1 inline-block">
            {plan.merchant_name}
          </span>
          <h1
            className="text-[#001a18] text-2xl font-extrabold leading-tight mb-3"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {plan.name}
          </h1>

          <div className="flex items-baseline gap-1 mb-3">
            <span
              className="text-3xl font-extrabold text-[#001a18]"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {formatPrice(plan.price_centavos)}
            </span>
            <span className="text-[#5c706a] text-sm">/ {formatCycle(plan.billing_cycle)}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {allowance && (
              <span className="inline-block bg-[#e8f4f0] text-[#1a5c48] text-xs font-semibold px-3 py-1 rounded-full">
                {allowance}
              </span>
            )}
            {plan.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-block bg-[#fff3e0] text-[#b45309] text-xs font-semibold px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {plan.description && (
            <p className="text-[#414847] text-sm leading-relaxed mt-4">{plan.description}</p>
          )}
        </div>

        <CheckoutForm
          planId={plan.id}
          merchantId={plan.merchant_id}
          hasServices={!!plan.plan_services && plan.plan_services.length > 0}
        />

        {/* Already a member — redeem link */}
        <Link
          href={`/redeem/${plan.merchant_id}`}
          className="mt-6 flex items-center justify-between w-full bg-[#142F2D] rounded-2xl px-5 py-4 group transition-colors hover:bg-[#1E4A46]"
        >
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <div>
              <p className="text-[#a8c8be] text-xs leading-none mb-0.5">Already a member?</p>
              <p
                className="text-white text-sm font-semibold leading-tight"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Redeem your subscription
              </p>
            </div>
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
            className="text-white flex-shrink-0"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        {/* Escape hatch for users who read all the way down */}
        <p className="text-center text-[#5c706a] text-xs mt-6">
          Not what you were looking for?{" "}
          <Link
            href={`/shop/${plan.merchant_id}`}
            className="underline hover:text-[#1a5c48] transition-colors"
          >
            View all plans from {plan.merchant_name}
          </Link>
        </p>
      </div>
    </main>
  );
}
