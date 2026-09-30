import { ModulePage } from "@/components/module-page";

export default function ExaminationPage() {
  return (
    <ModulePage
      capabilities={["Schedule proposal and final exams", "Manage rooms and committees", "Record scores and comments"]}
      description="Coordinate examination schedules and display results calculated by the Go service."
      title="Examination"
    />
  );
}
