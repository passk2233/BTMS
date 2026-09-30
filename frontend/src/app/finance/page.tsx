import { ModulePage } from "@/components/module-page";

export default function FinancePage() {
  return (
    <ModulePage
      capabilities={["Student fee status", "Payment-proof uploads", "Receipt and verification workflows"]}
      description="Manage financial records while keeping totals, rates, and calculations in the Go API."
      title="Financial Management"
    />
  );
}
