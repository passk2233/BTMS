import { ModulePage } from "@/components/module-page";

export default function PrintingPage() {
  return (
    <ModulePage
      capabilities={["Printing requests", "Order status tracking", "Delivery confirmation"]}
      description="Track printing requests and costs calculated by the Go service."
      title="Printing Management"
    />
  );
}
