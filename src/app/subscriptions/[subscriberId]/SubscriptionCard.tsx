export interface SubscriptionRow {
  id: string;
  merchant_id: string;
  merchant_name: string | null;
  plan_name: string | null;
  plan_allowance_type: string | null;
  plan_allowance_amount: string | null;
  plan_price_centavos: number | null;
}

function formatPrice(centavos: number): string {
  return `₱${(centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatInclusions(type: string | null, amount: string | null): string {
  if (!type || type === "unlimited") return "Unlimited visits";
  if (type === "count" && amount) return `${Math.floor(parseFloat(amount))} sessions per cycle`;
  if (type === "loads" && amount) return `${Math.floor(parseFloat(amount))} loads per cycle`;
  if (type === "weight_kg" && amount) return `${amount} kg per cycle`;
  return "Inclusions unavailable";
}

export default function SubscriptionCard({ subscription }: { subscription: SubscriptionRow }) {
  return (
    <div className="bg-white border border-[#e4ede9] rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[#001a18] text-sm font-bold leading-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {subscription.plan_name ?? "Membership Plan"}
        </p>
        {subscription.plan_price_centavos != null && (
          <p
            className="text-[#001a18] text-sm font-bold shrink-0"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            {formatPrice(subscription.plan_price_centavos)}
            <span className="text-[#9ab0a8] font-normal text-xs">/mo</span>
          </p>
        )}
      </div>
      <p className="text-[#5c706a] text-xs mt-1">
        {formatInclusions(subscription.plan_allowance_type, subscription.plan_allowance_amount)}
      </p>
    </div>
  );
}
