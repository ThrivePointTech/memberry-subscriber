"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureEvent } from "@/lib/analytics";
import SavingsBadge from "@/components/SavingsBadge";

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
  savings_label: string | null;
  plan_services?: PlanService[];
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

const SERVICE_LIST_MAX_VISIBLE = 3;

function ServiceList({ services }: { services: PlanService[] }) {
  const visible = services.slice(0, SERVICE_LIST_MAX_VISIBLE);
  const overflow = services.length - visible.length;

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {visible.map((service) => (
        <div key={service.id} className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#1a5c48] shrink-0"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span className="flex-1 text-[#414847] text-sm truncate">{service.service_name}</span>
          <span className="text-[#5c706a] text-xs font-medium shrink-0">
            {service.allowance_count == null ? "Unlimited" : `×${service.allowance_count}`}
          </span>
        </div>
      ))}
      {overflow > 0 && (
        <span className="text-[#5c706a] text-xs pl-6">
          +{overflow} more service{overflow === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}

export default function PlanCard({ plan, merchantId }: { plan: Plan; merchantId: string }) {
  useEffect(() => {
    captureEvent("plan_viewed", { merchant_id: merchantId, plan_id: plan.id });
  }, [plan.id, merchantId]);

  const hasServices = !!plan.plan_services && plan.plan_services.length > 0;
  const allowance = hasServices
    ? null
    : formatAllowance(plan.allowance_type, plan.allowance_amount, plan.max_per_visit, plan.max_per_visit_unit);

  return (
    <div className="bg-white rounded-2xl border border-[#e4ede9] shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2
          className="text-[#001a18] text-lg font-extrabold leading-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {plan.name}
        </h2>
        <div className="flex flex-wrap gap-2 justify-end">
          <SavingsBadge label={plan.savings_label} />
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span
          className="text-3xl font-extrabold text-[#001a18]"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {formatPrice(plan.price_centavos)}
        </span>
        <span className="text-[#5c706a] text-sm">
          / {formatCycle(plan.billing_cycle)}
        </span>
      </div>

      {plan.description && (
        <p className="text-[#414847] text-sm leading-relaxed mb-3">{plan.description}</p>
      )}

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

      {hasServices && <ServiceList services={plan.plan_services!} />}

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
