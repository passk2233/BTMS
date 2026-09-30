import { ModulePage } from "@/components/module-page";

export default function ProgressPage() {
  return (
    <ModulePage
      capabilities={["Live thesis stage updates", "Development activity tracking", "Advisor status updates"]}
      description="Present progress calculated by the backend and synchronized through Supabase Realtime."
      title="Progress Tracking"
    />
  );
}
