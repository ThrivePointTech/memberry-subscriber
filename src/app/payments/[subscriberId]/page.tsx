import type { Metadata } from "next";
import PaymentRow, { type PaymentRowData } from "./PaymentRow";

const API_URL = process.env.API_BASE_URL ?? "https://api.getmemberry.com";

interface TransactionRow extends PaymentRowData {
  status: "pending" | "paid" | "failed" | "refunded";
}

// TEMPORARY (MEM-30): identifies the subscriber via a URL param instead of a
// session, matching /subscriptions/[subscriberId] (MEM-25) — this app has no
// login flow yet. Calls the existing GET /transactions?customer_id=
// endpoint, which has no authorization check — anyone with a subscriberId
// can view that customer's payment history. Adding real session-based auth
// to this route is tracked as separate follow-up work, not started yet.
async function fetchTransactions(subscriberId: string): Promise<TransactionRow[]> {
  try {
    const res = await fetch(`${API_URL}/transactions?customer_id=${subscriberId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data as TransactionRow[];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Payment History — Memberry",
};

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ subscriberId: string }>;
}) {
  const { subscriberId } = await params;
  const rows = await fetchTransactions(subscriberId);
  // Only successful payments are shown — failed/pending attempts aren't
  // "payments made" (see design.md D3). Filtered here, not in the API,
  // so the HQ admin view (which wants all statuses) is unaffected.
  const payments = rows.filter((row) => row.status === "paid");

  return (
    <main className="min-h-screen bg-[#f7faf9] flex items-start justify-center pt-4 pb-24 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1
            className="text-[#001a18] text-2xl font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Payment History
          </h1>
          <p className="text-[#5c706a] text-sm mt-1">
            A record of the payments you&apos;ve made across your subscriptions.
          </p>
        </div>

        {payments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e4ede9] p-8 text-center">
            <p className="text-[#5c706a] text-sm">
              You don&apos;t have any payment history yet.
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
