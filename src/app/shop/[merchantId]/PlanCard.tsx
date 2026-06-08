"use client";

import Link from "next/link";

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

export default function PlanCard({ plan }: { plan: Plan }) {
  const allowance = formatAllowance(plan.allowance_type, plan.allowance_amount, plan.max_per_visit, plan.max_per_visit_unit);

  return (
    <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2
          className="text-[#001a18] text-lg font-extrabold leading-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {plan.name}
        </h2>
        <div className="text-right shrink-0">
          <span
            className="text-xl font-extrabold text-[#001a18]"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {formatPrice(plan.price_centavos)}
          </span>
          <span className="text-[#5c706a] text-xs block">
            / {formatCycle(plan.billing_cycle)}
          </span>
        </div>
      </div>

      {(allowance || (plan.tags && plan.tags.length > 0)) && (
        <div className="flex flex-wrap gap-2 mb-3">
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
      )}

      {plan.description && (
        <p className="text-[#414847] text-sm leading-relaxed mb-4">{plan.description}</p>
      )}

      <Link
        href={`/checkout/${plan.id}`}
        className="block w-full text-center bg-[#142F2D] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#1e4a47] transition"
        style={{ fontFamily: "var(--font-manrope)" }}
      >
        Subscribe
      </Link>
    </div>
  );
}
