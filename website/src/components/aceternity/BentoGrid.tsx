"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-xl hover:shadow-primary/5",
        className
      )}
    >
      {header}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <h3 className="font-bold text-foreground text-lg">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
