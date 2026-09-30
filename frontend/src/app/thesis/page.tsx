import { ModulePage } from "@/components/module-page";

export default function ThesisPage() {
  return (
    <ModulePage
      capabilities={["Create groups and theses", "Assign members and advisors", "Submit and review thesis topics"]}
      description="Manage thesis groups, topics, advisors, files, and revision workflows."
      title="Thesis & Group Management"
    />
  );
}
