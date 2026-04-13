interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "delivery";
}

const ORDER_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-purple-100 text-purple-700",
  dispatched: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
};

const DELIVERY_COLORS: Record<string, string> = {
  delivery: "bg-blue-100 text-blue-700",
  pickup: "bg-green-100 text-green-700",
  shipping: "bg-indigo-100 text-indigo-700",
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
