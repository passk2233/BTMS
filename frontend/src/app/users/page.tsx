import { ModulePage } from "@/components/module-page";

export default function UsersPage() {
  return (
    <ModulePage
      capabilities={["Role-aware user listing", "Student and teacher profiles", "Account administration"]}
      description="Manage user records and role assignments through authorized Go API endpoints."
      title="User Management"
    />
  );
}
