import { ModulePage } from "@/components/module-page";

export default function ReportsPage() {
  return (
    <ModulePage
      capabilities={["Thesis and examination reports", "Financial and payment reports", "PDF, Excel, and CSV exports"]}
      description="Provide report filters and exports supplied by the backend."
      title="Reports"
    />
  );
}
