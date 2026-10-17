import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";

export interface StepItem {
  id: string;
  name: string;
  status: "complete" | "current" | "upcoming" | "revision";
  date?: string;
}

interface StepperProps {
  steps: StepItem[];
  className?: string;
}

export function Stepper({ steps, className = "" }: StepperProps) {
  return (
    <nav aria-label="Thesis Milestones Progress" className={`w-full overflow-x-auto py-2 ${className}`}>
      <ol className="flex items-center min-w-[700px] justify-between">
        {steps.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex-1">
              {/* Connector line */}
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 transition-colors ${
                    step.status === "complete" ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}

              <div className="group relative flex flex-col items-center text-center">
                {/* Node icon circle */}
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs ${
                    step.status === "complete"
                      ? "bg-emerald-500 text-white shadow-emerald-200"
                      : step.status === "current"
                      ? "bg-sky-600 text-white ring-4 ring-sky-100 shadow-sky-200"
                      : step.status === "revision"
                      ? "bg-amber-500 text-white ring-4 ring-amber-100 shadow-amber-200"
                      : "bg-white border-2 border-slate-300 text-slate-400"
                  }`}
                >
                  {step.status === "complete" ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : step.status === "current" ? (
                    <Clock className="h-4 w-4 animate-pulse" />
                  ) : step.status === "revision" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>

                {/* Node label */}
                <div className="mt-2.5 flex flex-col items-center">
                  <span
                    className={`text-xs font-semibold ${
                      step.status === "complete"
                        ? "text-slate-900"
                        : step.status === "current"
                        ? "text-sky-700 font-bold"
                        : step.status === "revision"
                        ? "text-amber-700 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  {step.date && (
                    <span className="text-[10px] text-slate-400 mt-0.5">{step.date}</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
