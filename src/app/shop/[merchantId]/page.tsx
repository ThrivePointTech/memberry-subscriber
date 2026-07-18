import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PlanCard from "./PlanCard";

const API_URL = process.env.API_BASE_URL ?? "https://api.getmemberry.com";
const ASSETS_URL = (process.env.NEXT_PUBLIC_ASSETS_URL ?? "").replace(/\/$/, "");

function assetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${ASSETS_URL}/${path}`;
}

interface Merchant {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

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
  max_per_visit: string | null;
  max_per_visit_unit: string | null;
  tags: string[] | null;
  status: string;
  plan_services?: PlanService[];
}

async function fetchMerchant(merchantId: string): Promise<Merchant | null> {
  try {
    const res = await fetch(`${API_URL}/public/merchant/${merchantId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as Merchant;
  } catch {
    return null;
  }
}

async function fetchPlans(merchantId: string): Promise<Plan[]> {
  try {
    const res = await fetch(`${API_URL}/plans?merchant_id=${merchantId}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const plans = json.data as Plan[];
    return plans.filter((p) => p.status === "active");
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}): Promise<Metadata> {
  const { merchantId } = await params;
  const merchant = await fetchMerchant(merchantId);
  if (!merchant) return { title: "Store not found — Memberry" };
  return {
    title: `${merchant.name} — Memberry`,
    description: `Subscribe to a plan at ${merchant.name} via Memberry.`,
  };
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const { merchantId } = await params;

  const [merchant, plans] = await Promise.all([
    fetchMerchant(merchantId),
    fetchPlans(merchantId),
  ]);

  if (!merchant) notFound();
  if (plans.length === 1) redirect(`/checkout/${plans[0].id}`);

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-8 pb-24 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.jpeg" alt="Memberry" className="h-16 w-auto rounded-2xl" />
        </div>

        {/* Merchant header */}
        <div className="mb-6 flex items-center gap-4">
          {assetUrl(merchant.profile_picture_url) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={assetUrl(merchant.profile_picture_url)!}
              alt={merchant.name}
              className="w-16 h-16 rounded-full object-cover ring-1 ring-[#e4ede9] shrink-0"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-[#142F2D] text-white flex items-center justify-center text-xl font-bold shrink-0"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              {merchant.name.trim()[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
          <h1
            className="text-[#001a18] text-2xl font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {merchant.name}
          </h1>
          <p className="text-[#5c706a] text-sm mt-1">
            {plans.length > 0
              ? "Choose a membership plan to get started."
              : "No plans available right now."}
          </p>
          </div>
        </div>

        {/* Plan list */}
        {plans.length > 0 ? (
          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4ede9] p-8 text-center">
            <p className="text-[#5c706a] text-sm">
              This merchant doesn&apos;t have any active plans yet.
            </p>
          </div>
        )}

        {/* Redeem entry point */}
        <Link
          href={`/redeem/${merchant.id}`}
          className="mt-6 flex items-center justify-between w-full bg-[#142F2D] rounded-2xl px-5 py-4 transition-colors hover:bg-[#1E4A46] group"
        >
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h.01" />
                <path d="M18 14h.01" />
                <path d="M14 18h.01" />
                <path d="M18 18h.01" />
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

        <p className="text-center text-[#9ab0a8] text-xs mt-6">Powered by Memberry</p>
      </div>
    </main>
  );
}
