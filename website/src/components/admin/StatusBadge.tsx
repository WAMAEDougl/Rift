interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "delivery";
}

const ORDER_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-amber-50 text-amber-700",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-orange-50 text-orange-700",
  dispatched: "bg-amber-200 text-amber-900",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-stone-100 text-stone-600",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-stone-100 text-stone-600",
};

const DELIVERY_COLORS: Record<string, string> = {
  delivery: "bg-orange-100 text-orange-800",
  pickup: "bg-green-100 text-green-800",
  shipping: "bg-amber-100 text-amber-800",
};

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  let colorClass = "bg-slate-100 text-slate-600";

  if (type === "order") colorClass = ORDER_COLORS[status] ?? colorClass;
  else if (type === "payment") colorClass = PAYMENT_COLORS[status] ?? colorClass;
  else if (type === "delivery") colorClass = DELIVERY_COLORS[status] ?? colorClass;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide capitalize ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
