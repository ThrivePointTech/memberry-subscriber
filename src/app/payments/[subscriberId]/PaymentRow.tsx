export interface PaymentRowData {
  id: string;
  created_at: string;
  // BIGINT column — the pg driver may return this as a numeric string
  // depending on type-parser config, so accept either.
  amount_centavos: number | string;
  payment_method: string | null;
  plan_name: string | null;
  merchant_name: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(centavos: number | string): string {
  return `₱${(Number(centavos) / 100).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatPaymentMethod(method: string | null): string {
  switch (method) {
    case "card":
      return "Card";
    case "maya":
      return "Maya";
    case "gcash":
      return "GCash";
    default:
      return "—";
  }
}

export default function PaymentRow({ payment }: { payment: PaymentRowData }) {
  return (
    <div className="bg-white border border-[#e4ede9] rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <p
          className="text-[#001a18] text-sm font-bold leading-tight"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {payment.plan_name ?? "Membership Plan"}
        </p>
        <p
          className="text-[#001a18] text-sm font-bold shrink-0"
          style={{ fontFamily: "var(--font-manrope)" }}
        >
          {formatPrice(payment.amount_centavos)}
        </p>
      </div>
      <p className="text-[#5c706a] text-xs mt-1">
        {payment.merchant_name ?? "Merchant"} · {formatPaymentMethod(payment.payment_method)}
      </p>
      <p className="text-[#9ab0a8] text-xs mt-1">{formatDate(payment.created_at)}</p>
    </div>
  );
}
