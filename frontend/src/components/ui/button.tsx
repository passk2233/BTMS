import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-600 text-white shadow-sm hover:bg-sky-700 active:bg-sky-800 focus-visible:ring-sky-500 border border-transparent",
  secondary:
    "bg-slate-100 text-slate-800 shadow-xs hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400 border border-slate-200",
  outline:
    "bg-white text-slate-700 border border-slate-300 shadow-xs hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus-visible:ring-sky-500",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 border border-transparent",
  destructive:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500 border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-md font-medium",
  md: "px-4 py-2 text-sm gap-2 rounded-lg font-medium",
  lg: "px-5 py-2.5 text-base gap-2.5 rounded-lg font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
