import { ModulePage } from "@/components/module-page";

export default function DisbursementPage() {
  return (
    <ModulePage
      capabilities={["Committee payment requests", "Disbursement approvals", "Payment status history"]}
      description="Review backend-created committee payments and disbursement records."
      title="Disbursement"
    />
  );
}
