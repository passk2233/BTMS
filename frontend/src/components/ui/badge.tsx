import React from "react";

export type BadgeVariant = "slate" | "sky" | "emerald" | "amber" | "rose" | "violet";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dotColor: "bg-slate-400",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dotColor: "bg-sky-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dotColor: "bg-rose-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dotColor: "bg-violet-500",
  },
};

export function Badge({ variant = "slate", children, dot = true, className = "", ...props }: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap shrink-0 transition-colors ${styles.bg} ${styles.text} ${styles.border} ${className}`}
      {...props}
    >
      {dot && <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dotColor}`} />}
      {children}
    </span>
  );
}
