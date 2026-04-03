interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "delivery";
}

const ORDER_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-purple-100 text-purple-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

const DELIVERY_COLORS: Record<string, string> = {
  delivery: "bg-blue-100 text-blue-800",
  pickup: "bg-green-100 text-green-800",
  shipping: "bg-indigo-100 text-indigo-800",
};

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  let colorClass = "bg-gray-100 text-gray-700";

  if (type === "order") colorClass = ORDER_COLORS[status] ?? colorClass;
  else if (type === "payment") colorClass = PAYMENT_COLORS[status] ?? colorClass;
  else if (type === "delivery") colorClass = DELIVERY_COLORS[status] ?? colorClass;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
