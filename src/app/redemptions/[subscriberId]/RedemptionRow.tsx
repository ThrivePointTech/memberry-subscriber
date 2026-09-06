export interface RedemptionRowData {
  id: string;
  redeemed_at: string;
  amount_redeemed: string;
  merchant_name: string;
  plan_name: string;
  plan_service_name: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RedemptionRow({ redemption }: { redemption: RedemptionRowData }) {
  const inclusionName = redemption.plan_service_name || "Standard Service";

  return (
    <div className="bg-white border border-[#e4ede9] rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[#001a18] text-sm font-bold leading-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {redemption.plan_name ?? "Subscription Plan"}
        </p>
      </div>
      <p className="text-[#142F2D] text-xs font-semibold mt-1">
        {inclusionName}
      </p>
      <p className="text-[#5c706a] text-xs mt-1">
        {redemption.merchant_name ?? "Merchant"} · {formatDate(redemption.redeemed_at)}
      </p>
    </div>
  );
}
