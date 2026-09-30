import { ModulePage } from "@/components/module-page";

export default function DashboardPage() {
  return (
    <ModulePage
      capabilities={["Thesis status totals", "Examination-stage overview", "Finance and printing summaries"]}
      description="A role-aware overview of thesis, examination, finance, and printing activity."
      title="Dashboard"
    />
  );
}
