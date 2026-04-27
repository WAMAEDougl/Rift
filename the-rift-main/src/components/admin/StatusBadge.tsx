interface StatusBadgeProps {
  status: string;
  type?: "order" | "payment" | "delivery";
}

const ORDER_COLORS: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  confirmed: "bg-primary/10 text-primary",
  preparing: "bg-primary/10 text-primary",
  ready: "bg-secondary/10 text-secondary",
  dispatched: "bg-primary/10 text-primary",
  delivered: "bg-secondary/10 text-secondary",
  cancelled: "bg-destructive/10 text-destructive",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-primary/10 text-primary",
  completed: "bg-secondary/10 text-secondary",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

const DELIVERY_COLORS: Record<string, string> = {
  delivery: "bg-primary/10 text-primary",
  pickup: "bg-secondary/10 text-secondary",
  shipping: "bg-primary/10 text-primary",
};

export default function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  let colorClass = "bg-muted text-muted-foreground";

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
