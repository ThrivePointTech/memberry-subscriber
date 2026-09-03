import type { Metadata } from "next";
import SubscriptionCard, { type SubscriptionRow } from "./SubscriptionCard";

const API_URL = process.env.API_BASE_URL ?? "https://api.getmemberry.com";

interface MerchantGroup {
  merchant_id: string;
  merchant_name: string | null;
  subscriptions: SubscriptionRow[];
}

// TEMPORARY (MEM-25): identifies the subscriber via a URL param instead of a
// session, since memberry-subscriber has no login flow yet. Calls the
// existing GET /subscriptions?customer_id= endpoint, which has no
// authorization check — anyone with a subscriberId can view that customer's
// subscriptions. Adding real session-based auth to this route is tracked as
// separate follow-up work, not started yet.
async function fetchSubscriptions(subscriberId: string): Promise<SubscriptionRow[]> {
  try {
    const res = await fetch(`${API_URL}/subscriptions?customer_id=${subscriberId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data as SubscriptionRow[];
  } catch {
    return [];
  }
}

// This endpoint returns a flat, already-sorted (created_at desc) list, so
// grouping happens here, preserving sort order (the merchant of the most
// recent subscription forms the first group).
function groupByMerchant(rows: SubscriptionRow[]): MerchantGroup[] {
  const groups: MerchantGroup[] = [];
  const indexByMerchant = new Map<string, number>();
  for (const row of rows) {
    let idx = indexByMerchant.get(row.merchant_id);
    if (idx === undefined) {
      idx = groups.length;
      indexByMerchant.set(row.merchant_id, idx);
      groups.push({ merchant_id: row.merchant_id, merchant_name: row.merchant_name, subscriptions: [] });
    }
    groups[idx].subscriptions.push(row);
  }
  return groups;
}

export const metadata: Metadata = {
  title: "My Subscriptions — Memberry",
};

export default async function SubscriptionsPage({
  params,
}: {
  params: Promise<{ subscriberId: string }>;
}) {
  const { subscriberId } = await params;
  const rows = await fetchSubscriptions(subscriberId);
  const groups = groupByMerchant(rows);

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-4 pb-24 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1
            className="text-[#001a18] text-2xl font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            My Subscriptions
          </h1>
          <p className="text-[#5c706a] text-sm mt-1">
            Everything you&apos;re subscribed to, grouped by merchant.
          </p>
        </div>

        {groups.length > 0 ? (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <section key={group.merchant_id} className="flex flex-col gap-3">
                <h2
                  className="text-[#1a5c48] text-sm font-bold"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {group.merchant_name ?? "Merchant"}
                </h2>
                <div className="flex flex-col gap-4">
                  {group.subscriptions.map((sub) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4ede9] p-8 text-center">
            <p className="text-[#5c706a] text-sm">
              You don&apos;t have any subscriptions yet.
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
