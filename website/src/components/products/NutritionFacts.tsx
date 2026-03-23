"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, Leaf } from "lucide-react";
import type { NutritionInfo } from "@/lib/nutrition";

export default function NutritionFacts({ info }: { info: NutritionInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="font-bold text-foreground">Nutrition Facts</span>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Serving Size */}
          <div className="pb-3 border-b-4 border-black">
            <p className="text-sm text-muted-foreground">Serving Size</p>
            <p className="font-bold text-foreground">{info.servingSize}</p>
          </div>

          {/* Main Nutrients */}
          {info.calories !== undefined && (
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="font-bold text-lg">Calories</span>
              <span className="font-bold text-2xl">{info.calories}</span>
            </div>
          )}

          <div className="space-y-1.5 text-sm">
            {info.fat && (
              <NutrientRow label="Total Fat" value={info.fat} bold />
            )}
            {info.sodium && (
              <NutrientRow label="Sodium" value={info.sodium} />
            )}
            {info.carbs && (
              <NutrientRow label="Total Carbohydrate" value={info.carbs} bold />
            )}
            {info.fiber && (
              <NutrientRow label="Dietary Fiber" value={info.fiber} indent />
            )}
            {info.sugar && (
              <NutrientRow label="Total Sugars" value={info.sugar} indent />
            )}
            {info.protein && (
              <NutrientRow label="Protein" value={info.protein} bold />
            )}
            {info.iron && <NutrientRow label="Iron" value={info.iron} />}
            {info.calcium && (
              <NutrientRow label="Calcium" value={info.calcium} />
            )}
          </div>

          {/* Additional Nutrients */}
          {info.additionalNutrients && info.additionalNutrients.length > 0 && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Special Nutrients
              </p>
              {info.additionalNutrients.map((n) => (
                <div key={n.name} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{n.name}</span>
                  <span className="text-foreground font-medium">{n.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Allergens */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Allergens
              </span>
            </div>
            <p className="text-sm text-foreground/80">{info.allergens.join(", ")}</p>
          </div>

          {/* Dietary Info */}
          <div className="flex flex-wrap gap-1.5">
            {info.dietaryInfo.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"
              >
                <Leaf className="w-3 h-3" />
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NutrientRow({
  label,
  value,
  bold,
  indent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between py-1 border-b border-border ${
        indent ? "pl-4" : ""
      }`}
    >
      <span className={bold ? "font-bold text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={bold ? "font-bold text-foreground" : "text-foreground/80"}>
        {value}
      </span>
    </div>
  );
}
