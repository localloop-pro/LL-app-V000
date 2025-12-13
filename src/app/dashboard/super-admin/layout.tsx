import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { SuperAdminSidebar } from "./components/super-admin-sidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check admin access
  const session = await requireAdmin();

  if (!session) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background text-foreground">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}

