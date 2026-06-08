import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import RedeemForm from "./RedeemForm";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}): Promise<Metadata> {
  const { merchantId } = await params;
  const merchant = await fetchMerchant(merchantId);
  if (!merchant) return { title: "Store not found — Memberry" };
  return {
    title: `Redeem at ${merchant.name} — Memberry`,
    description: `Redeem your subscription at ${merchant.name} via Memberry.`,
  };
}

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const { merchantId } = await params;
  const merchant = await fetchMerchant(merchantId);
  if (!merchant) notFound();

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
            href={`/shop/${merchant.id}`}
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
            Back to {merchant.name}
          </Link>
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
            <p className="text-[#5c706a] text-sm mt-1">Redeem your membership</p>
          </div>
        </div>

        <RedeemForm merchantId={merchant.id} />

        <p className="text-center text-[#9ab0a8] text-xs mt-8">Powered by Memberry</p>
      </div>
    </main>
  );
}
