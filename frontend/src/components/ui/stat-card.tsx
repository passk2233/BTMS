import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  description,
  icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-950 tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                ? "text-rose-600"
                : "text-slate-500"
            }`}
          >
            {trend === "up" && <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />}
            {trend === "down" && <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />}
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
