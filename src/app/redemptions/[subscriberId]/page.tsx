import type { Metadata } from "next";
import Link from "next/link";
import RedemptionRow, { type RedemptionRowData } from "./RedemptionRow";

const API_URL = process.env.API_BASE_URL ?? "https://api.getmemberry.com";
const PAGE_SIZE = 20;

// TEMPORARY (MEM-29): Identifies the subscriber via a URL param instead of a
// session, matching /subscriptions/[subscriberId] (MEM-25) and
// /payments/[subscriberId] (MEM-30) — this app has no login flow yet.
// Adding real session-based auth is tracked as separate follow-up work.
async function fetchRedemptions(
  subscriberId: string,
  page: number,
): Promise<RedemptionRowData[]> {
  try {
    const res = await fetch(
      `${API_URL}/redemptions?customer_id=${subscriberId}&limit=${PAGE_SIZE}&page=${page}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []) as RedemptionRowData[];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Redemption History — Memberry",
};

export default async function RedemptionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ subscriberId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { subscriberId } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const redemptions = await fetchRedemptions(subscriberId, currentPage);
  const hasNextPage = redemptions.length === PAGE_SIZE;

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-4 pb-24 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1
            className="text-[#001a18] text-2xl font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Redemption History
          </h1>
          <p className="text-[#5c706a] text-sm mt-1">
            A record of services and inclusions you&apos;ve redeemed.
          </p>
        </div>

        {redemptions.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {redemptions.map((redemption) => (
                <RedemptionRow key={redemption.id} redemption={redemption} />
              ))}
            </div>

            {(currentPage > 1 || hasNextPage) && (
              <div className="flex items-center justify-between mt-6 px-1">
                {currentPage > 1 ? (
                  <Link
                    href={`/redemptions/${subscriberId}?page=${currentPage - 1}`}
                    className="text-xs font-semibold text-[#142F2D] bg-white border border-[#e4ede9] px-4 py-2 rounded-xl hover:bg-[#f0f5f3] transition-colors"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <div />
                )}

                <span className="text-xs text-[#5c706a] font-medium">
                  Page {currentPage}
                </span>

                {hasNextPage ? (
                  <Link
                    href={`/redemptions/${subscriberId}?page=${currentPage + 1}`}
                    className="text-xs font-semibold text-[#142F2D] bg-white border border-[#e4ede9] px-4 py-2 rounded-xl hover:bg-[#f0f5f3] transition-colors"
                  >
                    Next →
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4ede9] p-8 text-center">
            <p className="text-[#5c706a] text-sm">
              You don&apos;t have any redemption history yet.
            </p>
          </div>
        )}

        <p className="text-center text-[#9ab0a8] text-xs mt-6">
          Powered by <span className="font-bold text-[#1a5c48]">Memberry</span>
        </p>
      </div>
    </main>
  );
}
